# AutoStyle

AutoStyle is a framework-agnostic HTML5 styling library.

Import it and forget it.

It provides a consistent baseline style for all standard HTML5 tags and can be used in:
- React
- Angular
- Vue
- Plain HTML

It is responsive by default, with fluid typography and spacing that adapt across:
- different screen resolutions
- different aspect ratios
- mobile, tablet, laptop, and desktop devices

This library is intentionally focused on text and layout formatting.
It uses only monochrome theming:
- dark text on light background
- light text on dark background

It does not provide:
- component classes
- brand colors or accent palettes
- required wrapper classes or manual setup for default behavior

## Install

```bash
npm install autostyle
```

## Usage

Zero-config behavior after import:
- responsive text and spacing
- automatic system light/dark mode
- readable defaults for text, layout, forms, tables, media, and interactive HTML tags

### React

```js
import "autostyle/styles";
```

### Angular

Add to the styles array in `angular.json`:

```json
"styles": [
	"node_modules/autostyle/dist/autostyle.css"
]
```

### Vue

```js
import "autostyle/styles";
```

### Plain HTML

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="./node_modules/autostyle/dist/autostyle.css" />
```

## Goals

- Provide styles for all standard HTML5 tags.
- Keep styles lightweight and easy to override.
- Work consistently across modern browsers and UI frameworks.

## Theme Support

AutoStyle is theme-aware out of the box.

- Uses light mode by default.
- Automatically adapts to system dark mode using `prefers-color-scheme`.
- Requires no manual theme classes or manual root setup for default use.

### Optional Manual Theme Override

Use the `data-as-theme` attribute on the root element.

```html
<html data-as-theme="dark">
```

Available values:
- `light`
- `dark`

## JavaScript Theme Helper

AutoStyle includes an optional tiny helper with localStorage persistence for apps that want a manual theme toggle.

```js
import { createAutoStyleTheme } from "autostyle/theme";

const theme = createAutoStyleTheme();
theme.init(); // Applies stored preference or system theme
```

### Helper API

- `init()` -> applies the persisted theme (`light`, `dark`, or `system`)
- `setTheme("light" | "dark" | "system")`
- `getTheme()` -> returns persisted preference
- `getEffectiveTheme()` -> returns currently applied effective theme (`light`/`dark`)
- `toggleTheme()` -> toggles between `light` and `dark`, then persists
- `clearTheme()` -> removes persisted preference and returns to system mode
- `followSystemTheme()` -> subscribes to OS theme changes in `system` mode and returns unsubscribe fn

### Example: Toggle Button

```html
<button id="theme-toggle" type="button">Toggle Theme</button>
<script type="module">
	import { createAutoStyleTheme } from "autostyle/theme";

	const manager = createAutoStyleTheme();
	manager.init();

	const stopFollowing = manager.followSystemTheme();
	document.getElementById("theme-toggle").addEventListener("click", () => {
		manager.toggleTheme();
	});

	// Call stopFollowing() if you need to clean up listeners.
</script>
```

### Browser Script Tag (No Modules)

```html
<link rel="stylesheet" href="./node_modules/autostyle/dist/autostyle.css" />
<script src="./node_modules/autostyle/dist/theme.iife.js"></script>
<script>
	const manager = window.AutoStyleTheme.createAutoStyleTheme();
	manager.init();
	manager.followSystemTheme();
</script>
```

Package export path for this build:

```js
import "autostyle/theme-browser";
```

## Package Layout

Published files:
- `dist/autostyle.css`
- `dist/autostyle.min.css`
- `dist/theme.mjs`
- `dist/theme.iife.js`

Source files stay modular under `src/modules` and are bundled during `npm run build`.

## Browser Notes

AutoStyle normalizes common layout and typography behavior, but some native controls remain browser-driven by design.

Expect small browser differences in:
- `select` and `optgroup`
- `dialog`
- `progress` and `meter`
- embedded media controls

The library aims to keep these readable and structurally consistent without replacing native UI.

## Demo And Verification

Local commands:

```bash
npm run build
npm run serve:demo
npm run verify:demo
npm run verify:package
```

Visual verification checklist: `demo/visual-checklist.md`
