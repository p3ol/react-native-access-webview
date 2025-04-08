import { type ComponentPropsWithoutRef, useCallback, useReducer } from 'react';
import { mockState } from '@junipero/core';

import { type AccessContextValue, AccessContext as Ctx } from '../contexts';

export interface AccessContextProps extends Omit<
  AccessContextValue, 'released' | 'releaseContent'
>, ComponentPropsWithoutRef<any> {}

export interface AccessContextState {
  released?: (string | boolean)[];
}

const AccessContext = ({
  appId,
  config,
  texts,
  styles,
  variables,
  loadTimeout = 2000,
  scriptUrl = 'https://assets.poool.fr/access.min.js',
  onIdentityAvailable,
  onLock,
  onReady,
  onRelease,
  onPaywallSeen,
  onRegister,
  onFormSubmit,
  onSubscribeClick,
  onLoginClick,
  onDiscoveryLinkClick,
  onCustomButtonClick,
  onDataPolicyClick,
  onAlternativeClick,
  onAnswer,
  onResize,
  onError,
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
    loadTimeout,
    released: state.released,
    releaseContent,
    onIdentityAvailable,
    onLock,
    onReady,
    onRelease,
    onPaywallSeen,
    onRegister,
    onFormSubmit,
    onSubscribeClick,
    onLoginClick,
    onDiscoveryLinkClick,
    onCustomButtonClick,
    onDataPolicyClick,
    onAlternativeClick,
    onAnswer,
    onResize,
    onError,
  }), [
    appId, config, texts, styles, variables, scriptUrl, loadTimeout,
    state.released,
    releaseContent,
    onIdentityAvailable, onLock, onReady, onRelease, onPaywallSeen,
    onRegister, onFormSubmit, onSubscribeClick, onLoginClick,
    onDiscoveryLinkClick, onCustomButtonClick, onDataPolicyClick,
    onAlternativeClick, onAnswer, onResize, onError,
  ]);

  return (
    <Ctx.Provider value={getContext()} { ...rest } />
  );
};

AccessContext.displayName = 'AccessContext';

export default AccessContext;
