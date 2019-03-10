---
title: The use directive
---

Actions are essentially element-level lifecycle functions. They're useful for things like:

* interfacing with third-party libraries
* lazy-loaded images
* tooltips
* adding custom event handlers

In this app, we want to make the orange box 'pannable'. It has event handlers for the `panstart`, `panmove` and `panend` events, but these aren't native DOM events. We have to dispatch them ourselves. First, import the `pannable` function...

```js
import { pannable } from './pannable.js';
```

...then use it with the element:

```html
<div class="box"
	use:pannable
	on:panstart={handlePanStart}
	on:panmove={handlePanMove}
	on:panend={handlePanEnd}
	style="transform: translate({$coords.x}px,{$coords.y}px)"
></div>
```

Open the `pannable.js` file. Like transition functions, an action function receives a `node` and some optional parameters, and returns an action object. That object must have a `destroy` function, which is called when the element is unmounted.

We want to fire `panstart` event when the user mouses down on the element, `panmove` events (with `dx` and `dy` properties showing how far the mouse moved) when they drag it, and `panend` events when they mouse up. One possible implementation looks like this:

```js
export function pannable(node) {
	let x;
	let y;

	function handleMousedown(event) {
		x = event.clientX;
		y = event.clientY;

		node.dispatchEvent(new CustomEvent('panstart', {
			detail: { x, y }
		}));

		window.addEventListener('mousemove', handleMousemove);
		window.addEventListener('mouseup', handleMouseup);
	}

	function handleMousemove(event) {
		const dx = event.clientX - x;
		const dy = event.clientY - y;
		x = event.clientX;
		y = event.clientY;

		node.dispatchEvent(new CustomEvent('panmove', {
			detail: { x, y, dx, dy }
		}));
	}

	function handleMouseup(event) {
		x = event.clientX;
		y = event.clientY;

		node.dispatchEvent(new CustomEvent('panend', {
			detail: { x, y }
		}));

		window.removeEventListener('mousemove', handleMousemove);
		window.removeEventListener('mouseup', handleMouseup);
	}

	node.addEventListener('mousedown', handleMousedown);

	return {
		destroy() {
			node.removeEventListener('mousedown', handleMousedown);
		}
	};
}
```

Update the `pannable` function and try moving the box around.

> This implementation is for demonstration purposes — a more complete one would also consider touch events.

