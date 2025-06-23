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
import { StyleSheet, Linking, Image } from 'react-native';
import {
  type WebViewMessageEvent,
  type WebViewProps,
  WebView,
} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockState } from '@junipero/core';

import type { AccessContextValue } from '../contexts';
import type { AccessEvents, WebViewMessage } from '../types';
import { useAccess } from '../hooks';
import paywallHtml from './index.html';

export interface PaywallProps
  extends AccessContextValue, Omit<WebViewProps, 'onError'> {
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
   * The current page type
   *
   * More infos:
   * https://www.poool.dev/docs/access/javascript/access/installation
   */
  pageType?: Parameters<Poool.AccessFactory['createPaywall']>[0]['pageType'];
  /**
   * react-native-webview's onMessage handler
   */
  onMessage?: WebViewProps['onMessage'];
}

export interface PaywallState {
  width: number;
  height: number;
  loading: boolean;
  template: string;
  userId?: string;
  error?: Error;
}

export interface PaywallRef {
  id?: string;
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
  loadTimeout = 2000,
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
  const timeoutRef = useRef<NodeJS.Timeout>();
  const {
    appId,
    config: factoryConfig,
    texts: factoryTexts,
    styles: factoryStyles,
    variables: factoryVariables,
    scriptUrl: factoryScriptUrl,
    releaseContent,
    onIdentityAvailable: factoryOnIdentityAvailable,
    onLock: factoryOnLock,
    onReady: factoryOnReady,
    onRelease: factoryOnRelease,
    onPaywallSeen: factoryOnPaywallSeen,
    onRegister: factoryOnRegister,
    onFormSubmit: factoryOnFormSubmit,
    onSubscribeClick: factoryOnSubscribeClick,
    onLoginClick: factoryOnLoginClick,
    onDiscoveryLinkClick: factoryOnDiscoveryLinkClick,
    onCustomButtonClick: factoryOnCustomButtonClick,
    onDataPolicyClick: factoryOnDataPolicyClick,
    onAlternativeClick: factoryOnAlternativeClick,
    onAnswer: factoryOnAnswer,
    onResize: factoryOnResize,
    onError: factoryOnError,
  } = useAccess();
  const [state, dispatch] = useReducer(mockState<PaywallState>, {
    width: 0,
    height: 0,
    userId: undefined,
    template: '',
    loading: true,
    error: undefined,
  });

