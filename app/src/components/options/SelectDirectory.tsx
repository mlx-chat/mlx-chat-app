import {
  faCheckCircle,
  faCircleNotch,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {
  FontAwesomeIcon,
} from '@fortawesome/react-fontawesome';
import React, {
  useEffect,
} from 'react';
import {
  useAppSelector,
  usePrevious,
} from '../../lib/hooks';
import {
  cn,
} from '../../lib/utils';
import {
  Button,
} from '../ui/button';

const SelectDirectory = ({
  handleOpen,
  selectedDirectory,
  clearDirectory,
}: {
  handleOpen: () => void;
  selectedDirectory: string | null;
  clearDirectory: () => void;
}) => {
  const shortenedDirectory = selectedDirectory
    ? `/${selectedDirectory.split('/')[1]}/../${selectedDirectory.split('/').pop()}`
    : 'Select Directory';
  const [isCheckShowing, setIsCheckShowing] = React.useState(false);

  const isDirectoryIndexing = useAppSelector((state) => state.isDirectoryIndexing);

  const oldLoadingState = usePrevious(isDirectoryIndexing);

  useEffect(() => {
    if (oldLoadingState && !isDirectoryIndexing) {
      setIsCheckShowing(true);
      setTimeout(() => {
        setIsCheckShowing(false);
      }, 3000);
    }
  }, [isDirectoryIndexing]);

  return (
    <div className='flex no-drag items-center group'>
      <Button
        className={cn(
          'bg-transparent text-neutral-800 z-0 dark:text-white text-sm font-normal shadow-none hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all border-0 border-zinc-600 w-fit rounded-md py-1 px-2 flex items-center cursor-pointer',
          {
            'hover:bg-transparent dark:hover:bg-transparent cursor-default': isDirectoryIndexing,
          },
        )}
        onClick={isDirectoryIndexing ? undefined : handleOpen}
      >
        <div className='pr-1'>
          {selectedDirectory && !isDirectoryIndexing && !isCheckShowing && (
            <div
              className='group-hover:opacity-100 opacity-0 px-1 z-10 hover:bg-neutral-300 dark:hover:bg-neutral-800 rounded-sm transition-all cursor-pointer'
              onClick={(e) => {
                e.stopPropagation();
                clearDirectory();
              }}
            >
              <FontAwesomeIcon
                icon={faXmark}
              />
            </div>
          )}
          {isDirectoryIndexing && <FontAwesomeIcon className='animate-spin' icon={faCircleNotch} />}
          {isCheckShowing && <FontAwesomeIcon className='text-green-500' icon={faCheckCircle} />}
        </div>
        {shortenedDirectory}
      </Button>
    </div>
  );
};

export default SelectDirectory;
