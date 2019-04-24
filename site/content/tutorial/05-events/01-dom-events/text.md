---
title: DOM events
---

As we've briefly seen already, you can listen to any event on an element with the `on:` directive:

```html
<div on:mousemove={handleMousemove}>
	The mouse position is {m.x} x {m.y}
</div>
```

> The `on:` directive expects a function reference in the curly braces. *Not a function call as it was in version 2*. 
> When the event is triggered the function will be called with the `event` object as the first parameter.
> So if you need to pass a value with the event then you need to make a function that returns a function with your parameter enclosed. Here is an example:
```html
<script>
	let sum=0
	function add(val){
		return function(){ sum+=val }
	}
	//Or you can use the arrow functions : 
	//const add= val => () => sum+=val 
</script>
...
<button on:click={add(2)}>Add 2 to the sum</button>
```
