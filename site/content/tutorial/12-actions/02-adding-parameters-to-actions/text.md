---
title: Adding parameters
---

An Action can also accept parameters. This is useful when we want to work with variables inside the Action.

In this app we want to convert the text in the input field into specified symbol once you hover over it. In order to do so we must firstly import the `convertable` function into `Converter.svelte`

```html
<script>
  import { convertable } from './convertable.js';

  export let symbol;
  export let text;
</script>
```

We can now use it with the element:

```html
<div use:convertable={{ symbol, text }}>
  <span>{symbol}</span>
</div>
```

Hover over the symbols now and behold the magic of converting text into emojis. 🎉

You might notice that when you change the text in the input, the amount of symbols in the popup doesn't change. Fortunately we have an easy way to **update** the Action every time the parameters change. We can do so by adding an `update` function into the object returned by the Action. This function is called with updated parameters every time they change.

Update the return value of `convertable` function in `convertable.js`:

```js
return {
  update ({ symbol, text }) {
    tooltip.textContent = convertText(text, symbol)
  },

  destroy () {
    tooltip.remove()
    node.removeEventListener('mouseenter', append)
    node.removeEventListener('mouseleave', remove)
  }
}
```

If you change the text now and hover over the symbols, you will see the amount changing properly.
