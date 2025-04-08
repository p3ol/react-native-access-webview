import type { Poool } from 'poool-access';
import { createContext } from 'react';
import type { AccessEvents, EventCallback } from './types';

export interface AccessContextValue {
  /**
   * Your poool app ID
   *
   * More infos:
   * https://www.poool.dev/docs/access/javascript/access/installation
   */
  appId?: string;
  /**
   * Your poool access config options
   *
   * More infos:
   * https://www.poool.dev/docs/access/javascript/access/configuration
   */
  config?: Poool.AccessConfigOptions;
  /**
   * Your poool access texts ati_tag_options
   *
   * More infos: https://www.poool.dev/docs/access/javascript/access/texts
   */
  texts?: { [key: string]: string };
  /**
   * Your poool access styles
   *
   * More infos: https://www.poool.dev/docs/access/javascript/access/styles
   */
  styles?: Poool.styles & { [key: string]: any };
  /**
   * Your pool access variables
   *
   * More infos: https://www.poool.dev/docs/access/javascript/access/variables
   */
  variables?: { [key: string]: any };
  /**
   * The poool access script url
   *
   * More infos:
   * https://www.poool.dev/docs/access/javascript/access/installation
   */
  scriptUrl?: string;
  /**
   * Time for the webview to load before aborting
   */
  loadTimeout?: number;
  /**
   * The released paywalls
   */
  released?: (string | boolean)[];
  /**
   * Function to release content for a given paywall (or every paywalls)
   * @param id The paywall ID
   */
  releaseContent?(id: string | boolean): void;
  
  // Events
  onIdentityAvailable?: EventCallback<AccessEvents['identityAvailable']>;
  onLock?: EventCallback<AccessEvents['lock']>;
  onReady?: EventCallback<AccessEvents['ready']>;
  onRelease?: EventCallback<AccessEvents['release']>;
  onPaywallSeen?: EventCallback<AccessEvents['paywallSeen']>;
  onRegister?: EventCallback<
    AccessEvents['register'],
    | string[]
    | { fieldKey: string; message: string; }[]
    | void
    | Promise<
      | string[]
      | { fieldKey: string; message: string; }[]
      | void
      >
  >;
  onFormSubmit?: EventCallback<
    AccessEvents['formSubmit'],
    | string[]
    | { fieldKey: string; message: string; }[]
    | void
    | Promise<
      | string[]
      | { fieldKey: string; message: string; }[]
      | void
      >
  >;
  onSubscribeClick?: EventCallback<AccessEvents['subscribeClick']>;
  onLoginClick?: EventCallback<AccessEvents['loginClick']>;
  onDiscoveryLinkClick?: EventCallback<AccessEvents['discoveryLinkClick']>;
  onCustomButtonClick?: EventCallback<AccessEvents['customButtonClick']>;
  onDataPolicyClick?: EventCallback<AccessEvents['dataPolicyClick']>;
  onAlternativeClick?: EventCallback<AccessEvents['alternativeClick']>;
  onAnswer?: EventCallback<AccessEvents['answer']>;
  onError?: EventCallback<AccessEvents['error']>;
  onResize?: EventCallback<AccessEvents['resize']>;
}

export const AccessContext = createContext<AccessContextValue>({});
