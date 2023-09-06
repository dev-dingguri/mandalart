import Alert, { AlertProps } from 'components/Alert/Alert';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  PropsWithChildren,
} from 'react';
import { useBoolean } from 'usehooks-ts';

type AlertContextType = {
  alertProps: AlertProps;
  open: (message: string) => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertProvider = ({ children }: PropsWithChildren) => {
  const { value: isOpen, setTrue: open, setFalse: close } = useBoolean(false);
  const [message, setMessage] = useState('');

  const openWithMessage = useCallback(
    (message: string) => {
      setMessage(message);
      open();
    },
    [open]
  );

  return (
    <AlertContext.Provider
      value={{
        alertProps: {
          isOpen,
          message,
          onClose: close,
        },
        open: openWithMessage,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within a AlertProvider.');
  }
  const { alertProps, open } = context;
  return {
    Alert: () => <Alert {...alertProps} />,
    open,
  };
};
