import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'tomyangbar_ui_settings';

const defaults = {
  menuBackgroundAnimation: true,
  homeBlockAnimations: true,
};

const UISettingsContext = createContext(null);

export function UISettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaults);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('UISettings: failed to load', e);
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('UISettings: failed to save', e);
      }
      return next;
    });
  };

  return (
    <UISettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </UISettingsContext.Provider>
  );
}

export function useUISettings() {
  const ctx = useContext(UISettingsContext);
  if (!ctx) {
    return {
      settings: defaults,
      updateSetting: () => {},
    };
  }
  return ctx;
}