  const init = useCallback(async () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const error = new Error('timeout');
      dispatch({ loading: false, error });
      (onError ?? factoryOnError)?.({ error, forceRelease: () => (
        Promise.resolve(releaseContent?.(id || true))
      ) }, ref);
    }, loadTimeout);

    const template = await fetch(Image.resolveAssetSource(paywallHtml)?.uri)
      .then(response => response.text());
    const userId = await AsyncStorage.getItem('_poool')

    dispatch({ userId: userId || '', template, loading: false });
  }, [loadTimeout, id, ref, onError, factoryOnError, releaseContent]);

  useEffect(() => {
    init();
  }, [init]);

  useImperativeHandle(ref, () => ({
    id,
    webViewRef,
  }));

  const sendMessage = useCallback((data: WebViewMessage) => {
    const message = 'poool:rn:' + JSON.stringify(data);
    console.log('Poool/Access/ReactNative : Sending message ->', message);
    webViewRef.current?.postMessage(message);
  }, []);

  const onLoad = useCallback(() => {
    clearTimeout(timeoutRef.current);
  }, []);

  const onMessage = useCallback(async (e: WebViewMessageEvent) => {
    let payload: WebViewMessage = { type: 'unknown' };

    try {
      payload = JSON.parse(e.nativeEvent.data);
    } catch (err) {
      if (factoryConfig?.debug || config?.debug) {
        console.error('Poool/Access/ReactNative:',
          'Cannot decode webview message:', err);
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
          width: Number(data.width || 0),
          height: Number(data.height || 0),
        });
        (onResize ?? factoryOnResize)
          ?.(data as AccessEvents['resize'], ref);
        break;
      case 'event.identityAvailable':
        await AsyncStorage.setItem('_poool', data.userId);
        (onIdentityAvailable ?? factoryOnIdentityAvailable)
          ?.(data as AccessEvents['identityAvailable'], ref);
        break;
      case 'event.lock':
        (onLock ?? factoryOnLock)
          ?.(data as AccessEvents['lock'], ref);
        break;
      case 'event.ready':
        (onReady ?? factoryOnReady)
          ?.(data as AccessEvents['ready'], ref);
        break;
      case 'event.release':
        releaseContent?.(id || true);
        (onRelease ?? factoryOnRelease)
          ?.(data as AccessEvents['release'], ref);
        break;
      case 'event.paywallSeen':
        (onPaywallSeen ?? factoryOnPaywallSeen)
          ?.(data as AccessEvents['paywallSeen'], ref);
        break;
      case 'event.register': {
        try {
          const result = await (onRegister ?? factoryOnRegister)
            ?.(data as AccessEvents['register'], ref);

          sendMessage({
            type: 'event.register:resolve',
            mid: payload.mid,
            data: result,
          });
        } catch (err) {
          sendMessage({
            type: 'event.register:reject',
            mid: payload.mid,
            data: { message: (err as Error).message || err },
          });
        }
        break;
      }
      case 'event.formSubmit': {
        try {
          const result = await (onFormSubmit ?? factoryOnFormSubmit)
            ?.(data as AccessEvents['formSubmit'], ref);

          sendMessage({
            type: 'event.formSubmit:resolve',
            mid: payload.mid,
            data: result,
          });
        } catch (err) {
          sendMessage({
            type: 'event.formSubmit:reject',
            mid: payload.mid,
            data: { message: (err as Error).message || err },
          });
        }
        break;
      }
      case 'event.subscribeClick':
        await (onSubscribeClick ?? factoryOnSubscribeClick)
          ?.(data as AccessEvents['subscribeClick'], ref);
        Linking.openURL(data.url);
        break;
      case 'event.loginClick':
        await (onLoginClick ?? factoryOnLoginClick)
          ?.(data as AccessEvents['loginClick'], ref);
        Linking.openURL(data.url);
        break;
      case 'event.discoveryLinkClick':
        await (onDiscoveryLinkClick ?? factoryOnDiscoveryLinkClick)
          ?.(data as AccessEvents['discoveryLinkClick'], ref);
        Linking.openURL(data.url);
        break;
      case 'event.customButtonClick':
        await (onCustomButtonClick ?? factoryOnCustomButtonClick)
          ?.(data as AccessEvents['customButtonClick'], ref);

        if (data.url) {
          Linking.openURL(data.url);
        }
        break;
      case 'event.dataPolicyClick':
        await (onDataPolicyClick ?? factoryOnDataPolicyClick)
          ?.(data as AccessEvents['dataPolicyClick'], ref);
        Linking.openURL(data.url);
        break;
      case 'event.alternativeClick':
        (onAlternativeClick ?? factoryOnAlternativeClick)
          ?.(data as AccessEvents['alternativeClick'], ref);
        break;
      case 'event.answer':
        (onAnswer ?? factoryOnAnswer)
          ?.(data as AccessEvents['answer'], ref);
        break;
      case 'event.error':
        (onError ?? factoryOnError)
          ?.(data as AccessEvents['error'], ref);
        break;
      default:
        if (factoryConfig?.debug || config?.debug) {
          console.warn('Poool/Access/ReactNative :',
            'Unknown webview message:', payload);
        }
    }
  }, [factoryConfig, id, config, ref,
    // Own events
    onReady, onResize, onIdentityAvailable, onLock, onRelease, onPaywallSeen,
    onRegister, onFormSubmit, onSubscribeClick, onLoginClick,
    onDiscoveryLinkClick, onCustomButtonClick, onDataPolicyClick,
    onAlternativeClick, onAnswer, onError,
    // Factory events
    factoryOnReady, factoryOnResize, factoryOnIdentityAvailable,
    factoryOnLock, factoryOnRelease, factoryOnPaywallSeen, factoryOnRegister,
    factoryOnFormSubmit, factoryOnSubscribeClick, factoryOnLoginClick,
    factoryOnDiscoveryLinkClick, factoryOnCustomButtonClick,
    factoryOnDataPolicyClick, factoryOnAlternativeClick, factoryOnAnswer,
    factoryOnError,
    releaseContent, sendMessage
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
        styles: ${JSON.stringify({
          custom_css: 'html { touch-action: manipulation; }',
          ...styles || {}, ...factoryStyles || {}
        })},
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

  if (state.loading || !state.template || state.error) {
    return null;
  }

  return (
    <WebView
      ref={webViewRef}
      scrollEnabled={false}
      setBuiltInZoomControls={false}
      { ...rest }
      injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
      sharedCookiesEnabled={true}
      style={[rnStyles.webview, style, {
        minWidth: state.width,
        minHeight: state.height,
      }]}
      source={source ?? {
        html: state.template,
        baseUrl: 'http://localhost',
      }}
      onLoad={onLoad}
      onMessage={onMessage}
    />
  );
});

Paywall.displayName = 'Paywall';

export default Paywall;

const rnStyles = StyleSheet.create({
  webview: {
    backgroundColor: 'transparent',
  },
});
