---
title: beforeUpdate and afterUpdate
---

The `beforeUpdate` function schedules work to happen immediately before the DOM is updated. `afterUpdate` is its counterpart, used for running code once the DOM is in sync with your data.

Together, they're useful for doing things imperatively that are difficult to achieve in a purely state-driven way, like updating the scroll position of an element.

This [Eliza](https://en.wikipedia.org/wiki/ELIZA) chatbot is annoying to use, because you have to keep scrolling the chat window. Let's fix that.

```js
let div;
let autoscroll;

beforeUpdate(() => {
	autoscroll = div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
});

afterUpdate(() => {
	if (autoscroll) div.scrollTo(0, div.scrollHeight);
});
```

Note that `beforeUpdate` will first run before the component has mounted, so we need to check for the existence of `div` before reading its properties.
