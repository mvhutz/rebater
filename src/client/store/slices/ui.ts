import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..';
import { pullAllQuarters, pushSystemSettings } from './thunk';

/** ------------------------------------------------------------------------- */

export type Tab = "system" | "documentation" | "questions" | "transformers";

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
  },
  tab: Tab
}

const initialState: UIState = {
  messages: [],
  show: {
    tabs: true,
    settings: true,
    new_quarter_modal: false,
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
    toggleTabs(state) {
      state.show.tabs = !state.show.tabs;
    },
    toggleSettings(state) {
      state.show.settings = !state.show.settings;
    },
    toggleNewQuarterModal(state) {
      state.show.new_quarter_modal = !state.show.new_quarter_modal;
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
  },
});

/** ------------------------------------------------------------------------- */

export const { popMessage, pushMessage, toggleTabs, toggleSettings, setTab, toggleNewQuarterModal } = UISlice.actions

export const getLatestMessage = (state: RootState) => state.ui.messages.at(-1);
export const getVisible = (state: RootState) => state.ui.show;
export const getTab = (state: RootState) => state.ui.tab;
export const getNewQuarterModal = (state: RootState) => state.ui.show.new_quarter_modal;
export const getDisplayTab = (name: Tab) => (state: RootState) => state.ui.tab === name ? "initial" : "none";
