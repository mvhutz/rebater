import { createInterprocess } from "interprocess";
import { getTransformers } from "./system/getTransformers";
import { getSettings } from "./system/getSettings";
import { openOutputFile } from "./system/openOutputFile";
import { getAllQuarters } from "./system/getAllQuarters";
import { createQuarter } from "./system/createQuarter";
import { SettingsData } from "../settings";
import { Question, SystemStatus } from "../worker/response";
import { Answer } from "../worker/request";
import { getPing } from "./system/getPing";
import { chooseDir } from "./system/chooseDir";
import { openDir } from "./system/openDir";
import { setSettings } from "./system/setSettings";
import { ignore } from "./system/ignore";

/** ------------------------------------------------------------------------- */

// Create message interface between main thread and renderer thread.
const IPC = createInterprocess({
  main: {
    // Those that do not need information from worker thread.
    getPing,
    chooseDir,
    openDir,
    getTransformers,
    getSettings,
    openOutputFile,
    getAllQuarters,
    createQuarter,
    setSettings,

    // Those that do.
    runProgram: ignore<Maybe<SettingsData>>,
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