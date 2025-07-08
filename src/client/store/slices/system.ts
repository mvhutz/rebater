import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { type RootState } from '..'
import { type RunnerStatus } from '../../../system/Runner';
import { type SettingsData } from '../../../shared/settings';

/** ------------------------------------------------------------------------- */

interface SystemState {
  status: RunnerStatus;
  settings: {
    data?: SettingsData;
    loading: boolean;
    saving: boolean;
    error?: string;
  };
}

const initialState: SystemState = {
  status: { type: "idle" },
  settings: {
    data: undefined,
    loading: false,
    saving: false,
    error: undefined
  },
}

/** ------------------------------------------------------------------------- */

const { invoke, handle, remove } = window.api;

export const pushSystemSettings = createAsyncThunk(
  'system/pushSettings',
  async (data: SettingsData | undefined): Promise<APIResponse<string>> => {
    if (data == null) {
       return { good: false, reason: "Cannot save empty settings." };
    }

    return await invoke.setSettings(data);
  },
  {
    condition(_, { getState }) {
      const { system } = getState() as RootState;
      if (system.settings.loading || system.settings.saving) return false;
    }
  }
);

export const pullSystemSettings = createAsyncThunk(
  'system/pullSettings',
  async (): Promise<APIResponse<Maybe<SettingsData>>> => {
    return await invoke.getSettings();
  },
  {
    condition(_, { getState }) {
      const { system } = getState() as RootState;
      if (system.settings.loading || system.settings.saving) return false;
      if(system.status.type === "loading" || system.status.type === "running") return false;
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
      if (system.settings.loading || system.settings.saving) {
        return false;
      }
    },
  }
);

/** ------------------------------------------------------------------------- */

export const SystemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<RunnerStatus>) => {
      state.status = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(pushSystemSettings.pending, (state) => {
        state.settings.saving = true;
        state.settings.error = undefined;
      })
      .addCase(pushSystemSettings.fulfilled, (state, { payload }) => {
        state.settings.saving = false;
        if (!payload.good) {
          state.settings.error = payload.reason ?? "Unknown error.";
        }
      })
      .addCase(pushSystemSettings.rejected, (state, { error }) => {
        state.settings.saving = false;
        state.settings.error = error.message ?? "Unknown error.";
      })
      .addCase(pullSystemSettings.pending, (state) => {
        state.settings.loading = true;
        state.settings.error = undefined;
      })
      .addCase(pullSystemSettings.fulfilled, (state, { payload }) => {
        state.settings.loading = false;
        if (!payload.good) {
          state.settings.error = payload.reason ?? "Unknown error.";
        } else {
          state.settings.data = payload.data;
        }
      })
      .addCase(pullSystemSettings.rejected, (state, { error }) => {
        state.settings.loading = false;
        state.settings.error = error.message ?? "Unknown error.";
      })
      .addCase(startSystem.pending, (state) => {
        state.status = { type: "loading", message: "Connecting..." };
      })
      .addCase(startSystem.fulfilled, (state, { payload }) => {
        if (payload.good) {
          state.status = { type: "loading", message: "Connected!" };
        } else {
          state.status = { type: "error", message: payload.reason };
        }
      })
      .addCase(startSystem.rejected, (state, { error }) => {
        state.status = { type: "error", message: error.message ?? "Unknown error!" };
      })
  },
});

/** ------------------------------------------------------------------------- */

export const { setStatus } = SystemSlice.actions

export const getSystemStatus = (state: RootState) => state.system.status;
export const getSystemSettings = (state: RootState) => state.system.settings;

export const isSystemLoading = (state: RootState) => {
  return state.system.status.type === "loading";
}

export const isSystemActive = (state: RootState) => {
  return state.system.status.type === "running" || state.system.status.type === "loading";
}

export const getSystemStatusName = (state: RootState) => {
  switch (state.system.status.type) {
    case "done": return "Done!";
    case "idle": return "Idle";
    case "loading": return state.system.status.message ?? "Loading...";
    case "running": return "Running transformers...";
    case "error": return "Error encountered!";
  }
}

export const getSystemProgress = (state: RootState) => {
  switch (state.system.status.type) {
    case "done": return 0;
    case "idle": return 0;
    case "loading": return 0;
    case "running": return 100 * state.system.status.progress;
    case "error": return 0;
  }
}
