import { useReducer } from 'react';

const toggle = (currentValue: boolean, newValue?: boolean) => {
  return newValue ? newValue : !currentValue;
};

const useToggle = (
  initialValue: boolean
): [boolean, (newValue?: boolean) => void] => {
  return useReducer(toggle, initialValue);
};

export default useToggle;
