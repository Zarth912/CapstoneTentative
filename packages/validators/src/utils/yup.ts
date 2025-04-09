import { isValidPhoneNumber } from 'libphonenumber-js';
import * as yup from 'yup';

import { addressRegex, validatePostalCode } from './index';

yup.setLocale({
  mixed: {
    required: 'requiredField',
    notType: ({ type }) => {
      if (type === 'number') {
        return 'invalidNumber';
      }
    },
  },
  string: {
    email: 'invalidEmail',
    url: 'invalidUrl',
    min: ({ min }) => ({ key: 'fieldTooShort', values: { min } }),
    max: ({ max }) => ({ key: 'fieldTooBig', values: { max } }),
    length: ({ length }) => ({ key: 'fieldToHaveLength', values: { length } }),
  },
  number: {
    positive: 'mustBePositiveNumber',
  },
});

yup.addMethod(yup.string, 'phone', function validatePhoneNumber(_, message) {
  return this.test({
    name: 'phone',
    message: message || 'invalidPhone',
    test: (value) => !value || isValidPhoneNumber(value),
  });
});

yup.addMethod(
  yup.string,
  'postalCode',
  function _validatePostalCode(
    country: string | yup.Reference<string>,
    message,
  ) {
    return this.test({
      name: 'postalCode',
      message: message || 'invalidPostalCode',
      test: (value, context) => {
        if (!value) {
          return true;
        }
        const countryCode =
          typeof country === 'string' ? country : context.parent[country.path];
        return validatePostalCode({ postalCode: value, countryCode });
      },
    });
  },
);

yup.addMethod(
  yup.string,
  'alphanumeric',
  function validateAlphanumeric(_, message) {
    return this.matches(/^[\w\s]*$/, {
      name: 'alphanumeric',
      message: message || 'onlyAlphanumericCharacters',
    });
  },
);

yup.addMethod(
  yup.string,
  'address',
  function validateAddress(yupMessage, jsonMessage) {
    const message = jsonMessage || yupMessage || 'invalidAddress';
    return this.matches(addressRegex, {
      name: 'address',
      message,
      excludeEmptyString: true,
    });
  },
);

export default yup;
