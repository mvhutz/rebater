// interface JoinAction {
//   type: 'label';
// }

// interface LabelAction {
//   type: 'label';
//   add: string[];
//   filter: string[];
// }

// interface ReadAction {
//   type: 'read';
//   class: string[];
//   subclass: string[];
// }

// interface RowAction {
//   type: 'row';
// }

// interface TableAction {
//   type: 'table';
// }

// interface StackAction {
//   type: 'stack';
// }

// interface ExcelAction {
//   type: 'excel';
// }

// interface SheetAction {
//   type: 'sheet';
//   name: string[];
// }

// interface TrimAction {
//   type: 'trim';
//   top: number,
//   bottom: number | null,
//   left: number,
//   right: number | null,
// }

// interface SliceAction {
//   type: 'slice';
//   into: 'rows' | 'columns';
// }

// interface CounterAction {
//   type: 'counter';
// }

// interface ColumnAction {
//   type: 'column';
//   index: number;
// }

// interface LiteralAction {
//   type: 'literal';
//   value: string;
// }

// interface CoerceAction {
//   type: 'coerce';
//   into: 'usd' | 'number' | 'date';
// }

// interface ReferenceAction {
//   type: 'reference';
//   table: string;
//   enter: string;
//   exit: string;
// }

// interface WriteAction {
//   type: 'write';
//   class: string[];
//   subclass: string[];
//   as: string;
//   headers: string[];
// }

// type Action =
//  | LabelAction
//  | ReadAction
//  | RowAction
//  | TableAction
//  | StackAction
//  | ExcelAction
//  | SheetAction
//  | TrimAction
//  | SliceAction
//  | CounterAction
//  | ColumnAction
//  | LiteralAction
//  | CoerceAction
//  | ReferenceAction
//  | WriteAction
//  | JoinAction
