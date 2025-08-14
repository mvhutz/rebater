import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { type RootState } from '..'
import { Settings, type SettingsData } from '../../../shared/settings';
import { resource, Resource, ResourceStatus } from '../../../shared/resource';
import { killSystem, pullAllQuarters, pullSystemSettings, pullTransformers, pushSystemSettings, startSystem } from './thunk';
import { bad, good, Reply } from '../../../shared/reply';
import { TimeData } from '../../../shared/time';
import { Question, SystemStatus } from '../../../shared/worker/response';
import { TransformerInfo } from '../../../system/Transformer';

/** ------------------------------------------------------------------------- */

interface SystemState {
  status: SystemStatus;
  settings: Resource<SettingsData>;
  transformers: Reply<TransformerInfo[]>;
  invalid_transformers: [string, string][];
  quarters: Resource<TimeData[]>;
  questions: Record<string, Question>;
}

const initialState: SystemState = {
  status: { type: "idle" },
  settings: resource(Settings.DEFAULT_SETTINGS),
  quarters: resource([], ResourceStatus.LOADING),
  transformers: bad("Loading transformers..."),
  invalid_transformers: [],
  questions: {}
}

/** ------------------------------------------------------------------------- */

export const SystemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<SystemStatus>) => {
      state.status = action.payload;
    },
    setSystemTarget: (state, action: PayloadAction<SettingsData["advanced"]["target"]>) => {
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
    setSystemTestAll: (state, action: PayloadAction<boolean>) => {
      state.settings.data.advanced.doCompareAll = action.payload;
    },
    setTransformersNames: (state, action: PayloadAction<Maybe<string[]>>) => {
      state.settings.data.transformers.names.include = action.payload ?? undefined;
    },
    setTransformersTags: (state, action: PayloadAction<Maybe<string[]>>) => {
      state.settings.data.transformers.tags.include = action.payload ?? undefined;
    },
    deleteQuestion: (state, action: PayloadAction<Question>) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete state.questions[action.payload.hash];
    },
    addQuestion: (state, action: PayloadAction<Question>) => {
      state.questions[action.payload.hash] = action.payload;
    },
    clearQuestions: (state) => {
      state.questions = {};
    }
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
      .addCase(killSystem.pending, (state) => {
        state.status = { type: "loading", message: "Shutting down..." };
      })
      .addCase(killSystem.fulfilled, (state, { payload }) => {
        if (payload.ok) {
          state.status = { type: "idle" };
        } else {
          state.status = { type: "error", message: payload.reason };
        }
      })
      .addCase(killSystem.rejected, (state, { error }) => {
        state.status = { type: "error", message: error.message ?? "Unknown error!" };
      })
      .addCase(pullTransformers.pending, state => {
        state.transformers = bad("Loading transformers...");
        state.invalid_transformers = [];
      })
      .addCase(pullTransformers.fulfilled, (state, { payload }) => {
        if (payload.ok) {
          state.transformers = good(payload.data.filter(d => d.ok).map(d => d.data));
          state.invalid_transformers = payload.data.filter(d => !d.ok).map(d => [d.message ?? "Unknown file.", d.reason]);
        } else {
          state.transformers = payload;
          state.invalid_transformers = [];
        }
      })
      .addCase(pullAllQuarters.pending, state => {
        state.quarters = resource([], ResourceStatus.LOADING);
      })
      .addCase(pullAllQuarters.rejected, (state) => {
        state.quarters = resource([], ResourceStatus.LOADING);
      })
      .addCase(pullAllQuarters.fulfilled, (state, { payload }) => {
        if (payload.ok) {
          state.quarters = resource(payload.data, ResourceStatus.PRESENT);
        } else {
          state.quarters = resource([], ResourceStatus.LOADING);
        }
      })
  },
});

/** ------------------------------------------------------------------------- */

export const {
  setStatus, setSystemTarget, setSystemQuarter, setSystemYear, setSystemTesting,
  setTransformersNames, setTransformersTags, deleteQuestion, clearQuestions,
  setSystemTestAll, addQuestion
} = SystemSlice.actions

export const getSystemStatus = (state: RootState) => state.system.status;
export const getSystemSettings = (state: RootState) => state.system.settings;
export const getContextSettings = (state: RootState) => state.system.settings.data.context;
export const getTestSettings = (state: RootState) => state.system.settings.data.advanced.doTesting;
export const getTestAll = (state: RootState) => state.system.settings.data.advanced.doCompareAll;
export const getTransformers = (state: RootState) => state.system.transformers;
export const getTransformersSettings = (state: RootState) => state.system.settings.data.transformers;
export const getSystemQuestions = (state: RootState) => state.system.questions;
export const getSystemQuestionCount = (state: RootState) => Object.keys(state.system.questions).length;
export const getInvalidTransformers = (state: RootState) => state.system.invalid_transformers;

export const isSystemLoading = (state: RootState) => {
  return state.system.status.type === "loading";
}

export const isSystemActive = (state: RootState) => {
  return state.system.status.type === "running" || state.system.status.type === "loading";
}

export const getSystemStatusName = (state: RootState): string => {
  switch (state.system.status.type) {
    case "done": return "Done!";
    case "idle": return "Idle";
    case "loading": return state.system.status.message ?? "Loading...";
    case "running": return "Running transformers...";
    case "error": return "Error encountered!";
  }
}

export const getSystemProgress = (state: RootState): number => {
  switch (state.system.status.type) {
    case "done": return 0;
    case "idle": return 0;
    case "loading": return 0;
    case "running": return 100 * state.system.status.progress;
    case "error": return 0;
  }
}

export const getQuarterList = (state: RootState): Resource<TimeData[]> => {
  return state.system.quarters
}
