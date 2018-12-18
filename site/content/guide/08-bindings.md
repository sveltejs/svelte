---
title: Bindings
---


### Bindings

As we've seen, data can be passed down to elements and components with attributes and [props](guide#props). Occasionally, you need to get data back *up*; for that we use bindings.


#### Component bindings

Component bindings keep values in sync between a parent and a child:

```html
<!-- { repl: false } -->
<Widget bind:childValue=parentValue/>
```

Whenever `childValue` changes in the child component, `parentValue` will be updated in the parent component and vice versa.

If the names are the same, you can shorten the declaration:

```html
<!-- { repl: false } -->
<Widget bind:value/>
```

> Use component bindings judiciously. They can save you a lot of boilerplate, but will make it harder to reason about data flow within your application if you overuse them.


#### Element bindings

Element bindings make it easy to respond to user interactions:

```html
<!-- { title: 'Element bindings' } -->
<h1>Hello {name}!</h1>
<input bind:value=name>
```

```json
/* { hidden: true } */
{
	name: 'world'
}
```

Some bindings are *one-way*, meaning that the values are read-only. Most are *two-way* — changing the data programmatically will update the DOM. The following bindings are available:

| Name                                                            | Applies to                                   | Kind                 |
|-----------------------------------------------------------------|----------------------------------------------|----------------------|
| `value`                                                         | `<input>` `<textarea>` `<select>`            | <span>Two-way</span> |
| `checked` `indeterminate`                                       | `<input type=checkbox>`                      | <span>Two-way</span> |
| `group` (see note)                                              | `<input type=checkbox>` `<input type=radio>` | <span>Two-way</span> |
| `currentTime` `paused` `played` `volume`                        | `<audio>` `<video>`                          | <span>Two-way</span> |
| `buffered` `duration` `seekable`                                | `<audio>` `<video>`                          | <span>One-way</span> |
| `offsetWidth` `offsetHeight` `clientWidth` `clientHeight`       | All block-level elements                     | <span>One-way</span> |
| `scrollX` `scrollY`                                             | `<svelte:window>`                            | <span>Two-way</span> |
| `online` `innerWidth` `innerHeight` `outerWidth` `outerHeight`  | `<svelte:window>`                            | <span>One-way</span> |

> 'group' bindings allow you to capture the current value of a [set of radio inputs](repl?demo=binding-input-radio), or all the selected values of a [set of checkbox inputs](repl?demo=binding-input-checkbox-group).

Here is a complete example of using two way bindings with a form:

```html
<!-- { title: 'Form bindings' } -->
<form on:submit="handleSubmit(event)">
	<input bind:value=name type=text>
	<button type=submit>Say hello</button>
</form>

<script>
	export default {
		methods: {
			handleSubmit(event) {
				// prevent the page from reloading
				event.preventDefault();

				const { name } = this.get();
				alert(`Hello ${name}!`);
			}
		}
	};
</script>
```

```json
/* { hidden: true } */
{
	name: "world"
}
```

> 'two way' bindings allow you to update a value in a nested property as seen in [checkbox input](repl?demo=binding-input-checkbox).

### Actions

Actions let you decorate elements with additional functionality. Actions are functions which may return an object with lifecycle methods, `update` and `destroy`. The action will be called when its element is added to the DOM.

Use actions for things like:
* tooltips
* lazy loading images as the page is scrolled, e.g. `<img use:lazyload data-src='giant-photo.jpg'/>`
* capturing link clicks for your client router
* adding drag and drop

