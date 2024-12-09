## css_unused_selector

> Unused CSS selector "%name%"

Svelte traverses both the template and the `<style>` tag to find out which of the CSS selectors are actually in use. It will prune (i.e. remove) those selectors which appear unused and warn you about it.

In some situations Svelte may be too strict and you _know_ that the selector is used. In this case, you can use [`:global` or `:global(...)`](global-styles) to prevent them from being pruned.
