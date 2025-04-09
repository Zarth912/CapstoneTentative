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
