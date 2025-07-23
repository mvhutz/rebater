import { createAsyncThunk } from "@reduxjs/toolkit";
import { Reply } from "../../../shared/reply";
import { RootState } from "..";
import { ResourceStatus } from "../../../shared/resource";
import { Settings } from "../../../shared/settings";
import { TransformerData } from "../../../system/transformer";

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

export const pullAllQuarters = createAsyncThunk(
  'system/getAllQuarters',
  async (): Promise<Reply<Time[]>> => {
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
  async (): Promise<Reply<Maybe<Settings>>> => {
    return await invoke.getSettings();
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
  async (_, { getState }) => {
    const { system } = getState() as RootState;
    return await invoke.runProgram(system.settings.data);
  },
  {
    condition(_, { getState }) {
      const { system } = getState() as RootState;
      if (system.settings.status !== ResourceStatus.PRESENT) return false;
    },
  }
);

export const killSystem = createAsyncThunk(
  'system/kill',
  async () => {
    return await invoke.cancelProgram();
  }
);

export const pullTransformers = createAsyncThunk(
  'system/pullTransformers',
  async (): Promise<Reply<TransformerData[]>> => {
    return await invoke.getTransformers();
  }
);
