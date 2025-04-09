import { useHeaders } from 'sst/node/api';
import { useSession } from 'sst/node/auth';
import { Yup } from '@frandiaz/cb-front-validators';
import {
  api,
  MoleculerError,
  ServerError,
  ValidationError,
} from '@frandiaz/server';
import * as Sentry from '@sentry/aws-serverless';
import { initTRPC, TRPCError } from '@trpc/server';

import type { Locale, Messages } from './messages';
import { locales, messages } from './messages';

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async () => {
  const headers = useHeaders();
  const localeHeader = headers['x-trpc-locale'];
  const locale = locales.find((loc) => loc === localeHeader) ?? 'es';
  let session;
  try {
    session = useSession();
  } catch (error) {
    session = null;
  }

  return {
    session,
    api,
    locale,
    messages: messages[locale],
  };
};

function yupErrorFormatter(error: Yup.ValidationError, locale: Locale = 'en') {
  const errorKey = error.errors[0] as keyof Messages['yup'];
  return {
    path: error.path,
    error: messages[locale]['yup'][errorKey] || errorKey,
  };
}

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter: ({ shape, error, ctx }) => {
    const locale = ctx?.locale || 'es';
    const isYupError = error.cause instanceof Yup.ValidationError;
    return {
      ...shape,
      message: isYupError
        ? messages[locale]['trpc']['BAD_REQUEST']
        : shape.message,
      data: {
        ...shape.data,
        yupError: isYupError ? yupErrorFormatter(error.cause, locale) : null,
      },
    };
  },
});

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

const errorHandlerMiddleware = t.middleware(async (opts) => {
  const start = Date.now();

  const result = await opts.next();

  const durationMs = Date.now() - start;
  const meta = { path: opts.path, type: opts.type, durationMs };

  if (result.ok) {
    console.log('OK request:', meta);
    return result;
  }

  console.error('Non-OK request:', meta);

  const { error } = result;
  console.error('Error:', error);

  const { locale } = opts.ctx;
  Sentry.addBreadcrumb({
    type: 'http',
    category: 'trpc',
    data: { input: opts.input, path: opts.path, type: opts.type },
  });
  if (error.cause instanceof MoleculerError) {
    const { code: moleculerCode, httpContext } = error.cause;
    Sentry.addBreadcrumb({
      type: 'http',
      category: 'xhr',
      data: {
        method: httpContext.method,
        payload: httpContext.payload,
        query: httpContext.query,
        url: httpContext.url,
        statusCode: httpContext.statusCode,
        moleculerCode,
      },
    });
  }
  Sentry.captureException(error, {
    contexts: {
      response: {
        code: error.code,
        yupError:
          error.cause instanceof Yup.ValidationError
            ? yupErrorFormatter(error.cause, locale)
            : null,
      },
    },
  });
  if (error.code === 'INTERNAL_SERVER_ERROR') {
    const errorMessages = messages[locale].trpc;
    if (error.cause instanceof ValidationError) {
      const code = 'BAD_REQUEST';
      throw new TRPCError({
        code,
        message: errorMessages[code],
        cause: error.cause,
      });
    } else if (error.cause instanceof ServerError) {
      const code = 'INTERNAL_SERVER_ERROR';
      throw new TRPCError({
        code,
        message: errorMessages[code],
        cause: error.cause,
      });
    }
  }
  throw error;
});

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure.use(errorHandlerMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = publicProcedure
  .input(
    Yup.object({
      userUuid: Yup.string().uuid(),
    }).optional(),
  )
  .use(({ ctx, next, input }) => {
    const { session, locale } = ctx;
    const errorMessages = messages[locale].trpc;
    if (
      !session ||
      session.type === 'public' ||
      (input?.userUuid && input.userUuid !== session.properties.user.uuid)
    ) {
      const code = 'UNAUTHORIZED';
      throw new TRPCError({ code, message: errorMessages[code] });
    }
    const { user } = session.properties;
    Sentry.setUser({
      id: user.uuid,
      email: user.email,
      username: user.name,
    });
    return next({
      ctx: {
        user,
        company:
          session.type === 'company' ? session.properties.company : undefined,
      },
    });
  });
