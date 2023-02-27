---
title: HTML tags
---

Ordinarily, strings are inserted as plain text, meaning that characters like `<` and `>` have no special meaning.

But sometimes you need to render HTML directly into a component. For example, the words you're reading right now exist in a markdown file that gets included on this page as a blob of HTML.

In Svelte, you do this with the special `{@html ...}` tag:

```html
<p>{@html string}</p>
```

> **Warning!** Svelte doesn't perform any sanitization of the expression inside `{@html ...}` before it gets inserted into the DOM. In other words, if you use this feature it's **critical** that you manually escape HTML that comes from sources you don't trust, otherwise you risk exposing your users to XSS attacks.
