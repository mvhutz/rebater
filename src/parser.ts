import { promises as fs } from 'fs';
import { z } from 'zod';
import { ParserContext, Rebate, RebateSchema, SourceFile, Supplier, SupplierSchema } from "./schema";

export async function loadSupplier(path: string) {
  const file = await fs.readFile(path, 'utf-8');
    const json = JSON.parse(file);
    return await SupplierSchema.parseAsync(json);
}

async function evaluateExpression(expression: Expression, row: string[], context: ParserContext, supplier: Supplier): Promise<string | number | boolean> {
  switch(expression.type) {
    case "literal":
      return expression.value;
    case "column":
      return row[expression.index];
    case "counter":
      if (!(expression.name in context.counters)) {
        context.counters[expression.name] = 0;
      }
      return String(context.counters[expression.name]++);
    case "match": {
      const value = await evaluateExpression(expression.value, row, context, supplier);
      const regex = RegExp(expression.regex ?? ".*?");
      const matches = regex.exec(value.toString());
      if (matches == null || matches.length === 1) {
        throw Error(`Could not match expression '${regex}' to '${value}'`);
      }
      return matches[1];
    }
    case "customer": {
      const evaluated = await evaluateExpression(expression.value, row, context, supplier);
      const matches = context.customers.filter(c => {
        switch (typeof evaluated) {
          case "boolean": {
            return !!c[expression.from] === evaluated
          }
          case "string": {
            if (c[expression.from] == null) return false;
              return c[expression.from].toString().trim().toLowerCase() === evaluated.toString().trim().toLowerCase()
          }
          case "number": {
            return z.coerce.number().parse((c[expression.from])) === evaluated
          } 
          default:
            return c[expression.from] == evaluated;
        }
      });
      const filtered = [...new Set(matches.map(v => v[expression.to]))];
      if (filtered.length === 0) {
        throw Error(`No matching customer '${evaluated}' for '${supplier.name}' `);
      } else if (filtered.length > 1) {
        throw Error(`Multiple matching customers '${filtered.join("', '")}' for '${supplier.name}' `);
      }

      return String(filtered[0]);
    }
    case "equal": {
      const values = await Promise.all(expression.value.map(v =>
        evaluateExpression(v, row, context, supplier)
      ));

      if (values.length === 0) {
        return true;
      } else {
        return values.every(v => v == values[0]);
      }
    }
  }
}

async function parseRow(row: string[], context: ParserContext, supplier: Supplier): Promise<Rebate> {
  const result: object = {};

  for (const [name, property] of Object.entries(supplier.properties)) {
    const evaluated = await evaluateExpression(property.value, row, context, supplier);
    switch (property.type) {
      case "date":
        result[name] = new Date(evaluated.toString()).toLocaleDateString("en-US");
        continue;
      case "number":
        if (typeof evaluated !== 'number') {
          result[name] = z.coerce.number().parse(evaluated.toString().split(',').join(''));
        } else {
          result[name] = evaluated
        }
        continue;
      case "string":
        result[name] = evaluated;
        continue;
      case "usd":
        if (typeof evaluated !== 'number') {
          result[name] = `$${z.coerce.number().parse(evaluated.toString().split(',').join('')).toFixed(2)}`;
        } else {
          result[name] = `$${evaluated.toFixed(2)}`
        }
    }
  }

  const parsed = await RebateSchema.parseAsync(result);
  return parsed;
}

export async function parseSourceFile(file: SourceFile, context: ParserContext, supplier: Supplier): Promise<Rebate[]> {
  const results = new Array<Rebate>();

  for (let i = 0; i < file.data.length; i++) {
    const row = file.data[i];

    let good = true;
    for (let j = 0; j < supplier.filters.length; j++) {
      const filter = supplier.filters[j];

      const value = await evaluateExpression(filter, row, context, supplier);
      if (typeof value !== 'boolean') {
        throw Error(`Filter '${j}' failed on row '${i}' of '${file.path}': returned non-boolean value '${value}'.`);
      }
      
      if (!value) {
        good = false;
        break;
      }
    }

    if (!good) continue;

    try {
      results.push(await parseRow(row, context, supplier));
    } catch (err) {
      console.log(`ERROR FOR '${file.path}': ${err}`);
    }
  }

  return results;
}