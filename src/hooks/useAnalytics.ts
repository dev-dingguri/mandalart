import { useAnalyticsSdk } from 'contexts/FirebaseSdksContext';
import {
  AnalyticsCallOptions,
  CustomEventName,
  CustomParams,
  logEvent,
  setUserProperties,
} from 'firebase/analytics';
import { useMemo } from 'react';

const useAnalytics = () => {
  const analytics = useAnalyticsSdk();

  return useMemo(
    () => ({
      logEvent: <T extends string>(
        eventName: CustomEventName<T>,
        eventParams?: {
          [key: string]: any;
        }
      ) => logEvent(analytics, eventName, eventParams),

      setUserProperties: (
        properties: CustomParams,
        options?: AnalyticsCallOptions
      ) => setUserProperties(analytics, properties, options),
    }),
    [analytics]
  );
};

export default useAnalytics;
