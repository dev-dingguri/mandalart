import { useMemo } from 'react';
import useToggle from 'hooks/useToggle';

const useBoolean = (initialValue: boolean) => {
  const [value, toggle] = useToggle(initialValue);

  const handlers = useMemo(
    () => ({
      toggle,
      on: () => toggle(true),
      off: () => toggle(false),
    }),
    [toggle]
  );

  return [value, handlers] as const;
};

export default useBoolean;