```html
<!-- { title: 'Actions' } -->
<button on:click="toggleLanguage()" use:tooltip="translations[language].tooltip">
	{language}
</button>

<script>
	export default {
		actions: {
			tooltip(node, text) {
				const tooltip = document.createElement('div');
				tooltip.textContent = text;

				Object.assign(tooltip.style, {
					position: 'absolute',
					background: 'black',
					color: 'white',
					padding: '0.5em 1em',
					fontSize: '12px',
					pointerEvents: 'none',
					transform: 'translate(5px, -50%)',
					borderRadius: '2px',
					transition: 'opacity 0.4s'
				});

				function position() {
					const { top, right, bottom } = node.getBoundingClientRect();
					tooltip.style.top = `${(top + bottom) / 2}px`;
					tooltip.style.left = `${right}px`;
				}

				function append() {
					document.body.appendChild(tooltip);
					tooltip.style.opacity = 0;
					setTimeout(() => tooltip.style.opacity = 1);
					position();
				}

				function remove() {
					tooltip.remove();
				}

				node.addEventListener('mouseenter', append);
				node.addEventListener('mouseleave', remove);

				return {
					update(text) {
						tooltip.textContent = text;
						position();
					},

					destroy() {
						tooltip.remove();
						node.removeEventListener('mouseenter', append);
						node.removeEventListener('mouseleave', remove);
					}
				}
			}
		},

		methods: {
			toggleLanguage() {
				const { language } = this.get();

				this.set({
					language: language === 'english' ? 'latin' : 'english'
				});
			}
		}
	};
</script>
```

```json
/* { hidden: true } */
{
	language: "english",
	translations: {
		english: {
			tooltip: "Switch Languages",
		},
		latin: {
			tooltip: "Itchsway Anguageslay",
		},
	}
}
```

### Classes

Classes let you toggle element classes on and off. To use classes add the directive `class` followed by a colon and the class name you want toggled (`class:the-class-name="anExpression"`). The expression inside the directive's quotes will be evaluated and toggle the class on and off depending on the truthiness of the expression's result. You can only add class directives to elements.

This example adds the class `active` to `<li>` elements when the `url` property matches the path their links target.

```html
<!-- { title: 'Classes' } -->
<ul class="links">
	<li class:active="url === '/'"><a href="/" on:click="goto(event)">Home</a></li>
	<li class:active="url.startsWith('/blog')"><a href="/blog/" on:click="goto(event)">Blog</a></li>
	<li class:active="url.startsWith('/about')"><a href="/about/" on:click="goto(event)">About</a></li>
</ul>

<script>
	export default {
		methods: {
			goto(event) {
				event.preventDefault();
				this.set({ url: event.target.pathname });
			}
		}
	}
</script>

<style>
	.links {
		list-style: none;
	}
	.links li {
		float: left;
		padding: 10px;
	}
	/* classes added this way are processed with encapsulated styles, no need for :global() */
	.active {
		background: #eee;
	}
</style>
```

```json
/* { hidden: true } */
{
	"url": "/"
}
```

Classes will work with an existing class attribute on your element. If you find yourself adding multiple ternary statements inside a class attribute, classes can simplify your component. Classes are recognized by the compiler and <a href="guide#scoped-styles">scoped correctly</a>.

If your class name is the same as a property in your component's state, you can use the shorthand of a class binding which drops the expression (`class:myProp`).

Note that class names with dashes in them do not usually make good shorthand classes since the property will also need a dash in it. The example below uses a computed property to make working with this easier, but it may be easier to not use the shorthand in cases like this.

```html
<!-- { title: 'Classes shorthand' } -->
<div class:active class:is-selected class:isAdmin>
	<p>Active? {active}</p>
	<p>Selected? {isSelected}</p>
</div>
<button on:click="set({ active: !active })">Toggle Active</button>
<button on:click="set({ isSelected: !isSelected })">Toggle Selected</button>
<button on:click="set({ isAdmin: !isAdmin })">Toggle Admin</button>

<script>
export default {
	computed: {
		// Because shorthand relfects the var name, you must use component.set({ "is-selected": true }) or use a computed
		// property like this. It might be better to avoid shorthand for class names which are not valid variable names.
		"is-selected": ({ isSelected }) => isSelected
	}
}
</script>

<style>
	div {
		width: 300px;
		border: 1px solid #ccc;
		background: #eee;
		margin-bottom: 10px;
	}
	.active {
		background: #fff;
	}
	.is-selected {
		border-color: #99bbff;
		box-shadow: 0 0 6px #99bbff;
	}
	.isAdmin {
		outline: 2px solid red;
	}
</style>
```

```json
/* { hidden: true } */
{
	"active": true,
	"isSelected": false,
	"isAdmin": false,
}
```
