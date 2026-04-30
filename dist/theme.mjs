const DEFAULT_STORAGE_KEY = "first-style:theme";
const DEFAULT_ATTRIBUTE = "data-fs-theme";

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function canUseStorage() {
  if (!isBrowser()) {
    return false;
  }

  try {
    const testKey = "__first_style_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function getSystemTheme() {
  if (!isBrowser() || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveRoot(root) {
  if (root && typeof root.setAttribute === "function") {
    return root;
  }

  if (!isBrowser()) {
    return null;
  }

  return document.documentElement;
}

function normalizeTheme(theme) {
  if (typeof theme !== "string") {
    return "system";
  }

  const normalized = theme.trim().toLowerCase();
  if (normalized === "light" || normalized === "dark" || normalized === "system") {
    return normalized;
  }

  return "system";
}

function applyThemeToRoot(root, attribute, theme) {
  if (!root) {
    return;
  }

  const effective = theme === "system" ? getSystemTheme() : theme;

  root.setAttribute(attribute, effective);
}

export function createFirstStyleTheme(options = {}) {
  const storageKey = options.storageKey || DEFAULT_STORAGE_KEY;
  const attribute = options.attribute || DEFAULT_ATTRIBUTE;
  const root = resolveRoot(options.root);
  const hasStorage = canUseStorage();

  function readStoredTheme() {
    if (!hasStorage) {
      return "system";
    }

    return normalizeTheme(window.localStorage.getItem(storageKey));
  }

  function writeStoredTheme(theme) {
    if (!hasStorage) {
      return;
    }

    window.localStorage.setItem(storageKey, theme);
  }

  function clearStoredTheme() {
    if (!hasStorage) {
      return;
    }

    window.localStorage.removeItem(storageKey);
  }

  function setTheme(theme) {
    const normalized = normalizeTheme(theme);
    writeStoredTheme(normalized);
    applyThemeToRoot(root, attribute, normalized);
    return normalized;
  }

  function getTheme() {
    return readStoredTheme();
  }

  function getEffectiveTheme() {
    const theme = getTheme();
    return theme === "system" ? getSystemTheme() : theme;
  }

  function clearTheme() {
    clearStoredTheme();
    applyThemeToRoot(root, attribute, "system");
  }

  function toggleTheme() {
    const nextTheme = getEffectiveTheme() === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    return nextTheme;
  }

  function init() {
    const storedTheme = readStoredTheme();
    applyThemeToRoot(root, attribute, storedTheme);
    return storedTheme;
  }

  function followSystemTheme() {
    if (!isBrowser() || typeof window.matchMedia !== "function") {
      return () => {};
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if (getTheme() === "system") {
        applyThemeToRoot(root, attribute, "system");
      }
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }

    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }

  return {
    init,
    setTheme,
    getTheme,
    getEffectiveTheme,
    toggleTheme,
    clearTheme,
    followSystemTheme
  };
}

export default createFirstStyleTheme;
