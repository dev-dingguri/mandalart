import Alert, { AlertProps } from 'components/Alert/Alert';
import useBoolean from 'hooks/useBoolean';
import { createContext, useContext, useState, useCallback } from 'react';

type ContextValue = {
  alertProps: AlertProps;
  show: (message: string) => void;
};

const AlertContext = createContext<ContextValue | null>(null);

export const AlertProvider = ({ children }: { children?: React.ReactNode }) => {
  const [isShown, { on: show, off: close }] = useBoolean(false);
  const [message, setMessage] = useState('');

  const showWithMessage = useCallback(
    (message: string) => {
      setMessage(message);
      show();
    },
    [show]
  );

  return (
    <AlertContext.Provider
      value={{
        alertProps: {
          isShown,
          message,
          onClose: close,
        },
        show: showWithMessage,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const { show } = useContext(AlertContext)!;

  return {
    Alert: AlertUI,
    show,
  };
};

const AlertUI = () => {
  const { alertProps } = useContext(AlertContext)!;

  return <Alert {...alertProps} />;
};
