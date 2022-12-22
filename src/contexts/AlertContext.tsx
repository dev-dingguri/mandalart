import Alert from 'components/Alert/Alert';
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';

type ContextValue = {
  isShown: boolean;
  message: string;
  onShow: (message: string) => void;
  onClose: () => void;
};

const AlertContext = createContext<ContextValue | null>(null);

export const AlertProvider = ({ children }: { children?: React.ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);

  const onShow = useCallback((message: string) => setMessage(message), []);
  const onClose = useCallback(() => setMessage(null), []);

  const value = useMemo(
    () => ({
      isShown: message !== null,
      message: message ? message : '',
      onShow,
      onClose,
    }),
    [message, onShow, onClose]
  );

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};

export const useAlert = () => {
  const { onShow } = useContext(AlertContext)!;

  return {
    Alert: AlertUI,
    showAlert: onShow,
  };
};

const AlertUI = () => {
  const { isShown, message, onClose } = useContext(AlertContext)!;

  return <Alert isShown={isShown} message={message} onClose={onClose} />;
};
