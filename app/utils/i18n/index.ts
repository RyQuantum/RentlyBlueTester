import { Component } from 'react';
import ReactNative from 'react-native';
// @ts-ignore
import I18n from 'react-native-i18n';

// Import all locales
import en from './locales/en.json';
import zh from './locales/zh.json';

I18n.locale = 'en';
// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;

// Define the supported translations
I18n.translations = {
  en,
  zh,
};

const currentLocale = I18n.currentLocale();

// Is it a RTL language?
export const isRTL = currentLocale.indexOf('he') === 0 || currentLocale.indexOf('ar') === 0;

// Allow RTL alignment in RTL languages
ReactNative.I18nManager.allowRTL(isRTL);

// The method we'll use instead of a regular string
export function strings(name: string, params = {}) {
  return I18n.t(name, params);
}

export const switchLanguage = (lang: string, component: Component) => {
  I18n.locale = lang;
  component.forceUpdate();
};

export default I18n;
