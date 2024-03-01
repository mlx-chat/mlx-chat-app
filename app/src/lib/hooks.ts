import {
  useEffect,
  useRef,
  useState,
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

export function convertToNiceShortcut(shortcut: string) {
  return shortcut.replace('Cmd', '⌘').replace('Option', '⌥').replace('Shift', '⇧').replaceAll(
    '+',
    '',
  );
}

export function useKeyboardShortcut() {
  const [isListening, setIsListening] = useState(false);
  const [shortcut, setShortcut] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isListening) { return; }

      // Prevent default action to avoid interfering with normal browser shortcuts
      event.preventDefault();

      // command key for mac icon
      //

      const keys = [];
      if (event.ctrlKey) { keys.push('Ctrl'); }
      if (event.shiftKey) { keys.push('Shift'); }
      if (event.altKey) { keys.push('Option'); }
      if (event.metaKey) {
        keys.push('Cmd'); // Command key for Mac
      }
      // Avoid adding modifier keys alone, check if another key is also pressed
      if (
        event.key.length === 1
        || (event.key !== 'Control' && event.key !== 'Shift' && event.key !== 'Alt'
          && event.key !== 'Meta')
      ) {
        keys.push(event.key.toUpperCase());
      }

      const combination = keys.join('+');
      setShortcut(combination);
    };

    if (isListening) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isListening]);

  const startListening = () => setIsListening(true);
  const stopListening = () => setIsListening(false);

  return {
    startListening,
    stopListening,
    shortcut,
  };
}
