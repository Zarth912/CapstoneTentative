import type { Messages } from './es';

const messages = {
  trpc: {
    BAD_REQUEST: 'Validation error',
    UNAUTHORIZED: 'Unauthorized',
    INTERNAL_SERVER_ERROR: 'Server error',
  },
  yup: {
    requiredField: 'Required field',
  },
  auth: {
    sendResetPasswordCode: {
      invalidEmail: 'Invalid email',
    },
    validateOtpCode: {
      invalidOtpCode: 'Invalid code',
    },
  },
  user: {
    changePassword: {
      invalidCurrentPassword: 'Invalid current password',
    },
  },
  transfer: {
    createIncomingTransfer: {
      forbidden:
        'Error, user requires additional validations, please contact our customer service channel',
    },
  },
} satisfies Messages;

export default messages;
