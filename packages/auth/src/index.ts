import type { SessionValue } from 'sst/node/auth';
import { useJsonBody } from 'sst/node/api';
import {
  AuthHandler,
  createAdapter,
  getPublicKey,
  Session,
} from 'sst/node/auth';
import { validators } from '@frandiaz/cb-front-validators';
import {
  api,
  MoleculerError,
  ValidationError,
} from '@frandiaz/server';
import { createVerifier } from 'fast-jwt';

export interface User {
  uuid: string;
  name: string;
  email: string;
  nickname?: string;
  accountStatus: 'COMPLETE' | 'PROSPECT';
}

export interface Company {
  uuid: string;
  name: string;
}

declare module 'sst/node/auth' {
  export interface SessionTypes {
    user: {
      user: User;
    };
    company: {
      user: User;
      company?: Company;
    };
  }
}

const credentialsAdapter = createAdapter(() => {
  return async function () {
    const body = useJsonBody();
    try {
      const { email, password, sessionType } =
        await validators.auth.LoginSchema.validate(body);
      const { user } = await api.cb.post('/users/login', {
        origin: 'CB',
        email,
        password,
      });
      const token = Session.create({
        type: sessionType,
        properties: {
          user: {
            uuid: user.uuid,
            name: [user.names, user.lastName, user.lastName2]
              .filter((x) => x)
              .join(' '),
            nickname: user.names,
            email: user.email,
            accountStatus: user.flags === 1 ? 'COMPLETE' : 'PROSPECT',
          },
        },
        options: {
          expiresIn: '1d',
        },
      });
      return {
        statusCode: 200,
        body: JSON.stringify({ token }),
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: error.message }),
        };
      } else if (error instanceof MoleculerError) {
        if (error.code === 409) {
          return {
            statusCode: 401,
            body: JSON.stringify({ error: error.message }),
          };
        }
      }
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'SERVER_ERROR' }),
      };
    }
  };
});

const refreshTokenAdapter = createAdapter(() => {
  return async function () {
    const body = useJsonBody();

    const { token } = await validators.auth.RefreshTokenSchema.validate(body);

    const session: SessionValue = createVerifier({
      algorithms: ['RS512'],
      key: getPublicKey(),
    })(token);

    if (session.type === 'public') {
      return {
        statusCode: 401,
        body: 'unauthorized',
      };
    }
    const user = await api.cb.get('/users/uuid', {
      uuid: session.properties.user.uuid,
    });
    const newToken = Session.create({
      type: 'user',
      properties: {
        user: {
          uuid: user.uuid,
          name: [user.names, user.lastName, user.lastName2]
            .filter((x) => x)
            .join(' '),
          nickname: user.names,
          email: user.email,
          accountStatus: 'COMPLETE',
        },
      },
      options: {
        expiresIn: '1d',
      },
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ token: newToken }),
    };
  };
});

export const handler = AuthHandler({
  providers: {
    credentials: credentialsAdapter(),
    refreshToken: refreshTokenAdapter(),
  },
});
