import en from './en';
import es from './es';

export const messages = { es, en };
export type { Messages } from './es';

export type Locale = keyof typeof messages;
export const locales = ['es', 'en'] as Locale[];
