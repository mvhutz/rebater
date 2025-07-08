import { configureStore } from '@reduxjs/toolkit';
import { pullSystemSettings, setStatus, SystemSlice } from './slices/system';

/** ------------------------------------------------------------------------- */

export const Store = configureStore({
  reducer: {
    system: SystemSlice.reducer,
  }
});

/** ------------------------------------------------------------------------- */

const { handle, invoke } = window.api;

// Beginning data fetches.
Store.dispatch(pullSystemSettings());

// Handle system responses.
handle.runnerUpdate(async (_, { data }) => {
  console.log("STATUS!", data);
  Store.dispatch(setStatus(data));
});

/** ------------------------------------------------------------------------- */

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof Store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof Store.dispatch;