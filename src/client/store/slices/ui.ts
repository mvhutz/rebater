import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..';
import { pushSystemSettings } from './thunk';

/** ------------------------------------------------------------------------- */

export const RunTabs = ["system", "documentation"] as const;
export type RunTab = typeof RunTabs[number];

interface Message {
  type: "error" | "info";
  text: string;
}

interface UIState {
  messages: Message[];
  show: {
    tabs: boolean;
    settings: boolean;
  },
  tab: RunTab;
}

const initialState: UIState = {
  messages: [],
  show: {
    tabs: true,
    settings: true,
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
    setCurrentTab(state, action: PayloadAction<RunTab>) {
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
  },
});

/** ------------------------------------------------------------------------- */

export const { popMessage, pushMessage, toggleTabs, toggleSettings, setCurrentTab } = UISlice.actions

export const getLatestMessage = (state: RootState) => state.ui.messages.at(-1);
export const getVisible = (state: RootState) => state.ui.show;
export const getCurrentTab = (state: RootState) => state.ui.tab;
