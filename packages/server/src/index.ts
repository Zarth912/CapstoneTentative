import { Config } from 'sst/node/config';

import { ApigatewayClient } from './apigateway';

const cbApi = new ApigatewayClient({
  baseURL: process.env.APIGATEWAY_CB_URL as string,
  headers: {
    authorization: `Bearer ${Config.APIGATEWAY_CB_APIKEY}`,
    'cb-origin': 'mobile',
  },
});

export const api = {
  cb: cbApi,
};

export * from './errors';
