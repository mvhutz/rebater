import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { type RootState } from '..'
import { type SettingsData } from '../../../shared/settings';
import { killSystem, pullAllQuarters, pullQuestions, pullSystemSettings, pullTransformers, startSystem } from './thunk';
import { TimeData } from '../../../shared/time';
import { Question, SystemStatus } from '../../../shared/worker/response';
import { bad, good, Reply } from '../../../shared/reply';
import { TransformerFile } from '../../../shared/state/stores/TransformerStore';
import { ContextDraft, SettingsDraft, TransformerDraft, TransformerPageInfo } from './drafts';
import { TransformerData } from '../../../shared/transformer';
import { AdvancedTransformerSchema } from '../../../shared/transformer/advanced';
import { z } from 'zod/v4';

/** ------------------------------------------------------------------------- */

interface SystemState {
  status: SystemStatus;
  settings: Reply<SettingsData>;
  transformers: Reply<TransformerFile[]>;
  quarters: TimeData[];
  questions: Reply<Question[]>;
  draft: {
    settings: SettingsDraft;
    context: ContextDraft;
  },
  transformer_page: TransformerPageInfo
}

const initialState: SystemState = {
  status: { type: "idle" },
  settings: bad("Not loaded!"),
  quarters: [],
  transformers: bad("Not loaded!"),
  questions: bad("Not loaded!"),
  draft: {
    settings: {
      testing: { enabled: false, compare_all: false }
    },
    context: {
      transformers: {
        tags: { include: [] },
        names: { include: [] }
      },
    },
  },
  transformer_page: { type: "empty" },
}

/** ------------------------------------------------------------------------- */

export const SystemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setTransformerPage: (state, action: PayloadAction<TransformerPageInfo>) => {
      state.transformer_page = action.payload;
    },
    updateTransformerDraft: (state, action: PayloadAction<TransformerDraft>) => {
      if (state.transformer_page.type === "empty") return;
      state.transformer_page.draft = action.payload;
    },
    clearTransformerPage: (state) => {
      state.transformer_page = { type: "empty" };
    },
    addTransformerFile: (state, action: PayloadAction<TransformerFile>) => {
      if (!state.transformers.ok) return;
      state.transformers.data.push(action.payload);
    },
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
      state.draft.context.time = action.payload ?? undefined;
    },
    setDraftSystemTesting: (state, action: PayloadAction<boolean>) => {
      state.draft.settings.testing.enabled = action.payload;
    },
    setDraftSystemTestAll: (state, action: PayloadAction<boolean>) => {
      state.draft.settings.testing.compare_all = action.payload;
    },
    setDraftTransformersNames: (state, action: PayloadAction<Maybe<string[]>>) => {
      state.draft.context.transformers.names.include = action.payload ?? [];
    },
    setDraftTransformersTags: (state, action: PayloadAction<Maybe<string[]>>) => {
      state.draft.context.transformers.tags.include = action.payload ?? [];
    },
    deleteQuestion: (state, action: PayloadAction<Question>) => {
      if (!state.questions.ok) return;
      state.questions = good(state.questions.data.filter(t => t.hash !== action.payload.hash));
    },
    clearQuestions: (state) => {
      state.questions = good([]);
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
      .addCase(pullQuestions.fulfilled, (state, { payload }) => {
        state.questions = payload;
      })
      .addCase(killSystem.rejected, (state, { error }) => {
        state.status = { type: "error", message: error.message ?? "Unknown error!" };
      })
      // .addCase(pullTransformers.pending, (state) => {
      //   state.transformers = bad("Loading...");
      // })
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
  setDraftTransformersNames, setDraftTransformersTags, deleteQuestion,
  setDraftSystemTestAll, clearQuestions, clearTransformerPage, setTransformerPage,
  addTransformerFile, updateTransformerDraft
} = SystemSlice.actions

export const getSystemStatus = (state: RootState) => state.system.status;
export const getTrueSettings = (state: RootState) => state.system.settings;
export const getDraftSettings = (state: RootState) => state.system.draft.settings;
export const getDraftTime = (state: RootState) => state.system.draft.context.time;
export const getDraftTesting = (state: RootState) => state.system.draft.settings.testing;
export const getDraftCompareAll = (state: RootState) => state.system.draft.settings.testing.compare_all;
export const getDraftTransformersSettings = (state: RootState) => state.system.draft.context.transformers;
export const getTransformers = (state: RootState) => state.system.transformers;
export const getSystemQuestions = (state: RootState) => state.system.questions;
export const getSystemQuestionCount = (state: RootState) => state.system.questions.ok ? state.system.questions.data.length : 0;
export const getRunResults = (state: RootState) => state.system.status.type === "done" ? state.system.status.results : null;
export const getRunError = (state: RootState) => state.system.status.type === "error" ? state.system.status.message : null;
export const getValidTransformerFiles = (state: RootState) => state.system.transformers.ok ? state.system.transformers.data : [];

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

export const getTransformerGroups = createSelector([getTransformers], (transformers_reply) => {
  const result: Record<string, TransformerFile[]> = {};
  if (!transformers_reply.ok) return transformers_reply;

  for (const transformer of transformers_reply.data) {
    if (!transformer.data.ok) {
      result["Malformed"] ??= [];
      result["Malformed"].push(transformer);
      continue;
    }
    
    switch (transformer.data.data.type) {
      case "advanced":
        result["Advanced"] ??= [];
        result["Advanced"].push(transformer);
        break;
      case "simple":
        result[transformer.data.data.group] ??= [];
        result[transformer.data.data.group].push(transformer);
    }
  }

  return good(result);
});

export const getTransformerPageInfo = (state: RootState) => state.system.transformer_page;

export const getValidTransformers = createSelector([getValidTransformerFiles], files => {
  return files.map(f => f.data).filter(d => d.ok).map(d => d.data);
})

export const getTransformerNames = createSelector([getValidTransformers], (transformers) => {
  return transformers.map(t => t.name);
})

export const getCurrentTransformerId = (state: RootState) => state.system.transformer_page.type === "update"
  ? state.system.transformer_page.meta.name
  : null;

export const getTransformerDraftAsData = (state: RootState): Reply<TransformerData> => {
  const page = getTransformerPageInfo(state);
  if (page.type === "empty") {
    return bad("No transformer draft found!");
  }

  const { draft } = page;

  if (draft.type === "simple") {
    return good(draft);
  } else {
    try {
      const json = JSON.parse(draft.text);
      const parse_reply = AdvancedTransformerSchema.safeParse(json);
      if (parse_reply.success) {
        return good(parse_reply.data);
      } else {
        return bad(z.prettifyError(parse_reply.error));
      }
    } catch(err) {
      return bad(`${err}`);
    }
  }
}