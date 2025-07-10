import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..';
import { pushSystemSettings } from './thunk';

/** ------------------------------------------------------------------------- */

interface Message {
  type: "error" | "info";
  text: string;
}

interface SystemState {
  messages: Message[];
}

const initialState: SystemState = {
  messages: []
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

export const { popMessage, pushMessage } = UISlice.actions

export const getLatestMessage = (state: RootState) => state.ui.messages.at(-1);
