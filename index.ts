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

  console.log('\n==== [RUNNING TRANSFORMERS] ====\n')
  for (const file of files) {
    console.time("\t" + file);
    const xml = await Lexer.fromConfig(file);

    const tag_registry = new TagRegistry();
    const parser = new Parser(tag_registry);
    const transformer = parser.parse(xml);
    
    const action_registry = new ActionRegistry();
    const runner = new Runner(action_registry);
    await runner.run(transformer);
    console.timeEnd("\t" + file);
  }

  console.log('\n==== [COMPARING SOURCES] ====');

  const answers = await availableAnswers();
  for (const path of answers) {
    const { file1, file2 } = await compareRebates(`rebates/${path}`, `truth/${path}`, {
      ignore: ['purchaseId']
    });

    console.log(`\n${path}: +${file2.length} -${file1.length}.`);
    for (const line of file1) {
      console.log("\t[-]", line)
    }

    if (file1.length > 0 && file2.length > 0) console.log('');

    for (const line of file2) {
      console.log("\t[+]", line)
    }
  }
}

main();