/**
 * Internationalization (i18n) Utilities
 *
 * Simple i18n implementation for Next.js App Router.
 * For production, consider: next-intl, react-i18next, or Lingui.
 *
 * @example
 * ```tsx
 * // In a component
 * import { useTranslation, Trans } from '@/lib/features/i18n';
 *
 * function MyComponent() {
 *   const t = useTranslation('common');
 *
 *   return (
 *     <div>
 *       <h1>{t('welcome')}</h1>
 *       <p>{t('greeting', { name: 'World' })}</p>
 *     </div>
 *   );
 * }
 * ```
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Supported locales
export const LOCALES = ['en', 'es', 'fr', 'de', 'ja'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

// Translation dictionary type
export type TranslationDictionary = Record<string, string | Record<string, string>>;
export type Translations = Record<Locale, TranslationDictionary>;

// Example translations (in production, load from JSON files)
const translations: Translations = {
  en: {
    common: {
      welcome: 'Welcome',
      greeting: 'Hello, {{name}}!',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success!',
    },
    auth: {
      login: 'Log in',
      logout: 'Log out',
      signUp: 'Sign up',
      email: 'Email',
      password: 'Password',
    },
    errors: {
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email',
      minLength: 'Must be at least {{min}} characters',
    },
  },
  es: {
    common: {
      welcome: 'Bienvenido',
      greeting: '¡Hola, {{name}}!',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      loading: 'Cargando...',
      error: 'Ocurrió un error',
      success: '¡Éxito!',
    },
    auth: {
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      signUp: 'Registrarse',
      email: 'Correo electrónico',
      password: 'Contraseña',
    },
    errors: {
      required: 'Este campo es obligatorio',
      invalidEmail: 'Ingrese un correo válido',
      minLength: 'Debe tener al menos {{min}} caracteres',
    },
  },
  fr: {
    common: {
      welcome: 'Bienvenue',
      greeting: 'Bonjour, {{name}}!',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      loading: 'Chargement...',
      error: 'Une erreur est survenue',
      success: 'Succès!',
    },
    auth: {
      login: 'Connexion',
      logout: 'Déconnexion',
      signUp: "S'inscrire",
      email: 'E-mail',
      password: 'Mot de passe',
    },
    errors: {
      required: 'Ce champ est obligatoire',
      invalidEmail: 'Veuillez entrer un e-mail valide',
      minLength: 'Doit contenir au moins {{min}} caractères',
    },
  },
  de: {
    common: {
      welcome: 'Willkommen',
      greeting: 'Hallo, {{name}}!',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      loading: 'Laden...',
      error: 'Ein Fehler ist aufgetreten',
      success: 'Erfolg!',
    },
    auth: {
      login: 'Anmelden',
      logout: 'Abmelden',
      signUp: 'Registrieren',
      email: 'E-Mail',
      password: 'Passwort',
    },
    errors: {
      required: 'Dieses Feld ist erforderlich',
      invalidEmail: 'Bitte geben Sie eine gültige E-Mail ein',
      minLength: 'Muss mindestens {{min}} Zeichen haben',
    },
  },
  ja: {
    common: {
      welcome: 'ようこそ',
      greeting: 'こんにちは、{{name}}さん！',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      success: '成功！',
    },
    auth: {
      login: 'ログイン',
      logout: 'ログアウト',
      signUp: '登録',
      email: 'メールアドレス',
      password: 'パスワード',
    },
    errors: {
      required: 'この項目は必須です',
      invalidEmail: '有効なメールアドレスを入力してください',
      minLength: '{{min}}文字以上必要です',
    },
  },
};

// i18n Context
interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

/**
 * Get a translation value
 */
function getTranslation(
  locale: Locale,
  namespace: string,
  key: string
): string {
  const dict = translations[locale]?.[namespace];
  if (typeof dict === 'object' && key in dict) {
    return dict[key];
  }

  // Fallback to English
  const fallbackDict = translations.en?.[namespace];
  if (typeof fallbackDict === 'object' && key in fallbackDict) {
    return fallbackDict[key];
  }

  // Return key if translation not found
  return `${namespace}.${key}`;
}

/**
 * Interpolate variables in translation string
 */
function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return params[key]?.toString() ?? `{{${key}}}`;
  });
}

/**
 * i18n Provider component
 */
export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}): ReactNode {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  const t = useCallback(
    (fullKey: string, params?: Record<string, string | number>) => {
      const [namespace, ...keyParts] = fullKey.split('.');
      const key = keyParts.join('.');
      const translation = getTranslation(locale, namespace, key);
      return interpolate(translation, params);
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to access i18n context
 */
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

/**
 * Hook to get translation function for a namespace
 */
export function useTranslation(namespace: string): (key: string, params?: Record<string, string | number>) => string {
  const { t } = useI18n();
  return useCallback(
    (key: string, params?: Record<string, string | number>) => t(`${namespace}.${key}`, params),
    [t, namespace]
  );
}

/**
 * Get locale from browser
 */
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const browserLocale = navigator.language.split('-')[0];
  return LOCALES.includes(browserLocale as Locale)
    ? (browserLocale as Locale)
    : DEFAULT_LOCALE;
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date, locale: Locale = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format number according to locale
 */
export function formatNumber(num: number, locale: Locale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale: Locale = DEFAULT_LOCALE
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}
