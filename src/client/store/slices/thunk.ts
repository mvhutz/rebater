import { createAsyncThunk } from "@reduxjs/toolkit";
import { bad, Reply } from "../../../shared/reply";
import { RootState } from "..";
import { SettingsData } from "../../../shared/settings";
import { TimeData } from "../../../shared/time";
import { TransformerFile } from "../../../shared/state/stores/TransformerStore";
import { Question } from "../../../shared/worker/response";

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

export const pullAllQuarters = createAsyncThunk(
  'system/getAllQuarters',
  async (): Promise<Reply<TimeData[]>> => {
    return await invoke.getAllQuarters();
  }
);

export const pushSystemSettings = createAsyncThunk(
  'system/pushSettings',
  async (_, { getState }): Promise<Reply<string>> => {
    const { system } = getState() as RootState;
    const { directory } = system.draft.settings;
    if (directory == null) {
      return bad("No directory selected!");
    }

    const settings = { ...system.draft.settings, directory };
    return await invoke.setSettings(settings);
  }
);

export const pullSystemSettings = createAsyncThunk(
  'system/pullSettings',
  async (): Promise<Reply<SettingsData>> => {
    return await invoke.getSettings({});
  }
);

export const pullQuestions = createAsyncThunk(
  'system/pullQuestions',
  async (): Promise<Reply<Question[]>> => {
    return await invoke.getQuestions({});
  }
);

export const startSystem = createAsyncThunk(
  'system/start',
  async () => {
    return await invoke.runProgram({});
  }
);

export const killSystem = createAsyncThunk(
  'system/kill',
  async () => {
    return await invoke.cancelProgram({});
  }
);

export const pullTransformers = createAsyncThunk(
  'system/pullTransformers',
  async (): Promise<Reply<TransformerFile[]>> => {
    return await invoke.getTransformers();
  }
);
