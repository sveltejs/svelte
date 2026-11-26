---
title: {@html ...}
tags: template-html
---

To inject raw HTML into your component, use the `{@html ...}` tag:

```svelte
<article>
	{@html content}
</article>
```

> [!NOTE] Make sure that you either escape the passed string or only populate it with values that are under your control in order to prevent [XSS attacks](https://owasp.org/www-community/attacks/xss/). Never render unsanitized content.

The expression should be valid standalone HTML — this will not work, because `</div>` is not valid HTML:

```svelte
{@html '<div>'}content{@html '</div>'}
```

It also will not compile Svelte code.

## Styling

Content rendered this way is 'invisible' to Svelte and as such will not receive [scoped styles](scoped-styles). In other words, this will not work, and the `a` and `img` styles will be regarded as unused:

<!-- prettier-ignore -->
```svelte
<article>
	{@html content}
</article>

<style>
	article {
		a { color: hotpink }
		img { width: 100% }
	}
</style>
```

Instead, use the `:global` modifier to target everything inside the `<article>`:

<!-- prettier-ignore -->
```svelte
<style>
	article +++:global+++ {
		a { color: hotpink }
		img { width: 100% }
	}
</style>
```
