import { createAsyncThunk } from "@reduxjs/toolkit";
import { Reply } from "../../../shared/reply";
import { RootState } from "..";
import { ResourceStatus } from "../../../shared/resource";
import { SettingsData } from "../../../shared/settings";
import { TransformerFileInfo } from "../../../system/transformer/AdvancedTransformer";
import { TimeData } from "../../../shared/time";

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

    return await invoke.setSettings(system.settings.data);
  },
  {
    condition(_, { getState }) {
      const { system } = getState() as RootState;
      if (system.settings.status !== ResourceStatus.PRESENT) return false;
    }
  }
);

export const pullSystemSettings = createAsyncThunk(
  'system/pullSettings',
  async (): Promise<Reply<Maybe<SettingsData>>> => {
    return await invoke.getSettings({});
  },
  {
    condition(_, { getState }) {
      const { system } = getState() as RootState;
      if (system.settings.status !== ResourceStatus.PRESENT) return false;
      if (system.status.type === "loading" || system.status.type === "running") return false;
    }
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
  async (): Promise<Reply<TransformerFileInfo[]>> => {
    return await invoke.getTransformers();
  }
);
