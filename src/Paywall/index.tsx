
import type { Poool } from 'poool-access';
import {
  type RefObject,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { type ViewProps, StyleSheet } from 'react-native';
import {
  type WebViewMessageEvent,
  type WebViewProps,
  WebView,
} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockState } from '@junipero/core';

import type { AccessContextValue } from '../contexts';
import type { AccessEvents, EventCallback, WebViewMessage } from '../types';
import { useAccess } from '../hooks';
import paywallHtml from './template';

export interface PaywallProps extends AccessContextValue, ViewProps {
  /**
   * Optional unique paywall id. When released, the snippet with the same id
   * will be hidden, and the corresponding restricted content will be displayed.
   */
  id?: string;
  /**
   * Custom webview html source (default: ./index.html)
   */
  source?: WebViewProps['source'];
  /**
   * The poool access script url
   *
   * More infos:
   * https://www.poool.dev/docs/access/javascript/access/installation
   */
  scriptUrl?: string;
  /**
   * The current page type
   *
   * More infos:
   * https://www.poool.dev/docs/access/javascript/access/installation
   */
  pageType?: Parameters<Poool.AccessFactory['createPaywall']>[0]['pageType'];

  // Events
  onIdentityAvailable?: EventCallback<AccessEvents['identityAvailable']>;
  onLock?: EventCallback<AccessEvents['lock']>;
  onReady?: EventCallback<AccessEvents['ready']>;
  onRelease?: EventCallback<AccessEvents['release']>;
  onPaywallSeen?: EventCallback<AccessEvents['paywallSeen']>;
  onRegister?: EventCallback<AccessEvents['register']>;
  onFormSubmit?: EventCallback<AccessEvents['formSubmit']>;
  onSubscribeClick?: EventCallback<AccessEvents['subscribeClick']>;
  onLoginClick?: EventCallback<AccessEvents['loginClick']>;
  onDiscoveryLinkClick?: EventCallback<AccessEvents['discoveryLinkClick']>;
  onCustomButtonClick?: EventCallback<AccessEvents['customButtonClick']>;
  onDataPolicyClick?: EventCallback<AccessEvents['dataPolicyClick']>;
  onAlternativeClick?: EventCallback<AccessEvents['alternativeClick']>;
  onAnswer?: EventCallback<AccessEvents['answer']>;
  onError?: EventCallback<AccessEvents['error']>;
  onResize?: EventCallback<AccessEvents['resize']>;
  onMessage?: WebViewProps['onMessage'];
}

export interface PaywallState {
  width: number;
  height: number;
  loading: boolean;
  userId?: string;
}

export interface PaywallRef {
  webViewRef: RefObject<WebView>;
}

