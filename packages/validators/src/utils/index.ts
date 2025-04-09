import {
  formatNumber as formatPhoneNumber,
  isValidPhoneNumber,
} from 'libphonenumber-js';
import deburr from 'lodash/deburr';
import {
  postcodeValidator,
  postcodeValidatorExistsForCountry,
} from 'postcode-validator';

export { postcodeValidator, isValidPhoneNumber, formatPhoneNumber };

export const addressRegex =
  /([A-ZÑa-zñ]+\s?\d+)|(\d+\s?[A-ZÑa-zñ]+)|([A-ZÑa-zñ]+\s?SN$)/;

export function validateAddress(address: string) {
  return addressRegex.test(cleanAddress(address));
}

export const namesRegex =
  /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$/;

export function cleanAddress(address: string) {
  return deburr(address)
    .replace(/,/g, '')
    .replace(/-/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const customPostalCodeRules: Record<string, RegExp> = {
  PE: /^\d{5}$/,
};

export function validatePostalCode({
  postalCode,
  countryCode,
}: {
  postalCode: string;
  countryCode: string;
}) {
  if (countryCode in customPostalCodeRules) {
    return customPostalCodeRules[countryCode].test(postalCode);
  }
  const postcode = postcodeValidatorExistsForCountry(countryCode)
    ? countryCode
    : 'INTL';
  return postcodeValidator(postalCode, postcode);
}
