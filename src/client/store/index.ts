import { configureStore } from '@reduxjs/toolkit';
import { setStatus, SystemSlice } from './slices/system';
import { UISlice } from './slices/ui';
import { doPullAll, pullQuestions } from './slices/thunk';
import { good } from '../../shared/reply';

/** ------------------------------------------------------------------------- */

export const Store = configureStore({
  reducer: {
    system: SystemSlice.reducer,
    ui: UISlice.reducer
  },
});

/** ------------------------------------------------------------------------- */

const { handle } = window.api;

// Beginning data fetches.
async function load() {
  await Store.dispatch(doPullAll());
}

load();

// Handle system responses.
handle.runnerUpdate(async (_, { data }) => {
  Store.dispatch(setStatus(data));
  if (data.type === "done") {
    Store.dispatch(pullQuestions());
  }
  return good(undefined);
});

/** ------------------------------------------------------------------------- */

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof Store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof Store.dispatch;