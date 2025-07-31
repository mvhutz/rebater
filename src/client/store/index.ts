import { configureStore } from '@reduxjs/toolkit';
import { pushQuestion, setStatus, SystemSlice } from './slices/system';
import { UISlice } from './slices/ui';
import { pullAllQuarters, pullSystemSettings, pullTransformers } from './slices/thunk';

/** ------------------------------------------------------------------------- */

export const Store = configureStore({
  reducer: {
    system: SystemSlice.reducer,
    ui: UISlice.reducer
  }
});

/** ------------------------------------------------------------------------- */

const { handle } = window.api;

// Beginning data fetches.
async function load() {
  await Store.dispatch(pullSystemSettings());
  await Store.dispatch(pullTransformers());
  await Store.dispatch(pullAllQuarters());
}

load();

// Handle system responses.
handle.runnerUpdate(async (_, { data }) => {
  Store.dispatch(setStatus(data));
});

handle.runnerQuestion(async (_, { data }) => {
  Store.dispatch(pushQuestion(data));
});

/** ------------------------------------------------------------------------- */

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof Store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof Store.dispatch;