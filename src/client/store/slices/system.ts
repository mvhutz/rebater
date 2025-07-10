import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { type RootState } from '..'
import { DEFAULT_SETTINGS, Settings } from '../../../shared/settings';
import { resource, Resource, ResourceStatus } from '../../../shared/resource';
import { SystemStatus } from '../../../shared/system_status';
import { pullSystemSettings, pushSystemSettings, startSystem } from './thunk';

/** ------------------------------------------------------------------------- */

interface SystemState {
  status: SystemStatus;
  settings: Resource<Settings>;
}

const initialState: SystemState = {
  status: { type: "idle" },
  settings: resource(DEFAULT_SETTINGS),
}

/** ------------------------------------------------------------------------- */

export const SystemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<SystemStatus>) => {
      state.status = action.payload;
    },
    setSystemTarget: (state, action: PayloadAction<Settings["advanced"]["target"]>) => {
      state.settings.data.advanced.target = action.payload;
    },
    setSystemYear: (state, action: PayloadAction<Maybe<number>>) => {
      state.settings.data.context.year = action.payload ?? undefined;
    },
    setSystemQuarter: (state, action: PayloadAction<Maybe<number>>) => {
      state.settings.data.context.quarter = action.payload ?? undefined;
    },
    setSystemTesting: (state, action: PayloadAction<boolean>) => {
      state.settings.data.advanced.doTesting = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(pushSystemSettings.pending, (state) => {
        state.settings.status = ResourceStatus.SAVING;
      })
      .addCase(pushSystemSettings.fulfilled, (state) => {
        state.settings.status = ResourceStatus.PRESENT;
      })
      .addCase(pushSystemSettings.rejected, (state) => {
        state.settings.status = ResourceStatus.PRESENT;
      })
      .addCase(pullSystemSettings.pending, (state) => {
        state.settings.status = ResourceStatus.LOADING;
      })
      .addCase(pullSystemSettings.fulfilled, (state, { payload }) => {
        state.settings.status = ResourceStatus.PRESENT;
        if (!payload.ok || payload.data == null) return;
        state.settings.data = payload.data;
      })
      .addCase(pullSystemSettings.rejected, (state) => {
        state.settings.status = ResourceStatus.PRESENT;
      })
      .addCase(startSystem.pending, (state) => {
        state.status = { type: "loading", message: "Connecting..." };
      })
      .addCase(startSystem.fulfilled, (state, { payload }) => {
        if (payload.ok) {
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

export const { setStatus, setSystemTarget, setSystemQuarter, setSystemYear, setSystemTesting } = SystemSlice.actions

export const getSystemStatus = (state: RootState) => state.system.status;
export const getSystemSettings = (state: RootState) => state.system.settings;
export const getContextSettings = (state: RootState) => state.system.settings.data.context;
export const getTestSettings = (state: RootState) => state.system.settings.data.advanced.doTesting;

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
