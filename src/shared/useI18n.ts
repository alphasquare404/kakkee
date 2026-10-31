import { useAppPreferences } from './useAppPreferences';
import { translate, type MessageKey } from './i18n';

export function useI18n() {
  const preferences = useAppPreferences();

  return {
    locale: preferences.locale,
    t: (key: MessageKey) => translate(preferences.locale, key),
  };
}
