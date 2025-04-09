const messages = {
  trpc: {
    BAD_REQUEST: 'Error de validación',
    UNAUTHORIZED: 'No autorizado',
    INTERNAL_SERVER_ERROR: 'Error de servidor',
  },
  yup: {
    requiredField: 'Campo requerido',
  },
  auth: {
    sendResetPasswordCode: {
      invalidEmail: 'Correo inválido',
    },
    validateOtpCode: {
      invalidOtpCode: 'Código inválido',
    },
  },
  user: {
    changePassword: {
      invalidCurrentPassword: 'Contraseña actual inválida',
    },
  },
  transfer: {
    createIncomingTransfer: {
      forbidden:
        'Error, usuario requiere validaciones adicionales, por favor contáctate con nuestro canal de atención al público',
    },
  },
};

export default messages;

export type Messages = typeof messages;
