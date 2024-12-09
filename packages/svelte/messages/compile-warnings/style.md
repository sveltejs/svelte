## css_unused_selector

> Unused CSS selector "%name%"

Svelte traverses both the template and the `<style>` tag to find out which of the CSS selectors are not used within the template, so it can remove them.

In some situations a selector may target an element that is not 'visible' to the compiler, for example because it is part of an `{@html ...}` tag or you're overriding styles in a child component. In these cases, use [`:global`](/docs/svelte/global-styles) to preserve the selector as-is:

```svelte
<div class="post">{@html content}</div>

<style>
  .post :global {
    p {...}
  }
</style>
```
