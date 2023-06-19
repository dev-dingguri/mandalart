import {
  SignInCheckOptionsBasic,
  SignInCheckOptionsClaimsObject,
  SignInCheckOptionsClaimsValidator,
  useSigninCheck,
} from 'reactfire';
import { useEffect } from 'react';

const useSigninCheckWrapper = (
  options?:
    | SignInCheckOptionsBasic
    | SignInCheckOptionsClaimsObject
    | SignInCheckOptionsClaimsValidator
) => {
  const { ...useSigninCheckResult } = useSigninCheck(options);
  const { data } = useSigninCheckResult;

  // reactfire 버그 임시 조치:  https://github.com/FirebaseExtended/reactfire/discussions/228
  useEffect(() => {
    const reactFirePreloadedObservables = (
      globalThis as Record<string, unknown>
    )['_reactFirePreloadedObservables'] as Map<string, unknown> | undefined;
    if (reactFirePreloadedObservables) {
      Array.from(reactFirePreloadedObservables.keys())
        .filter((key) => key.includes('database'))
        .forEach((key) => reactFirePreloadedObservables.delete(key));
    }
  }, [data]);

  return useSigninCheckResult;
};

export default useSigninCheckWrapper;
