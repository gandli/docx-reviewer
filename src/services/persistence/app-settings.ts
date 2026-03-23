export type AppThemeId = "warm" | "ink" | "forest";

export type AppSettings = {
  themeId: AppThemeId;
  reviewPromptNote: string;
};

const APP_SETTINGS_STORAGE_KEY = "app-settings";
const APP_SETTINGS_EVENT = "app-settings-updated";

const DEFAULT_APP_SETTINGS: AppSettings = {
  themeId: "warm",
  reviewPromptNote: "",
};

export function getDefaultAppSettings(): AppSettings {
  return DEFAULT_APP_SETTINGS;
}

export function loadAppSettings(): AppSettings {
  if (typeof window === "undefined") {
    return DEFAULT_APP_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_APP_SETTINGS;
    }

    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      themeId:
        parsed.themeId === "ink" || parsed.themeId === "forest" || parsed.themeId === "warm"
          ? parsed.themeId
          : DEFAULT_APP_SETTINGS.themeId,
      reviewPromptNote:
        typeof parsed.reviewPromptNote === "string"
          ? parsed.reviewPromptNote
          : DEFAULT_APP_SETTINGS.reviewPromptNote,
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(APP_SETTINGS_EVENT, { detail: settings }));
}

export function subscribeAppSettings(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleUpdate = () => listener();
  window.addEventListener(APP_SETTINGS_EVENT, handleUpdate);
  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener(APP_SETTINGS_EVENT, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}
