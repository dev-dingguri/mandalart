import { analytics } from '@/lib/firebase';
import {
  AnalyticsCallOptions,
  CustomEventName,
  CustomParams,
  logEvent,
  setUserProperties,
} from 'firebase/analytics';
import { useMemo } from 'react';

const useAnalytics = () => {
  return useMemo(
    () => ({
      logEvent: <T extends string>(
        eventName: CustomEventName<T>,
        eventParams?: {
          [key: string]: any;
        }
      ) => analytics && logEvent(analytics, eventName, eventParams),

      setUserProperties: (
        properties: CustomParams,
        options?: AnalyticsCallOptions
      ) => analytics && setUserProperties(analytics, properties, options),
    }),
    []
  );
};

export default useAnalytics;
