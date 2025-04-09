import * as utils from './utils';
import * as auth from './validators/auth';

export const validators = {
  auth,
  utils,
};

export { default as Yup } from './utils/yup';
