---
title: Svelte Inspector
---

The Svelte Inspector lets you inspect Svelte components in the browser. When enabled, you can hover over elements to see which file and line they came from, and click to open your code editor at that exact location.

## Setup

The inspector can be enabled in your Svelte config:

```js
// svelte.config.js
export default {
	vitePlugin: {
		inspector: true
	}
};
```

After you enabled the inspector, you can activate it using the default `alt-x` keyboard shortcut.

### Custom options

You can also enable it with custom options:

```js
// svelte.config.js
export default {
	vitePlugin: {
		inspector: {
			toggleKeyCombo: 'alt-x',
			showToggleButton: 'always',
			toggleButtonPos: 'bottom-right'
		}
	}
};
```

## Options

### toggleKeyCombo

**Type:** `string`
**Default:** `'alt-x'`

Define a key combo to toggle the inspector. The value should be modifiers (e.g. `control`, `shift`, `alt`, `meta`) followed by zero or one regular key, separated by `-`.

Examples: `control-o`, `control-alt-s`, `meta-x`, `alt-i`.

### navKeys

**Type:** `{ parent: string; child: string; next: string; prev: string }`
**Default:** `{ parent: 'ArrowUp', child: 'ArrowDown', next: 'ArrowRight', prev: 'ArrowLeft' }`

Define keys to select elements via keyboard. This improves accessibility and helps select elements that don't have a hoverable surface area.

- `parent`: select closest parent
- `child`: select first child (or grandchild)
- `next`: next sibling (or parent if no next sibling exists)
- `prev`: previous sibling (or parent if no prev sibling exists)

### openKey

**Type:** `string`
**Default:** `'Enter'`

Define the key to open the editor for the currently selected DOM node.

### escapeKeys

**Type:** `string[]`
**Default:** `['Backspace', 'Escape']`

Define keys to close the inspector.

### holdMode

**Type:** `boolean`
**Default:** `true`

When enabled, the inspector will only open when the `toggleKeyCombo` is held down, and close when released.

### showToggleButton

**Type:** `'always' | 'active' | 'never'`
**Default:** `'active'`

When to show the toggle button on screen:

- `'always'`: always show the toggle button
- `'active'`: show the toggle button when the inspector is active
- `'never'`: never show the toggle button

### toggleButtonPos

**Type:** `'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'`
**Default:** `'top-right'`

Where to display the toggle button.

### customStyles

**Type:** `boolean`
**Default:** `true`

Inject custom styles when the inspector is active. When enabled, the `svelte-inspector-enabled` class is added to the `body` element, and the `svelte-inspector-active-target` class is added to the current active target. This allows you to customize the inspector appearance to match your app.

### Environment variables

Inspector options can also be configured via environment variables, which is useful for personal preferences that shouldn't be committed to a shared config:

```bash
# just keycombo, unquoted string
SVELTE_INSPECTOR_TOGGLE=alt-x

# options object as JSON
SVELTE_INSPECTOR_OPTIONS='{"holdMode": false, "toggleButtonPos": "bottom-left"}'

# disable completely
SVELTE_INSPECTOR_OPTIONS=false

# force default options
SVELTE_INSPECTOR_OPTIONS=true
```

Environment variables take precedence over values set in the Svelte config and automatically enable the inspector during development.

## Editor support

Svelte Inspector uses [`launch-editor`](https://github.com/yyx990803/launch-editor) to open files in your code editor. Most popular editors are supported out of the box. If your editor is not supported, you can follow [the instructions here](https://github.com/yyx990803/launch-editor#custom-editor-support) to add it.
