import type { StackContext } from 'sst/constructs';
import { Api as ApiGateway, Auth, Config } from 'sst/constructs';

import { getConfigParams } from '../app.config';

export function Api({ stack }: StackContext) {
  const config = getConfigParams();
  const APIGATEWAY_CB_APIKEY = new Config.Secret(stack, 'APIGATEWAY_CB_APIKEY');

  const api = new ApiGateway(stack, 'api', {
    routes: {
      'GET /trpc/{proxy+}': 'packages/api/src/lambda.handler',
      'POST /trpc/{proxy+}': 'packages/api/src/lambda.handler',
      'GET /appversion': 'packages/api/src/checkAppVersion.handler',
    },
    defaults: {
      function: {
        environment: {
          APIGATEWAY_CB_URL: config.APIGATEWAY_CB_URL,
        },
        bind: [APIGATEWAY_CB_APIKEY],
        permissions: ['s3'],
        timeout: '90 seconds',
        memorySize: '256 MB',
        logRetention: 'one_month',
      },
    },
  });

  const auth = new Auth(stack, 'auth', {
    authenticator: {
      handler: 'packages/auth/src/index.handler',
      environment: {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
      },
    },
  });

  auth.attach(stack, { api });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
