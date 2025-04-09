import yup from '../utils/yup';

export const LoginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
  sessionType: yup.string().oneOf(['user', 'company']).required(),
});

export const RefreshTokenSchema = yup.object({
  token: yup.string().required(),
});
