import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..';
import { addNewQuarter, clearAllQuestions, pullAllQuarters, pullQuestions, pullTransformers, pushSystemSettings, showOutputFile } from './thunk';

/** ------------------------------------------------------------------------- */

export type Tab = "system" | "documentation" | "questions" | "transformers" | "settings";

interface Message {
  type: "error" | "info";
  text: string;
}

interface UIState {
  messages: Message[];
  show: {
    tabs: boolean;
    settings: boolean;
    new_quarter_modal: boolean;
    new_transformer_modal: boolean;
    context_filter: boolean;
  },
  tab: Tab,
}

const initialState: UIState = {
  messages: [],
  show: {
    tabs: true,
    settings: true,
    new_quarter_modal: false,
    new_transformer_modal: false,
    context_filter: false,
  },
  tab: "system"
}

/** ------------------------------------------------------------------------- */

export const UISlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    popMessage(state) {
      state.messages.pop();
    },
    pushMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    pushError(state, action: PayloadAction<string>) {
      state.messages.push({ type: "error", text: action.payload });
    },
    toggleTabs(state) {
      state.show.tabs = !state.show.tabs;
    },
    toggleSettings(state) {
      state.show.settings = !state.show.settings;
    },
    toggleNewQuarterModal(state) {
      state.show.new_quarter_modal = !state.show.new_quarter_modal;
    },
    toggleNewTransformerModal(state) {
      state.show.new_transformer_modal = !state.show.new_transformer_modal;
    },
    toggleContextFilter(state) {
      state.show.context_filter = !state.show.context_filter;
    },
    setTab(state, action: PayloadAction<Tab>) {
      state.tab = action.payload;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(pushSystemSettings.fulfilled, (state, { payload }) => {
        if (!payload.ok) {
          state.messages.push({ type: "error", text: payload.reason ?? "Unknown error saving settings." });
        } else {
          state.messages.push({ type: "info", text: "Settings saved!" });
        }
      })
      .addCase(pushSystemSettings.rejected, (state, { error }) => {
        state.messages.push({ type: "error", text: error.message ?? "Unknown error saving settings." });
      })
      .addCase(pullAllQuarters.rejected, (state, { error }) => {
        state.messages.push({ type: "error", text: error.message ?? "Unknown error loading quarters." });
      })
      .addCase(pullAllQuarters.fulfilled, (state, { payload }) => {
        if (payload.ok) return;
        state.messages.push({ type: "error", text: payload.reason });
      })
      .addCase(showOutputFile.fulfilled, (state, { payload }) => {
        if (payload.ok) return;
        state.messages.push({ type: "error", text: payload.reason });
      })
      .addCase(pullTransformers.fulfilled, (state, { payload }) => {
        if (payload.ok) return;
        state.messages.push({ type: "error", text: payload.reason });
      })
      .addCase(addNewQuarter.fulfilled, (state, { payload }) => {
        if (payload.ok) return;
        state.messages.push({ type: "error", text: payload.reason });
      })
      .addCase(addNewQuarter.rejected, (state, { error }) => {
        state.messages.push({ type: "error", text: error.message ?? "Unknown error loading quarters." });
      })
      .addCase(clearAllQuestions.fulfilled, (state, { payload }) => {
        if (payload.ok) return;
        state.messages.push({ type: "error", text: payload.reason });
      })
      .addCase(clearAllQuestions.rejected, (state, { error }) => {
        state.messages.push({ type: "error", text: error.message ?? "Unknown error loading quarters." });
      })
      .addCase(pullQuestions.fulfilled, (state, { payload }) => {
        if (payload.ok) return;
        state.messages.push({ type: "error", text: payload.reason });
      })
      .addCase(pullQuestions.rejected, (state, { error }) => {
        state.messages.push({ type: "error", text: error.message ?? "Unknown error loading quarters." });
      })
  },
});

/** ------------------------------------------------------------------------- */

export const {
  popMessage, pushMessage, toggleTabs, toggleSettings, setTab,
  toggleNewQuarterModal, toggleNewTransformerModal, toggleContextFilter, pushError
} = UISlice.actions

export const getLatestMessage = (state: RootState) => state.ui.messages.at(-1);
export const getVisible = (state: RootState) => state.ui.show;
export const getTab = (state: RootState) => state.ui.tab;
export const getNewQuarterModal = (state: RootState) => state.ui.show.new_quarter_modal;
export const getContextFilter = (state: RootState) => state.ui.show.context_filter;
export const getNewTransformerModal = (state: RootState) => state.ui.show.new_transformer_modal;
export const getDisplayTab = (name: Tab) => (state: RootState) => state.ui.tab === name ? undefined : "none";
