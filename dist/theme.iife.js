(function (global) {
  "use strict";

  var DEFAULT_STORAGE_KEY = "autostyle:theme";
  var DEFAULT_ATTRIBUTE = "data-as-theme";

  function isBrowser() {
    return typeof window !== "undefined" && typeof document !== "undefined";
  }

  function canUseStorage() {
    if (!isBrowser()) {
      return false;
    }

    try {
      var testKey = "__autostyle_test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch (error) {
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

    var normalized = theme.trim().toLowerCase();
    if (normalized === "light" || normalized === "dark" || normalized === "system") {
      return normalized;
    }

    return "system";
  }

  function applyThemeToRoot(root, attribute, theme) {
    if (!root) {
      return;
    }

    var effective = theme === "system" ? getSystemTheme() : theme;
    root.setAttribute(attribute, effective);
  }

  function createAutoStyleTheme(options) {
    var config = options || {};
    var storageKey = config.storageKey || DEFAULT_STORAGE_KEY;
    var attribute = config.attribute || DEFAULT_ATTRIBUTE;
    var root = resolveRoot(config.root);
    var hasStorage = canUseStorage();

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
      var normalized = normalizeTheme(theme);
      writeStoredTheme(normalized);
      applyThemeToRoot(root, attribute, normalized);
      return normalized;
    }

    function getTheme() {
      return readStoredTheme();
    }

    function getEffectiveTheme() {
      var theme = getTheme();
      return theme === "system" ? getSystemTheme() : theme;
    }

    function clearTheme() {
      clearStoredTheme();
      applyThemeToRoot(root, attribute, "system");
    }

    function toggleTheme() {
      var nextTheme = getEffectiveTheme() === "dark" ? "light" : "dark";
      setTheme(nextTheme);
      return nextTheme;
    }

    function init() {
      var storedTheme = readStoredTheme();
      applyThemeToRoot(root, attribute, storedTheme);
      return storedTheme;
    }

    function followSystemTheme() {
      if (!isBrowser() || typeof window.matchMedia !== "function") {
        return function () {};
      }

      var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      var listener = function () {
        if (getTheme() === "system") {
          applyThemeToRoot(root, attribute, "system");
        }
      };

      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", listener);
        return function () {
          mediaQuery.removeEventListener("change", listener);
        };
      }

      mediaQuery.addListener(listener);
      return function () {
        mediaQuery.removeListener(listener);
      };
    }

    return {
      init: init,
      setTheme: setTheme,
      getTheme: getTheme,
      getEffectiveTheme: getEffectiveTheme,
      toggleTheme: toggleTheme,
      clearTheme: clearTheme,
      followSystemTheme: followSystemTheme
    };
  }

  global.AutoStyleTheme = {
    createAutoStyleTheme: createAutoStyleTheme
  };
})(typeof window !== "undefined" ? window : this);
