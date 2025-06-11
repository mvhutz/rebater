declare module 'tabula-js';

type Expression =
  | CounterExpression
  | ColumnExpression
  | LiteralExpression
  | CustomerExpression
  | MatchExpression;

interface CounterExpression {
  type: "counter";
  name: string;
}

interface ColumnExpression {
  type: "column";
  index: number; 
}

interface LiteralExpression {
  type: "literal";
  value: string; 
}

interface CustomerExpression {
  type: "customer";
  from: keyof Customer;
  to: keyof Customer;
  value: Expression; 
}

interface MatchExpression {
  type: "match";
  regex?: string;
  value: Expression; 
}