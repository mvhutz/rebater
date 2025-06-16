import Path from 'path';
import MAGIC from './src/magic';
import { ActionRegistry } from './src/transformer/ActionRegistry';
import { Lexer } from './src/transformer/Lexer';
import { Parser } from './src/transformer/Parser';
import { Runner } from './src/transformer/Runner';
import { TagRegistry } from './src/transformer/TagRegistry';
import FS from 'fs/promises';
import { availableAnswers, compareRebates } from './src/test';

async function getTransformers() {  
  const path = Path.join(MAGIC.DIRECTORY, 'transformers', '**/*');

  const results = new Array<string>();

  for await (const file of FS.glob(path)) {
    results.push(Path.parse(file).name);
  }

  return results;
}

async function main() {
  const files = await getTransformers();

  console.log('-- [RUNNING TRANSFORMERS] --')
  for (const file of files) {
    console.time(file);
    const xml = await Lexer.fromConfig(file);

    const tag_registry = new TagRegistry();
    const parser = new Parser(tag_registry);
    const transformer = parser.parse(xml);
    
    const action_registry = new ActionRegistry();
    const runner = new Runner(action_registry);
    await runner.run(transformer);
    console.timeEnd(file);
  }

  console.log('\n-- [COMPARING SOURCES] --');

  const answers = await availableAnswers();
  for (const path of answers) {
    const { file1, file2 } = await compareRebates(`rebates/${path}`, `truth/${path}`, {
      ignore: ['purchaseId']
    });

    console.log(`${path}: +${file2.length} -${file1.length}.`);
    for (const line of file1) {
      console.log(">", line)
    }

    for (const line of file2) {
      console.log("<", line)
    }
  }
}

main();