import {
  configureStore,
  createSlice,
} from '@reduxjs/toolkit';

const globalSlice = createSlice({
  name: 'global',
  initialState: {
    isDirectoryIndexing: false,
    isWaitingForResponse: false,
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
    startWaitingForResponse: (state) => {
      // eslint-disable-next-line no-param-reassign
      state.isWaitingForResponse = true;
    },
    stopWaitingForResponse: (state) => {
      // eslint-disable-next-line no-param-reassign
      state.isWaitingForResponse = false;
    },
  },
});

export const {
  startDirectoryIndexing,
  stopDirectoryIndexing,
  startWaitingForResponse,
  stopWaitingForResponse,
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
