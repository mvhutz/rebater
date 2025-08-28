import { createInterprocess } from "interprocess";
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
import { TransformerFile } from "../state/stores/TransformerStore";

/** ------------------------------------------------------------------------- */

// Create message interface between main thread and renderer thread.
const IPC = createInterprocess({
  main: {
    // Those that do not need information from worker thread.
    getPing,
    chooseDir,
    openDir,
    getSettings: ignore<unknown, SettingsData>,
    openOutputFile: ignore<undefined, string>,
    getAllQuarters,
    createQuarter,
    getTransformers: ignore<undefined, TransformerFile[]>,
    createTransformer: ignore<TransformerData, TransformerFile>,
    deleteTransformer: ignore<TransformerFile>,
    updateTransformer: ignore<TransformerFile>,
    setSettings: ignore<SettingsData, string>,
    getQuestions: ignore<unknown, Question[]>,
    answerQuestion: ignore<Answer>,
    clearQuestions: ignore,
    ignoreQuestion: ignore<Question>,

    // Those that do.
    runProgram: ignore,
    cancelProgram: ignore,
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