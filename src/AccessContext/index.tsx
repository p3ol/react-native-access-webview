import { type ComponentPropsWithoutRef, useCallback, useReducer } from 'react';
import { mockState } from '@junipero/core';

import { type AccessContextValue, AccessContext as Ctx } from '../contexts';

export interface AccessContextProps extends
  AccessContextValue, ComponentPropsWithoutRef<any> {
  /**
   * The poool access script url
   *
   * More infos:
   * https://www.poool.dev/docs/access/javascript/access/installation
   */
  scriptUrl?: string;
}

export interface AccessContextState {
  released?: (string | boolean)[];
}

const AccessContext = ({
  appId,
  config,
  texts,
  styles,
  variables,
  scriptUrl = 'https://assets.poool.fr/access.min.js',
  ...rest
}: AccessContextProps) => {
  const [state, dispatch] = useReducer(mockState<AccessContextState>, {
    released: [],
  });

  const releaseContent = useCallback((id: string) => {
    dispatch(s => ({ released: [...(s.released || []), id] }));
  }, []);

  const getContext = useCallback(() => ({
    appId,
    config,
    texts,
    styles,
    variables,
    scriptUrl,
    released: state.released,
    releaseContent,
  }), [
    appId, config, texts, styles, variables, scriptUrl,
    state.released,
    releaseContent,
  ]);

  return (
    <Ctx.Provider value={getContext()} { ...rest } />
  );
};

AccessContext.displayName = 'AccessContext';

export default AccessContext;
