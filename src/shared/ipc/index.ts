import { createInterprocess } from "interprocess";
import { openOutputFile } from "./system/openOutputFile";
import { getAllQuarters } from "./system/getAllQuarters";
import { createQuarter } from "./system/createQuarter";
import { SettingsData } from "../settings";
import { Question, SystemStatus } from "../worker/response";
import { Answer } from "../worker/request";
import { getPing } from "./system/getPing";
import { chooseDir } from "./system/chooseDir";
import { openDir } from "./system/openDir";
import { ignore } from "./system/ignore";
import { TransformerData } from "../transformer";

/** ------------------------------------------------------------------------- */

// Create message interface between main thread and renderer thread.
const IPC = createInterprocess({
  main: {
    // Those that do not need information from worker thread.
    getPing,
    chooseDir,
    openDir,
    getSettings: ignore<unknown, SettingsData>,
    openOutputFile,
    getAllQuarters,
    createQuarter,
    getTransformers: ignore<undefined, TransformerData[]>,
    createTransformer: ignore<TransformerData, number>,
    deleteTransformer: ignore<number, number>,
    updateTransformer: ignore<{ id: number, data: TransformerData}, number>,
    setSettings: ignore<SettingsData, string>,

    // Those that do.
    runProgram: ignore,
    cancelProgram: ignore,
    answerQuestion: ignore<Answer>,
    ignoreAll: ignore,
    exitProgram: ignore
  },
  renderer: {
    runnerUpdate: ignore<SystemStatus>,
    runnerQuestion: ignore<Question>
  }
});


/** ------------------------------------------------------------------------- */

export default IPC;