import type { SSTConfig } from 'sst';

import { Api } from './stacks/Api';

export default {
  config(_input) {
    return {
      name: 'cb-front-api-serverless',
      region: 'us-east-1',
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      runtime: 'nodejs18.x',
      environment: {
        TZ: 'America/Santiago',
      },
    });
    app.stack(Api);
  },
} satisfies SSTConfig;
