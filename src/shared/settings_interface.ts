import { Settings } from "./settings";
import path from "path";
import { bad, good, Reply } from "./reply";
import { TransformerData } from "../system/Transformer";

/** ------------------------------------------------------------------------- */

interface TargetInterface {
  getReferencePath(name: string): string;
  getRebatePathGlob(): string;
  getTruthPathGlob(): string;
  getDestinationPath(name: string): string;
  getSourcePathGlob(group: string, extension?: string): string;
  getTransformerPathGlob(): string;
  getTransformerPath(name: string): string;
  getOutputFile(extension: string): string;
}

interface AdvancedInterface extends TargetInterface {
  doTesting(): boolean;
}

interface ContextInterface {
  getTime(): Time;
}

interface TransformersInterface {
  willRun(transformer: TransformerData): boolean;
}

export interface SettingsInterface extends TargetInterface, AdvancedInterface, TransformersInterface {
}

/** ------------------------------------------------------------------------- */

function makeBasicTarget(strategy: Settings["advanced"]["target"], time: Time): Reply<TargetInterface> {
  const { directory } = strategy;
  if (directory == null) return bad("You must specify a target directory.");

  return good({
    getReferencePath: name => path.join(
      directory,
      "tables",
      `${name}.csv`
    ),
    getDestinationPath: (name) => path.join(
      directory,
      "rebates",
      time.year.toString(),
      `Q${time.quarter.toString()}`,
      `${name}.csv`
    ),
    getSourcePathGlob: (group, extension = "") => path.join(
      directory,
      "sources",
      group,
      time.year.toString(),
      `Q${time.quarter.toString()}`,
      `**/*${extension}`
    ),
     getRebatePathGlob: () => path.join(
      directory,
      "rebates",
      time.year.toString(),
      `Q${time.quarter.toString()}`,
      `**/*.csv`
    ),
    getTruthPathGlob: () => path.join(
      directory,
      "truth",
      time.year.toString(),
      `Q${time.quarter.toString()}`,
      `**/*.csv`
    ),
    getTransformerPathGlob: () => path.join(
      directory,
      'transformers',
      '**/*.json'
    ),
    getTransformerPath: name => path.join(
      directory,
      "transformer",
      `${name}.json`
    ),
    getOutputFile: extension => path.join(
      directory,
      "upload",
      time.year.toString(),
      `Q${time.quarter.toString()}`,
      `TOTAL.${extension}`
    ),
  });
}

function makeAdvancedInterface(settings: Settings["advanced"], time: Time): Reply<AdvancedInterface> {
  const target_response = makeBasicTarget(settings.target, time);
  if (!target_response.ok) return target_response;

  const { data: target } = target_response;
  return good({
    ...target,
    doTesting: () => settings.doTesting ?? false,
  })
}

function makeContextInterface(context: Settings["context"]): Reply<ContextInterface> {
  const { year, quarter } = context;

  if (year == null) {
    return bad("Specify a year to process.");
  } else if (quarter == null) {
    return bad("Specify a quarter to process.");
  }

  if (quarter !== 1 && quarter !== 2 && quarter !== 3 && quarter !== 4) {
    return bad(`Quarter ${quarter} is not valid.`);
  }

  return good({
    getTime: () => ({ year, quarter })
  });
}

function makeTransformerInterface(settings: Settings["transformers"]): Reply<TransformersInterface> {
  return good({
    willRun(transformer) {
      const { names: { include: names = [] }, tags: { include: tags = [] } } = settings;
      if (names.length > 0 && !names.includes(transformer.name)) {
        return false;
      }
      
      for (const required_tag of tags) {
        if (!transformer.tags.includes(required_tag)) {
          return false;
        }
      }

      return true;
    },
  });
}

export function makeSettingsInterface(settings: Settings): Reply<SettingsInterface> {
  const context_response = makeContextInterface(settings.context);
  if (!context_response.ok) return context_response;
  const { data: context } = context_response;

  const advanced_response = makeAdvancedInterface(settings.advanced, context.getTime());
  if (!advanced_response.ok) return advanced_response;
  const { data: advanced } = advanced_response;

  const transformers_response = makeTransformerInterface(settings.transformers);
  if (!transformers_response.ok) return transformers_response;
  const { data: transformers } = transformers_response;

  return good({ ...advanced, ...context, ...transformers });
}