const Paywall = forwardRef<PaywallRef, PaywallProps>(({
  id,
  source,
  style,
  config,
  texts,
  styles,
  variables,
  pageType = 'premium',
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
}, ref) => {
  const webViewRef = useRef<WebView>(null);
  const {
    appId,
    config: factoryConfig,
    texts: factoryTexts,
    styles: factoryStyles,
    variables: factoryVariables,
    scriptUrl: factoryScriptUrl,
    releaseContent,
  } = useAccess();

  const [state, dispatch] = useReducer(mockState<PaywallState>, {
    width: 0,
    height: 0,
    userId: undefined,
    loading: true,
  });

  useEffect(() => {
    AsyncStorage.getItem('_poool').then(userId => {
      dispatch({ userId: userId || '', loading: false });
    });
  }, []);

  useImperativeHandle(ref, () => ({
    webViewRef,
  }));

  const onMessage = useCallback(async (e: WebViewMessageEvent) => {
    let payload: WebViewMessage = { type: 'unknown' };

    try {
      payload = JSON.parse(e.nativeEvent.data);
    } catch (err) {
      if (factoryConfig?.debug || config?.debug) {
        console.error('Cannot decode webview message:', err);
      }
    }

    const data = payload.data || {};

    switch (payload.type) {
      case 'log': {
        const level: 'log' | 'error' | 'warn' | 'info' | 'debug' = data.level ||
          'log';
        console[level]?.(...(data.args || []));
        break;
      }
      case 'cookies.set': {
        if (
          data.key === '_poool' &&
          (factoryConfig?.cookies_enabled || config?.cookies_enabled)
        ) {
          await AsyncStorage.setItem('_poool', data.value);
        }
        break;
      }
      case 'event.resize':
        dispatch({
          width: data.width || 0,
          height: data.height || 0,
        });
        onResize?.(data as AccessEvents['resize']);
        break;
      case 'event.identityAvailable':
        await AsyncStorage.setItem('_poool', data.userId);
        onIdentityAvailable?.(data as AccessEvents['identityAvailable']);
        break;
      case 'event.lock':
        onLock?.(data as AccessEvents['lock']);
        break;
      case 'event.ready':
        onReady?.(data as AccessEvents['ready']);
        break;
      case 'event.release':
        releaseContent?.(id || true);
        onRelease?.(data as AccessEvents['release']);
        break;
      case 'event.paywallSeen':
        onPaywallSeen?.(data as AccessEvents['paywallSeen']);
        break;
      case 'event.register':
        onRegister?.(data as AccessEvents['register']);
        break;
      case 'event.formSubmit':
        onFormSubmit?.(data as AccessEvents['formSubmit']);
        break;
      case 'event.subscribeClick':
        onSubscribeClick?.(data as AccessEvents['subscribeClick']);
        break;
      case 'event.loginClick':
        onLoginClick?.(data as AccessEvents['loginClick']);
        break;
      case 'event.discoveryLinkClick':
        onDiscoveryLinkClick?.(data as AccessEvents['discoveryLinkClick']);
        break;
      case 'event.customButtonClick':
        onCustomButtonClick?.(data as AccessEvents['customButtonClick']);
        break;
      case 'event.dataPolicyClick':
        onDataPolicyClick?.(data as AccessEvents['dataPolicyClick']);
        break;
      case 'event.alternativeClick':
        onAlternativeClick?.(data as AccessEvents['alternativeClick']);
        break;
      case 'event.answer':
        onAnswer?.(data as AccessEvents['answer']);
        break;
      case 'event.error':
        onError?.(data as AccessEvents['error']);
        break;
      default:
        if (factoryConfig?.debug || config?.debug) {
          console.warn('Unknown webview message:', payload);
        }
    }
  }, [
    factoryConfig,
    id, config,
    onReady, onResize, onIdentityAvailable, onLock, onRelease, onPaywallSeen,
    onRegister, onFormSubmit, onSubscribeClick, onLoginClick,
    onDiscoveryLinkClick, onCustomButtonClick, onDataPolicyClick,
    onAlternativeClick, onAnswer, onError,
    releaseContent,
  ]);

  const injectedJavaScript = useMemo(() => `
    const cookies = ${JSON.stringify({
      ...state.userId && { _poool: state.userId },
    })};

    Object.defineProperty(document, 'cookie', {
      get: () => Object.keys(cookies).map(
        key => \`\${key}=\${cookies[key]}\`
      ).join('; '),
      set: (cookie) => {
        const [key, value] = cookie.split('=');
        cookies[key] = value.split(';')[0];

        globalThis.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'cookies.set',
          data: { key, value: cookies[key] },
        }));
      },
    });

    const consoleLog = (level, ...args) => {
      args = args.map(arg => arg instanceof Error ? {
        message: arg.message,
      } : arg);
      globalThis.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'log', data: { level, args },
      }));
    }

    globalThis.console = {
      log: (...log) => consoleLog('log', ...log),
      debug: (...log) => consoleLog('debug', ...log),
      info: (...log) => consoleLog('info', ...log),
      warn: (...log) => consoleLog('warn', ...log),
      error: (...log) => consoleLog('error', ...log),
    };

    globalThis.pooolAccessConfig = Object.assign(
      globalThis.pooolAccessConfig || {},
      {
        appId: ${JSON.stringify(appId)},
        scriptUrl: ${JSON.stringify(scriptUrl || factoryScriptUrl)},
        config: ${JSON.stringify({
          signature_enabled: false,
          ...config || {}, ...factoryConfig || {},
        })},
        texts: ${JSON.stringify({ ...texts || {}, ...factoryTexts || {} })},
        styles: ${JSON.stringify({ ...styles || {}, ...factoryStyles || {} })},
        variables: ${JSON.stringify({ ...variables ||
          {}, ...factoryVariables || {} })},
        pageType: ${JSON.stringify(pageType)},
      }
    );
  `, [
    appId,
    config, factoryConfig,
    texts, factoryTexts,
    styles, factoryStyles,
    variables, factoryVariables,
    scriptUrl, factoryScriptUrl,
    pageType,
    state.userId,
  ]);

  if (state.loading) {
    return null;
  }

  return (
    <WebView
      ref={webViewRef}
      { ...rest }
      injectedJavaScript={injectedJavaScript}
      sharedCookiesEnabled={true}
      style={[rnStyles.webview, style, {
        minWidth: state.width,
        minHeight: state.height,
      }]}
      source={source ?? {
        html: paywallHtml,
        baseUrl: 'http://localhost',
      }}
      onMessage={onMessage}
    />
  );
});

Paywall.displayName = 'Paywall';

export default Paywall;

const rnStyles = StyleSheet.create({
  webview: {
    backgroundColor:'transparent',
  },
});
