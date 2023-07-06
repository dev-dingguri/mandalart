import Alert, { AlertProps } from 'components/Alert/Alert';
import useBoolean from 'hooks/useBoolean';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  PropsWithChildren,
} from 'react';

type AlertContextType = {
  alertProps: AlertProps;
  show: (message: string) => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertProvider = ({ children }: PropsWithChildren) => {
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
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within a AlertProvider.');
  }
  const { alertProps, show } = context;
  return {
    Alert: () => <Alert {...alertProps} />,
    show,
  };
};
