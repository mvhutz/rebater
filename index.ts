import { ActionRegistry } from './src/transformer/ActionRegistry';
import { Lexer } from './src/transformer/Lexer';
import { Parser } from './src/transformer/Parser';
import { Runner } from './src/transformer/Runner';
import { TagRegistry } from './src/transformer/TagRegistry';

async function main() {
  const xml = await Lexer.fromConfig('simple');

  const tag_registry = new TagRegistry();
  const parser = new Parser(tag_registry);
  const transformer = parser.parse(xml);
  
  const action_registry = new ActionRegistry();
  const runner = new Runner(transformer, action_registry);
  await runner.run();
}

main();