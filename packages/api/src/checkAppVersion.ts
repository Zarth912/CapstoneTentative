import { ApiHandler } from 'sst/node/api';

export const handler = ApiHandler(async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      runtimeVersionAndroid: '2.7.0',
      runtimeVersionIos: '2.7.0',
      updateUrlAndroid:
        'https://play.google.com/store/apps/details?id=cl.currencybird.cbmobileapp',
      updateUrliOS:
        'https://apps.apple.com/cl/app/currencybird-env%C3%ADos-de-dinero/id6503993314',
    }),
  };
});
