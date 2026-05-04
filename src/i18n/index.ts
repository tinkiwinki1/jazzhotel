import { ru } from './ru';
import { en } from './en';

export type Locale = 'ru' | 'en';

export const dicts = { ru, en } as const;

export function getDict(locale: Locale) {
  return dicts[locale];
}
