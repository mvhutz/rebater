import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { type RootState } from '..'
import { type SettingsData } from '../../../shared/settings';
import { killSystem, pullAllQuarters, pullSystemSettings, pullTransformers, startSystem } from './thunk';
import { TimeData } from '../../../shared/time';
import { Question, SystemStatus } from '../../../shared/worker/response';
import { bad, Reply } from '../../../shared/reply';
import { TransformerFile } from '../../../shared/state/stores/TransformerStore';

/** ------------------------------------------------------------------------- */

export interface SettingsDraft {
  time: TimeData;
  transformers: {
    tags: { include: string[]; };
    names: { include: string[]; };
  };
  directory?: string;
  testing: { enabled: boolean; compare_all: boolean; };
}

/** ------------------------------------------------------------------------- */

interface SystemState {
  status: SystemStatus;
  settings: Reply<SettingsData>;
  transformers: Reply<TransformerFile[]>;
  quarters: TimeData[];
  questions: Record<string, Question>;
  draft: {
    settings: SettingsDraft;
  }
}

const initialState: SystemState = {
  status: { type: "idle" },
  settings: bad("Not loaded!"),
  quarters: [],
  transformers: bad("Not loaded!"),
  questions: {},
  draft: {
    settings: {
      time: { year: 9999, quarter: 1 },
      transformers: {
        tags: { include: [] },
        names: { include: [] }
      },
      testing: { enabled: false, compare_all: false }
    }
  }
}

/** ------------------------------------------------------------------------- */

export const SystemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<SystemStatus>) => {
      state.status = action.payload;
    },
    setTrueSettings: (state, action: PayloadAction<Reply<SettingsData>>) => {
      state.settings = action.payload;
    },
    setDraftSystemDirectory: (state, action: PayloadAction<string>) => {
      state.draft.settings.directory = action.payload;
    },
    setDraftSystemTime: (state, action: PayloadAction<TimeData>) => {
      state.draft.settings.time = action.payload ?? undefined;
    },
    setDraftSystemTesting: (state, action: PayloadAction<boolean>) => {
      state.draft.settings.testing.enabled = action.payload;
    },
    setDraftSystemTestAll: (state, action: PayloadAction<boolean>) => {
      state.draft.settings.testing.compare_all = action.payload;
    },
    setDraftTransformersNames: (state, action: PayloadAction<Maybe<string[]>>) => {
      state.draft.settings.transformers.names.include = action.payload ?? [];
    },
    setDraftTransformersTags: (state, action: PayloadAction<Maybe<string[]>>) => {
      state.draft.settings.transformers.tags.include = action.payload ?? [];
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
      .addCase(pullSystemSettings.fulfilled, (state, { payload }) => {
        state.settings = payload;
        if (payload.ok) {
          state.draft.settings = payload.data;
        }
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
      .addCase(pullTransformers.pending, (state) => {
        state.transformers = bad("Loading...");
      })
      .addCase(pullTransformers.fulfilled, (state, { payload }) => {
        state.transformers = payload;
      })
      .addCase(pullAllQuarters.pending, state => {
        state.quarters = []
      })
      .addCase(pullAllQuarters.rejected, (state) => {
        state.quarters = []
      })
      .addCase(pullAllQuarters.fulfilled, (state, { payload }) => {
        if (payload.ok) {
          state.quarters = payload.data;
        } else {
          state.quarters = [];
        }
      })
  },
});

/** ------------------------------------------------------------------------- */

export const {
  setStatus, setTrueSettings, setDraftSystemDirectory, setDraftSystemTime, setDraftSystemTesting,
  setDraftTransformersNames, setDraftTransformersTags, deleteQuestion, clearQuestions,
  setDraftSystemTestAll, addQuestion
} = SystemSlice.actions

export const getSystemStatus = (state: RootState) => state.system.status;
export const getTrueSettings = (state: RootState) => state.system.settings;
export const getDraftSettings = (state: RootState) => state.system.draft.settings;
export const getDraftTime = (state: RootState) => state.system.draft.settings.time;
export const getDraftTesting = (state: RootState) => state.system.draft.settings.testing;
export const getDraftCompareAll = (state: RootState) => state.system.draft.settings.testing.compare_all;
export const getDraftTransformersSettings = (state: RootState) => state.system.draft.settings.transformers;
export const getTransformers = (state: RootState) => state.system.transformers;
export const getSystemQuestions = (state: RootState) => state.system.questions;
export const getSystemQuestionCount = (state: RootState) => Object.keys(state.system.questions).length;

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

export const getQuarterList = (state: RootState): TimeData[] => {
  return state.system.quarters
}
