---
title: Readable stores
---

Not all stores should be writable by whoever has a reference to them. For example, you might have a store representing the mouse position or the user's geolocation, and it doesn't make sense to be able to set those values from 'outside'. For those cases, we have *readable* stores.

Click over to the `stores.js` tab. The first argument to `readable` is an initial value, which can be `null` or `undefined` if you don't have one yet. The second argument is a `start` function that takes a `set` callback and returns a `stop` function. The `start` function is called when the store gets its first subscriber; `stop` is called when the last subscriber unsubscribes.

```js
export const time = readable(new Date(), function start(set) {
	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return function stop() {
		clearInterval(interval);
	};
});
```
