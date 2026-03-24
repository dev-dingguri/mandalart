import { analytics } from '@/lib/firebase';
import {
  logEvent as firebaseLogEvent,
  setUserProperties as firebaseSetUserProperties,
  type CustomParams,
} from 'firebase/analytics';

/**
 * Firebase Analytics 래퍼.
 * analytics 인스턴스가 null(measurementId 미설정)이면 no-op.
 */
export const logEvent = (
  eventName: string,
  eventParams?: Record<string, string | number | boolean>,
) => {
  if (analytics) firebaseLogEvent(analytics, eventName, eventParams);
};

export const setUserProperties = (properties: CustomParams) => {
  if (analytics) firebaseSetUserProperties(analytics, properties);
};
