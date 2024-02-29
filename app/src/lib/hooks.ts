import {
  useEffect,
  useRef,
} from 'react';
import {
  useDispatch,
  useSelector,
  useStore,
} from 'react-redux';
import type {
  TypedUseSelectorHook,
} from 'react-redux';
import type {
  AppDispatch,
  AppStore,
  RootState,
} from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore: () => AppStore = useStore;

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
