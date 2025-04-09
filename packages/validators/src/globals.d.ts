import type { Reference } from 'yup';

declare module 'yup' {
  interface StringSchema<
    TType extends Maybe<string> = string | undefined,
    TContext = AnyObject,
    TDefault = undefined,
    TFlags extends Flags = '',
  > extends Schema<TType, TContext, TDefault, TFlags> {
    phone(): this;
    address(): this;
    postalCode(countryCode: string | Reference): this;
    rut(): this;
    alphanumeric(): this;
  }
}
