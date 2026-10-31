import { useAppPreferences } from './useAppPreferences';
import { translate, type MessageKey } from './i18n';

export function useI18n() {
  const preferences = useAppPreferences();

  return {
    locale: preferences.locale,
    t: (
      key: MessageKey,
      params?: Readonly<Record<string, string | number>>,
    ) => translate(preferences.locale, key, params),
  };
}
