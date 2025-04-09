# Poool Access - React Native Webview SDK

> Poool Access, but for React Native, but in a Webview ✨

## Installation

```bash
yarn add @poool/react-native-access-webview react-native-webview @react-native-async-storage/async-storage
```


## Usage

```jsx
import { Text } from 'react-native';
import {
  AccessContext,
  RestrictedContent,
  Paywall,
} from '@poool/react-native-access-webview';

export default = () => {
  return (
    <>
      { /*
        Wrap everything with our AccessContext component
      */ }
      <AccessContext
        appId="insert_your_app_id"
        config={{ cookies_enabled: true }}
      >
        { /* Wrap your snippet with our Snippet component */ }
        <Snippet>
          <Text>This is a snippet</Text>
        </Snippet>

        { /* Wrap your full content with our RestrictedContent component */ }
        <RestrictedContent>
          <Text>Your article content</Text>
        </RestrictedContent>

        { /*
          Place our <Paywall /> component where you want your paywall to be
          displayed
        */ }
        <Paywall />
      </AccessContext>
    </>
  );
};
```

## Documentation

### `<AccessContext />`

#### Props

- `appId` {`string`} Your Poool App ID
- `scriptUrl` {`string`} (optional, default: `'https://assets.poool.fr/access.min.js'`) Default Poool Access SDK url
- `scriptLoadTimeout` {`number`} (optional, default: `2000`) Timeout for the script to load
- `config` {`Record<string, any>`} (optional) Default paywall config (see the [configuration](https://poool.dev/docs/javascript/access/configuration) documentation).
- `styles` {`Record<string, any>`} (optional) Default paywall styles (see the [styles](https://poool.dev//docs/javascript/access/appearances) documentation).
- `texts` {`Record<string, string>`} (optional) Default paywall texts (see the [texts](https://poool.dev/docs/javascript/access/texts) documentation).
- `variables` {`Record<string, any>`} (optional) Paywall variables (see the [variables](https://poool.dev/docs/javascript/access/variables) documentation).
- `on*` {`(event: Event, paywallRef: PaywallRef) => any`} (optional) Event listeners (see the [events](https://poool.dev/docs/react-native/access/events) documentation).

### `<RestrictedContent />`

#### Props

- `id` {`String`} (optional, default: null) Paywall id

### `<Snippet />`

- `id` {`String`} (optional, default: null) Paywall id

### `<Paywall />`

#### Props

- `id` {`string`} (optional, default: null) Paywall id: used to link the paywall release event to the corresponding snippet/restricted content
- `pageType` {`string`} (optional, default: `'premium'`) Current page type (supported types: `page`, `premium`, `free`)
- `scriptUrl` {`string`} (optional, default: `'https://assets.poool.fr/access.min.js'`) Default Poool Access SDK url
- `scriptLoadTimeout` {`number`} (optional, default: `2000`) Timeout for the script to load
- `config` {`Record<string, any>`} (optional) Paywall config (see the [configuration](https://poool.dev/docs/javascript/access/configuration) documentation).
- `styles` {`Record<string, any>`} (optional) Paywall styles (see the [styles](https://poool.dev//docs/javascript/access/appearances) documentation).
- `texts` {`Record<string, string>`} (optional) Paywall texts (see the [texts](https://poool.dev/docs/javascript/access/texts) documentation).
- `variables` {`Record<string, any>`} (optional) Paywall variables (see the [variables](https://poool.dev/docs/javascript/access/variables) documentation).
- `on*` {`(event: Event, paywallRef: PaywallRef) => any`} (optional) Event listeners (see the [events](https://poool.dev/docs/react-native/access/events) documentation).


### useAccess()

Can be used to retrieve some properties from the current access context, as well as the Access SDK itself.

#### Returns

- `appId` {`string`} Current app ID
- `config` {`Record<string, any>`} Current access context config
- `styles` {`Record<string, any>`} Current access context styles
- `texts` {`Record<string, string>`} Current access context texts
- `variables` {`Record<string, any>`} Current access context variables
- `on*` {`(event: Event, paywallRef: PaywallRef) => any`} Current access context event listeners

#### Example

```js
const { appId } = useAccess();
```

## Contributing

[![](https://contrib.rocks/image?repo=p3ol/react-native-access-webview)](https://github.com/p3ol/react-native-access-webview/graphs/contributors)

Please check the [CONTRIBUTING.md](https://github.com/p3ol/react-native-access-webview/blob/main/CONTRIBUTING.md) doc for contribution guidelines.


## Development

Install dependencies:

```bash
yarn install
```

Run examples:

```bash
yarn example ios
```

or

```bash
yarn example android
```

## License

This software is licensed under [MIT](https://github.com/p3ol/react-native-access-webview/blob/master/LICENSE).
