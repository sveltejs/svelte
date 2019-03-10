---
title: Dynamic attributes
---

Just like you can use curly braces to control text, you can use them to control element attributes.

Our image is missing a `src` — let's add one:

```html
<img src={src}>
```

That's better. But Svelte is giving us a warning:

> A11y: &lt;img&gt; element should have an alt attribute

When building web apps, it's important to make sure that they're *accessible* to the broadest possible userbase, including people with (for example) impaired vision or motion, or people without powerful hardware or good internet connections. Accessibility (shortened to a11y) isn't always easy to get right, but Svelte will help by warning you if you write inaccessible markup.

In this case, we're missing the `alt` tag that describes the image for people using screenreaders, or people with slow or flaky internet connections that can't download the image. Let's add one:

```html
<img src={src} alt="A man dancing">
```

We can use curly braces *inside* attributes. Try changing it to `"{name} dancing"` — remember to declare a `name` variable in the `<script>` block.


## Shorthand attributes

It's not uncommon to have an attribute where the name and value are the same, like `src={src}`. Svelte gives us a convenient shorthand for these cases:

```html
<img {src} alt="...">
```

