import { useSettingsStore } from '@/store/settingsStore';
import { en } from '@/i18n/locales/en';
import { zh } from '@/i18n/locales/zh';

// Define the type for the dictionary based on the 'en' locale
// This ensures type safety for keys
type Dictionary = typeof en;
export type DictionaryKey = keyof Dictionary;

const dictionaries: Record<'en' | 'zh', Dictionary> = {
    en,
    zh,
};

export const useTranslation = () => {
    const { uiLanguage } = useSettingsStore();

    // Fallback to English if the current language dictionary or key is missing
    const t = (key: DictionaryKey, ...args: (string | number)[]): string => {
        const dictionary = dictionaries[uiLanguage] || dictionaries.en;
        let text = dictionary[key] || dictionaries.en[key] || key;

        if (args.length > 0) {
            args.forEach((arg, index) => {
                text = text.replace(`{${index}}`, String(arg));
            });
        }

        return text;
    };

    return {
        t,
        language: uiLanguage,
    };
};
