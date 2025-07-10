import { Settings } from "./settings";
import path from "path";
import { bad, good, Reply } from "./reply";

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

interface ContextInterface {
  getTime(): Time;
}

export interface SettingsInterface extends TargetInterface, ContextInterface {
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

export function makeSettingsInterface(settings: Settings): Reply<SettingsInterface> {
  const context_response = makeContextInterface(settings.context);
  if (!context_response.ok) return context_response;

  const { data: context } = context_response;
  const target_response = makeBasicTarget(settings.advanced.target, context.getTime());
  if (!target_response.ok) return target_response;

  const { data: target } = target_response;
  return good({ ...target, ...context });
}