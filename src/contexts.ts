import type { Poool } from 'poool-access';
import { createContext } from 'react';

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
   * The released paywalls
   */
  released?: (string | boolean)[];
  /**
   * Function to release content for a given paywall (or every paywalls)
   * @param id The paywall ID
   */
  releaseContent?(id: string | boolean): void;
}

export const AccessContext = createContext<AccessContextValue>({});
