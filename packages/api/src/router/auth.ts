import { createTRPCRouter, publicProcedure } from '../trpc';

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(async ({ ctx }) => {
    const { session } = ctx;
    if (!session || session.type === 'public') {
      return null;
    }
    return {
      type: session.type,
      user: session.properties.user,
      company:
        session.type === 'company' ? session.properties.company : undefined,
    };
  }),
});
