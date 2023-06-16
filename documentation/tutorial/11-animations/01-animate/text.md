---
title: The animate directive
---

In the [previous chapter](/tutorial/deferred-transitions), we used deferred transitions to create the illusion of motion as elements move from one todo list to the other.

To complete the illusion, we also need to apply motion to the elements that _aren't_ transitioning. For this, we use the `animate` directive.

First, import the `flip` function — flip stands for ['First, Last, Invert, Play'](https://aerotwist.com/blog/flip-your-animations/) — from `svelte/animate`:

```js
import { flip } from 'svelte/animate';
```

Then add it to the `<label>` elements:

```svelte
<label
	in:receive="{{key: todo.id}}"
	out:send="{{key: todo.id}}"
	animate:flip
>
```

The movement is a little slow in this case, so we can add a `duration` parameter:

```svelte
<label
	in:receive="{{key: todo.id}}"
	out:send="{{key: todo.id}}"
	animate:flip="{{duration: 200}}"
>
```

> `duration` can also be a `d => milliseconds` function, where `d` is the number of pixels the element has to travel

Note that all the transitions and animations are being applied with CSS, rather than JavaScript, meaning they won't block (or be blocked by) the main thread.
