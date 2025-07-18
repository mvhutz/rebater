# Configuration

- [Configuration](#configuration)
  - [General](#general)
    - [Name](#name)
    - [Tags](#tags)
    - [Sources](#sources)
      - [Excel](#excel)
    - [Pre/Post Processing](#prepost-processing)
      - [Chop](#chop)
      - [Coalesce](#coalesce)
      - [Debug](#debug)
      - [Filter](#filter)
      - [Header](#header)
      - [Percolate](#percolate)
      - [Select](#select)
      - [Set](#set)
      - [Trim (Table)](#trim-table)
    - [Row Extraction](#row-extraction)
      - [Coerce](#coerce)
        - [Coerce Date](#coerce-date)
        - [Coerce USD](#coerce-usd)
        - [Coerce Number](#coerce-number)
      - [Add](#add)
      - [Character](#character)
      - [Column](#column)
      - [Concat](#concat)
      - [Counter](#counter)
      - [Divide](#divide)
      - [Equals](#equals)
      - [index](#index)
      - [Literal](#literal)
      - [Meta](#meta)
      - [Multiply](#multiply)
      - [Reference](#reference)
      - [Replace](#replace)
      - [Sum](#sum)
      - [Trim (Row)](#trim-row)
    - [Destination](#destination)
      - [CSV](#csv)
  - [Example](#example)

## General

A transformer is configured through a `.json` file placed in anywhere in the `transformers` folder inside your data directory. The basic structure is as follows:

```json
{ 
  "name": "Example",
  "tags": ["..."],
  "sources": ["..."],
  "preprocess": ["..."],
  "properties": ["..."],
  "postprocess": ["..."],
  "destination": "..."
}
```

### Name

Use a *name* to identify your transformer. It must be unique. It can be different than the name of the file.

```json
{ 
  "name": "Example Transformer"
}
```

### Tags

Use a *tag* to filter transformers. It is specified as a list of strings.

```json
{
  "tags": ["US", "Company A"]
}
```

### Sources

Gather your *source* files with this property. It is a list of individual source strategies. Each strategy is an object, differentiated by a `type` property.

#### Excel

The `excel` strategy pulls data from `.xlsx` or `.xls` formats.

| Attribute | Type       | Description                                                                                             |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------- |
| `group`   | `string`   | Which collection of sources to search in for files.                                                     |
| `file?`   | `string`   | If specified, searches for files that match this name. Excludes extension. Supports glob syntax.        |
| `sheets?` | `string[]` | If specified, only takes sheets with these names from any matching files. Supports regular expressings. |

This example takes all Excel files in the `USG` collection, and extracts any sheets named `CCS`.

```json
{
  "sources": [
    { "type": "excel", "group": "USG", "sheets": ["CCS"] }
  ]
}
```

### Pre/Post Processing

Before (or after) you extract certain properties row by row, you can use the `preprocess` and `postprocess` properties to declare transformations to be done to the table. They are specified as a list of processing strategies, each differentiated by a unique `type` property.

#### Chop

The `chop` strategy finds the first qualifying row, splits the table at that row, and keeps one part. The qualifying row is discarded.

| Attribute    | Type                | Description                                                                                                                      |
| ------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `column`     | `number`            | The column to match for.                                                                                                         |
| `is`         | `string[]`          | The set of values to match for, in the `column`.                                                                                 |
| `keep?`      | `"top" or "bottom"` | Whether to keep all rows above the matched row, or those below. Defaults to all below.                                           |
| `otherwise?` | `"drop" or "take"`  | If no qualifying row is found, the strategy can either `drop` all rows (returning none), or `take` all them. Defaults to `drop`. |

#### Coalesce

The `coalesce` strategy combines rows based on certain criteria. Specifically, if two rows (one on top, one on bottom) have the same values in a selected set of columns (`match`), the lower row is eliminated. But, for every column is specified in `combine`, their top and bottom values are summed.

This is useful in a scenario where a single rebate is spread across multiple rows, and the total value of the transaction needs to be summed.

| Attribute | Type                   | Description                        |
| --------- | ---------------------- | ---------------------------------- |
| `match`   | `(string or number)[]` | The columns to match rows with.    |
| `combine` | `(string or number)[]` | Which columns are summed together. |

In this example, all rows which matching values in column `D` are combined, and their values in `F` and `G` are summed.

```json
{ "preprocess": [
  { "type": "coalesce", "match": ["D"], "combine": ["F", "G"] }
] }
```

#### Debug

The `debug` strategy records the contents of a table during a transformer's completion.

| Attribute | Type     | Description                                            |
| --------- | -------- | ------------------------------------------------------ |
| `name?`   | `string` | The name of the debug report. Defaults to `"default"`. |

In this example, the report is saved to `debug/default.csv`.

```json
{
  "preprocess": [
    { "type": "debug" }
  ]
}
```

#### Filter

The `filter` strategy keeps all rows that fit a certain criteria. For each row, it runs an extract procedure. If the resulting value is `true`, the row is kept.

| Attribute  | Type                  | Description                |
| ---------- | --------------------- | -------------------------- |
| `criteria` | `ExtractionProcess[]` | The criteria to filter by. |

In this example, we keep all rows whose column `E` (which is a date) equals the quarter that was chosen by the user.

```json
{
  "preprocess": [
    { "type": "filter", "criteria": [
      { "type": "column", "index": "E" },
      { "type": "coerce", "as": "date", "format": "Q" },
      { "type": "equals", "with": [
          { "type": "meta", "value": "quarter.number" }
      ]}
    ]}
  ]
}
```

#### Header

The `header` strategy searches the top row of the table for a column with a certain header name, and an action on it.

| Attribute | Type     | Description                                                                      |
| --------- | -------- | -------------------------------------------------------------------------------- |
| `name`    | `string` | The name of the header to match.                                                 |
| `action`  | `"drop"` | What action to perform on the header. Currently, you can only remove the column. |

In this example, we remove all columns with the header "Show Unit".

```json
{
  "preprocess": [
    { "type": "header", "name": "Show Unit", "action": "drop" },
  ]
}
```

#### Percolate

The `percolate` strategy fills in spaces left behind by formatting. To give some context, imagine you are working with a table like this:

| **ID** | **DATE** | **VALUE** |
| ------ | -------- | --------- |
| 1      | Jun 3    | $82       |
|        |          | $27       |
|        | Jun 4    | $102      |
|        |          | $59       |
| 2      | Jul 8    | $29       |
|        | Jul 9    | $16       |

To properly record this data, every row should have an ID, DATE, and VALUE. But, the table leaves blank cells for redundant values, which prevents proper row-by-row extraction.

But, the `percolate` strategy fills in these gaps, by replacing any empty cell with the nearest non-empty cell directly above it. In the example above, percolating on columns A and B would create a table like this:

| **ID** | **DATE**  | **VALUE** |
| ------ | --------- | --------- |
| *1*    | *Jun 3*   | *$82*     |
| **1**  | **Jun 3** | *$27*     |
| **1**  | *Jun 4*   | *$102*    |
| **1**  | **Jun 4** | *$59*     |
| *2*    | *Jul 8*   | *$29*     |
| **2**  | *Jul 9*   | *$16*     |

The table can now be extracted, row-by-row.

| Attribute | Type       | Description               |
| --------- | ---------- | ------------------------- |
| `columns` | `string[]` | The columns to percolate. |

#### Select

The `select` strategy selects certain rows based on whether a column value does (or does not) match a set of values. It then chooses to either discard them, or keep them exclusively.

| Attribute | Type                 | Description                                                                   |
| --------- | -------------------- | ----------------------------------------------------------------------------- |
| `column`  | `string or number`   | The column to match against.                                                  |
| `is?`     | `string or string[]` | The value(s) that the column value must equal.                                |
| `isnt?`   | `string or string[]` | The value(s) that the column value must not equal.                            |
| `action?` | `"keep" or "drop"`   | Whether to keep or drop any rows selected by this strategy. Defaults to keep. |

A common use case is to remove blank rebates. The example below does just that:

```json
{
  "postprocess": [
    { "type": "select", "column": "G", "isnt": "0.00" }
  ]
}
```

#### Set

The `set` strategy takes a certain column, and replaces each cell's value with another. The process is done through a row extraction.

| Attribute | Type               | Description                                                  |
| --------- | ------------------ | ------------------------------------------------------------ |
| `column`  | `string or number` | The column to replace.                                       |
| `to`      | `RowExtraction[]`  | The extract process to determine a new value for every cell. |

In this example, all cells in `L` are replace with the combined sum of column `I`.

```json
{
  "preprocess": [
    { "type": "set", "column": "L", "to": [
      { "type": "sum", "column": "I" }
    ]}
  ]
}
```

#### Trim (Table)

The `trim` strategy can remove rows off the top and bottom of a table.

| Attribute | Type     | Description                                   |
| --------- | -------- | --------------------------------------------- |
| `top?`    | `number` | The number of rows to remove from the top.    |
| `bottom?` | `number` | The number of rows to remove from the bottom. |

This example trims the top layer of a table off.

```json
{
  "preprocess": [
    { "type": "trim", "top": 1 }
  ]
}
```

### Row Extraction

Currently work in progress.

#### Coerce

##### Coerce Date

##### Coerce USD

##### Coerce Number

#### Add

#### Character

#### Column

#### Concat

#### Counter

#### Divide

#### Equals

#### index

#### Literal

#### Meta

#### Multiply

#### Reference

#### Replace

#### Sum

#### Trim (Row)

### Destination

Write your extracted rows to a destination with this property. It is a single destination strategy. Each strategy is an object, differentiated by a `type` property.

#### CSV

The `csv` strategy pushed rebate data to a comma-separated formatted (CSV) file.

| Attribute | Type     | Description                                         |
| --------- | -------- | --------------------------------------------------- |
| `name`    | `string` | The name of the CSV file (excluding the extension). |

This example takes pushes all data to `rebates/<YEAR>/<Q>/HB Fuller.csv`, relative to the data directory.

```json
{
  "destination": { "type": "csv", "name": "HB Fuller" }
}
```

## Example

Here is an example configuration, showing how a configuration looks, when completed:

```json
{ 
  "name": "USG",
  "tags": [],
  "sources": [
    { "type": "excel", "group": "USG", "sheets": ["CCS"] }
  ],
  "preprocess": [
    { "type": "select", "column": "B", "is": "Fuse" }
  ],
  "properties": [
    { "name": "purchaseId", "definition": [
      { "type": "counter" }
    ]},
    { "name": "transactionDate", "definition": [
      { "type": "column", "index": "D" },
      { "type": "coerce", "as": "date" }
    ]},
    { "name": "supplierId", "definition": [
      { "type": "literal", "value": 1078 }
    ]},
    { "name": "memberId", "definition": [
      { "type": "column", "index": "F" },
      { "type": "reference", "table": "customers", "match": "customerName", "take": "fuseId", "group": "USG" }
    ]},
    { "name": "distributorName", "definition": [
      { "type": "literal", "value": "Carpet Cushions" }
    ]},
    { "name": "purchaseAmount", "definition": [
      { "type": "column", "index": "M" },
      { "type": "coerce", "as": "usd" }
    ]},
    { "name": "rebateAmount", "definition": [
      { "type": "column", "index": "M" },
      { "type": "multiply", "with": [
        { "type": "literal", "value": 0.03 }
      ]},
      { "type": "coerce", "as": "usd" }
    ]},
    { "name": "invoiceId", "definition": [
      { "type": "column", "index": "C" },
      { "type": "coerce", "as": "number" }
    ]},
    { "name": "invoiceDate", "definition": [
      { "type": "column", "index": "D" },
      { "type": "coerce", "as": "date" }
    ]}
  ],
  "postprocess": [
    { "type": "select", "column": "G", "isnt": "0.00" }
  ],
  "destination": { "type": "csv", "name": "USG" }
}
```
