import {
  configureStore,
  createSlice,
} from '@reduxjs/toolkit';

const globalSlice = createSlice({
  name: 'global',
  initialState: {
    isDirectoryIndexing: false,
  },
  reducers: {
    startDirectoryIndexing: (state) => {
      // eslint-disable-next-line no-param-reassign
      state.isDirectoryIndexing = true;
    },
    stopDirectoryIndexing: (state) => {
      // eslint-disable-next-line no-param-reassign
      state.isDirectoryIndexing = false;
    },
  },
});

export const {
  startDirectoryIndexing,
  stopDirectoryIndexing,
} = globalSlice.actions;

export const makeStore = () =>
  configureStore({
    reducer: globalSlice.reducer,
  });

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
