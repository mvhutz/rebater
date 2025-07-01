import { Transformer } from "../transformer";

/** ------------------------------------------------------------------------- */

export interface Handlers {
  onRequestAsk?: () => Promise<() => void>;
  onAsk?: (question: string) => Promise<string>;
  onStartTransformer?: (transformer: Transformer, index: number, total: number) => void;
  onEndTransformer?: (transformer: Transformer, results: TransformerResult) => void;
  onFinish?: () => void;
}
