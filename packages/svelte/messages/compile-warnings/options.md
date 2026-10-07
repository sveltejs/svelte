## options_deprecated_accessors

> The `accessors` option has been deprecated. It will have no effect in runes mode

## options_deprecated_immutable

> The `immutable` option has been deprecated. It will have no effect in runes mode

## options_missing_custom_element

> The `customElement` option is used when generating a custom element, but `customElement: true` (or `css: 'injected'`) is not set in compiler options. If child components are rendered inside a ShadowRoot, their styles will be extracted externally and will not be visible inside the shadow tree. Set `compilerOptions.customElement: true` (or `css: 'injected'`) in `svelte.config.js`

## options_removed_enable_sourcemap

> The `enableSourcemap` option has been removed. Source maps are always generated now, and tooling can choose to ignore them

## options_removed_hydratable

> The `hydratable` option has been removed. Svelte components are always hydratable now

## options_removed_loop_guard_timeout

> The `loopGuardTimeout` option has been removed

## options_renamed_ssr_dom

> `generate: "dom"` and `generate: "ssr"` options have been renamed to "client" and "server" respectively
