import { ApiHandler } from 'sst/node/api';
import * as Sentry from '@sentry/aws-serverless';
import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { appRouter, createTRPCContext } from '.';

export const handler = Sentry.wrapHandler(
  ApiHandler(
    awsLambdaRequestHandler({
      router: appRouter,
      createContext: createTRPCContext,
    }),
  ),
);
