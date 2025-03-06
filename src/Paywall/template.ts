export default `
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <base href="/" />
    <meta name="viewport" content="width=device-width,user-scalable=no"/>
    <meta charset="utf-8">
    <title>Paywall</title>
    <style>
      body {
        margin: 0;
      }

      body .p3-paywall.p3-component.p3-locked[data-p3-layout="portrait"] .p3-outlet {
        transform: translateY(70px);
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div data-poool></div>
    <div id="poool-widget"></div>

    <script>
      globalThis.pooolAccessConfig = globalThis.pooolAccessConfig || {};

      const sendMessage = (data) => {
        globalThis.ReactNativeWebView.postMessage(JSON.stringify(data));
      };

      const script = document.createElement('script');
      script.src = globalThis.pooolAccessConfig.scriptUrl ||
        'https://assets.poool.fr/access.min.js';

      script.onload = async () => {

        console.log(globalThis.pooolAccessConfig.config);
        Access
          .init(globalThis.pooolAccessConfig.appId)
          .config(globalThis.pooolAccessConfig.config)
          .texts(globalThis.pooolAccessConfig.texts)
          .styles(globalThis.pooolAccessConfig.styles)
          .variables(globalThis.pooolAccessConfig.variables)
          .on('resize', e => {
            sendMessage({ type: 'event.resize', data: e });
          })
          .on('release', e => sendMessage({ type: 'event.release', data: e }))
          .on('ready', e => sendMessage({ type: 'event.ready', data: e }))
          .on('lock', e => sendMessage({ type: 'event.lock', data: e }))
          .on('paywallSeen', e => sendMessage({ type: 'event.paywallSeen', data: e }))
          .on('register', e => sendMessage({ type: 'event.register', data: e }))
          .on('formSubmit', e => sendMessage({ type: 'event.formSubmit', data: e }))
          .on('subscribeClick', e => sendMessage({ type: 'event.subscribeClick', data: e }))
          .on('loginClick', e => sendMessage({ type: 'event.loginClick', data: e }))
          .on('discoveryLinkClick', e => sendMessage({ type: 'event.discoveryLinkClick', data: e }))
          .on('customButtonClick', e => sendMessage({ type: 'event.customButtonClick', data: e }))
          .on('dataPolicyClick', e => sendMessage({ type: 'event.dataPolicyClick', data: e }))
          .on('alternativeClick', e => sendMessage({ type: 'event.alternativeClick', data: e }))
          .on('answer', e => sendMessage({ type: 'event.answer', data: e }))
          .on('error', e => sendMessage({ type: 'event.error', data: e }))
          .createPaywall({
            target: '#poool-widget',
            pageType: globalThis.pooolAccessConfig.pageType || 'premium',
          });
      };

      document.body.appendChild(script);
    </script>
  </body>
</html>
`;
