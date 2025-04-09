export const Stage = {
  Dev: 'dev',
};

export function getConfigParams() {
  const APIGATEWAYS_BASE_URL = 'https://elb.currencybird.cl';
  const devConfig = {
    APP_ENV: 'development',
    APIGATEWAY_CB_URL: `${APIGATEWAYS_BASE_URL}/apigateway-cb/api`,
  };
  return devConfig;
}
