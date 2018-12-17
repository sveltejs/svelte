---
title: Static properties
---


### Setup

In some situations, you might want to add static properties to your component constructor. For that, we use the `setup` property:

```html
<!-- { title: 'Component setup' } -->
<p>check the console!</p>

<script>
	export default {
		setup(MyComponent) {
			// someone importing this component will be able
			// to access any properties or methods defined here:
			//
			//   import MyComponent from './MyComponent.html';
			//   console.log(MyComponent.ANSWER); // 42
			MyComponent.ANSWER = 42;
		},

		oncreate() {
			console.log('the answer is', this.constructor.ANSWER);
			console.dir(this.constructor);
		}
	};
</script>
```

### preload

If your component definition includes a `preload` function, it will be attached to the component constructor as a static method. It doesn't change the behaviour of your component in any way — instead, it's a convention that allows systems like [Sapper](https://sapper.svelte.technology) to delay rendering of a component until its data is ready.

See the section on [preloading](https://sapper.svelte.technology/guide#preloading) in the Sapper docs for more information.
