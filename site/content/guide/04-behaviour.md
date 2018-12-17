---
title: Behaviours
---

As well as scoped styles and a template, components can encapsulate *behaviours*. For that, we add a `<script>` element and export an object:

```html
<!-- { title: 'Behaviours' } -->
<div>
	<!-- template goes here -->
</div>

<script>
	export default {
		// behaviours go here
	};
</script>
```


### Default data

Often, it makes sense for a component to have default data. This should be expressed as a function that returns a plain JavaScript object:

```html
<!-- { title: 'Default data' } -->
<p>Count: {count}</p>
<button on:click="set({ count: count + 1 })">+1</button>

<script>
	export default {
		data() {
			return {
				count: 0
			};
		}
	};
</script>
```

Data supplied at instantiation takes priority over defaults. In other words, if we instantiated the component above like so...

```js
const counter = new Counter({
	data: {
		count: 99
	}
});
```

...then `{count}`, or `counter.get().count`, would initially be 99 rather than 0.


### Computed properties

Often, your program will use values that depend on other values – for example, you might have a filtered list, which depends on both the list *and* the filter. Normally in JavaScript you'd have to add logic to update the dependent property when *any* of the dependencies change. This is a frequent source of bugs, and it gets worse as your application grows.

Svelte allows you to express these dependencies in computed properties, which are recalculated whenever those dependencies change:

```html
<!-- { title: 'Computed properties' } -->
<p>
	The time is
	<strong>{hours}:{minutes}:{seconds}</strong>
</p>

<script>
	export default {
		data() {
			return {
				time: new Date()
			};
		},

		computed: {
			hours:   ({ time }) => time.getHours(),
			minutes: ({ time }) => time.getMinutes(),
			seconds: ({ time }) => time.getSeconds()
		}
	};
</script>
```

Each function is passed the component's current state object. Because we're using destructuring syntax, the compiler knows that `hours`, `minutes` and `seconds` only need to re-run when `time` changes, and not when any other values change. There's no costly dependency tracking involved – the dependency graph is resolved at compile time.

> `computed` must be an object literal, and the properties must be function expressions or arrow function expressions. Any external functions used in computed must be wrapped _here_:

```js
import externalFunc from '_external_file';
export default {
	computed: {
		externalFunc: ({ dep1, dep2 }) => externalFunc(dep1, dep2);
	}
}
```

Computed properties can of course return functions. For example, we could dynamically generate a filter function for a list of items:

```html
<!-- { title: 'Filtering' } -->
<input bind:value=search>

{#each items.filter(predicate) as word}
	<p><strong>{word.slice(0, search.length)}</strong>{word.slice(search.length)}</p>
{:else}
	<p>no matches!</p>
{/each}

<script>
	export default {
		computed: {
			predicate: ({ search }) => {
				search = search.toLowerCase();
				return word => word.startsWith(search);
			}
		}
	};
</script>
```

```json
/* { hidden: true } */
{
	search: "",
	items: [
		"about",
		"above",
		"abuse",
		"actor",
		"acute",
		"admit",
		"adopt",
		"adult",
		"after",
		"again",
		"agent",
		"agree",
		"ahead",
		"alarm",
		"album",
		"alert",
		"alike",
		"alive",
		"allow",
		"alone",
		"along",
		"alter",
		"among",
		"anger",
		"Angle",
		"angry",
		"apart",
		"apple",
		"apply",
		"arena",
		"argue",
		"arise",
		"array",
		"aside",
		"asset",
		"audio",
		"audit",
		"avoid",
		"award",
		"aware",
		"badly",
		"baker",
		"bases",
		"basic",
		"basis",
		"beach",
		"began",
		"begin",
		"begun",
		"being",
		"below",
		"bench",
		"billy",
		"birth",
		"black",
		"blame",
		"blind",
		"block",
		"blood",
		"board",
		"boost",
		"booth",
		"bound",
		"brain",
		"brand",
		"bread",
		"break",
		"breed",
		"brief",
		"bring",
		"broad",
		"broke",
		"brown",
		"build",
		"built",
		"buyer",
		"cable",
		"calif",
		"carry",
		"catch",
		"cause",
		"chain",
		"chair",
		"chart",
		"chase",
		"cheap",
		"check",
		"chest",
		"chief",
		"child",
		"china",
		"chose",
		"civil",
		"claim",
		"class",
		"clean",
		"clear",
		"click",
		"clock",
		"close",
		"coach",
		"coast",
		"could",
		"count",
		"court",
		"cover",
		"craft",
		"crash",
		"cream",
		"crime",
		"cross",
		"crowd",
		"crown",
		"curve",
		"cycle",
		"daily",
		"dance",
		"dated",
		"dealt",
		"death",
		"debut",
		"delay",
		"depth",
		"doing",
		"doubt",
		"dozen",
		"draft",
		"drama",
		"drawn",
		"dream",
		"dress",
		"drill",
		"drink",
		"drive",
		"drove",
		"dying",
		"eager",
		"early",
		"earth",
		"eight",
		"elite",
		"empty",
		"enemy",
		"enjoy",
		"enter",
		"entry",
		"equal",
		"error",
		"event",
		"every",
		"exact",
		"exist",
		"extra",
		"faith",
		"false",
		"fault",
		"fiber",
		"field",
		"fifth",
		"fifty",
		"fight",
		"final",
		"first",
		"fixed",
		"flash",
		"fleet",
		"floor",
		"fluid",
		"focus",
		"force",
		"forth",
		"forty",
		"forum",
		"found",
		"frame",
		"frank",
		"fraud",
		"fresh",
		"front",
		"fruit",
		"fully",
		"funny",
		"giant",
		"given",
		"glass",
		"globe",
		"going",
		"grace",
		"grade",
		"grand",
		"grant",
		"grass",
		"great",
		"green",
		"gross",
		"group",
		"grown",
		"guard",
		"guess",
		"guest",
		"guide",
		"happy",
		"harry",
		"heart",
		"heavy",
		"hence",
		"henry",
		"horse",
		"hotel",
		"house",
		"human",
		"ideal",
		"image",
		"index",
		"inner",
		"input",
		"issue",
		"japan",
		"jimmy",
		"joint",
		"jones",
		"judge",
		"known",
		"label",
		"large",
		"laser",
		"later",
		"laugh",
		"layer",
		"learn",
		"lease",
		"least",
		"leave",
		"legal",
		"level",
		"lewis",
		"light",
		"limit",
		"links",
		"lives",
		"local",
		"logic",
		"loose",
		"lower",
		"lucky",
		"lunch",
		"lying",
		"magic",
		"major",
		"maker",
		"march",
		"maria",
		"match",
		"maybe",
		"mayor",
		"meant",
		"media",
		"metal",
		"might",
		"minor",
		"minus",
		"mixed",
		"model",
		"money",
		"month",
		"moral",
		"motor",
		"mount",
		"mouse",
		"mouth",
		"movie",
		"music",
		"needs",
		"never",
		"newly",
		"night",
		"noise",
		"north",
		"noted",
		"novel",
		"nurse",
		"occur",
		"ocean",
		"offer",
		"often",
		"order",
		"other",
		"ought",
		"paint",
		"panel",
		"paper",
		"party",
		"peace",
		"peter",
		"phase",
		"phone",
		"photo",
		"piece",
		"pilot",
		"pitch",
		"place",
		"plain",
		"plane",
		"plant",
		"plate",
		"point",
		"pound",
		"power",
		"press",
		"price",
		"pride",
		"prime",
		"print",
		"prior",
		"prize",
		"proof",
		"proud",
		"prove",
		"queen",
		"quick",
		"quiet",
		"quite",
		"radio",
		"raise",
		"range",
		"rapid",
		"ratio",
		"reach",
		"ready",
		"refer",
		"right",
		"rival",
		"river",
		"robin",
		"roger",
		"roman",
		"rough",
		"round",
		"route",
		"royal",
		"rural",
		"scale",
		"scene",
		"scope",
		"score",
		"sense",
		"serve",
		"seven",
		"shall",
		"shape",
		"share",
		"sharp",
		"sheet",
		"shelf",
		"shell",
		"shift",
		"shirt",
		"shock",
		"shoot",
		"short",
		"shown",
		"sight",
		"since",
		"sixth",
		"sixty",
		"sized",
		"skill",
		"sleep",
		"slide",
		"small",
		"smart",
		"smile",
		"smith",
		"smoke",
		"solid",
		"solve",
		"sorry",
		"sound",
		"south",
		"space",
		"spare",
		"speak",
		"speed",
		"spend",
		"spent",
		"split",
		"spoke",
		"sport",
		"staff",
		"stage",
		"stake",
		"stand",
		"start",
		"state",
		"steam",
		"steel",
		"stick",
		"still",
		"stock",
		"stone",
		"stood",
		"store",
		"storm",
		"story",
		"strip",
		"stuck",
		"study",
		"stuff",
		"style",
		"sugar",
		"suite",
		"super",
		"sweet",
		"table",
		"taken",
		"taste",
		"taxes",
		"teach",
		"teeth",
		"terry",
		"texas",
		"thank",
		"theft",
		"their",
		"theme",
		"there",
		"these",
		"thick",
		"thing",
		"think",
		"third",
		"those",
		"three",
		"threw",
		"throw",
		"tight",
		"times",
		"tired",
		"title",
		"today",
		"topic",
		"total",
		"touch",
		"tough",
		"tower",
		"track",
		"trade",
		"train",
		"treat",
		"trend",
		"trial",
		"tried",
		"tries",
		"truck",
		"truly",
		"trust",
		"truth",
		"twice",
		"under",
		"undue",
		"union",
		"unity",
		"until",
		"upper",
		"upset",
		"urban",
		"usage",
		"usual",
		"valid",
		"value",
		"video",
		"virus",
		"visit",
		"vital",
		"voice",
		"waste",
		"watch",
		"water",
		"wheel",
		"where",
		"which",
		"while",
		"white",
		"whole",
		"whose",
		"woman",
		"women",
		"world",
		"worry",
		"worse",
		"worst",
		"worth",
		"would",
		"wound",
		"write",
		"wrong",
		"wrote",
		"yield",
		"young",
		"youth"
	]
}
```


### Lifecycle hooks

There are four 'hooks' provided by Svelte for adding control logic — `oncreate`, `ondestroy`, `onstate` and `onupdate`:

```html
<!-- { title: 'Lifecycle hooks' } -->
<p>
	The time is
	<strong>{hours}:{minutes}:{seconds}</strong>
</p>

<script>
	export default {
		onstate({ changed, current, previous }) {
			// this fires before oncreate, and on every state change.
			// the first time it runs, `previous` is undefined
			if (changed.time) {
				console.log(`time changed: ${previous && previous.time} -> ${current.time}`);
			}
		},

		oncreate() {
			// this fires when the component has been
			// rendered to the DOM
			console.log('in oncreate');

			this.interval = setInterval(() => {
				this.set({ time: new Date() });
			}, 1000);
		},

		onupdate({ changed, current, previous }) {
			// this fires after oncreate, and after every state change
			// once the DOM is synchronised with the data
			console.log(`The DOM has been updated`);
		},

		ondestroy() {
			// this fires when the component is
			// removed from the DOM
			console.log('in ondestroy');

			clearInterval(this.interval);
		},

		data() {
			return {
				time: new Date()
			};
		},

		computed: {
			hours:   ({ time }) => time.getHours(),
			minutes: ({ time }) => time.getMinutes(),
			seconds: ({ time }) => time.getSeconds()
		}
	};
</script>
```

> You can add event listeners corresponding to `onstate`, `onupdate` and `ondestroy` programmatically — see [component.on](guide#component-on-eventname-callback-)


### Helpers

Helpers are simple functions that are used in your template. In the example above, we want to ensure that `minutes` and `seconds` are preceded with a `0` if they only have one digit, so we add a `leftPad` helper:

```html
<!-- { title: 'Helpers' } -->
<p>
	The time is
	<strong>{hours}:{leftPad(minutes, 2, '0')}:{leftPad(seconds, 2, '0')}</strong>
</p>

<script>
	import leftPad from 'left-pad';

	export default {
		helpers: {
			leftPad
		},

		oncreate() {
			this.interval = setInterval(() => {
				this.set({ time: new Date() });
			}, 1000);
		},

		ondestroy() {
			clearInterval(this.interval);
		},

		data() {
			return {
				time: new Date()
			};
		},

		computed: {
			hours:   ({ time }) => time.getHours(),
			minutes: ({ time }) => time.getMinutes(),
			seconds: ({ time }) => time.getSeconds()
		}
	};
</script>
```

Of course, you could use `leftPad` inside the computed properties instead of in the template. There's no hard and fast rule about when you should use expressions with helpers versus when you should use computed properties – do whatever makes your component easier for the next developer to understand.

> Helper functions should be *pure* – in other words, they should not have side-effects, and their returned value should only depend on their arguments.


### Custom methods

In addition to the [built-in methods](guide#component-api), you can add methods of your own:

```html
<!-- { title: 'Custom methods' } -->
<p>Try calling <code>app.say('hello!')</code> from the console</p>

<script>
	export default {
		methods: {
			say(message) {
				alert(message); // again, please don't do this
			}
		}
	};
</script>
```

These become part of the component's API:

```js
import MyComponent from './MyComponent.html';

var component = new MyComponent({
	target: document.querySelector('main')
});

component.say('👋');
```

Methods (whether built-in or custom) can also be called inside [event handlers](guide#event-handlers):

```html
<!-- { repl: false } -->
<button on:click="say('hello')">say hello!</button>
```


### Custom event handlers

Soon, we'll learn about [event handlers](guide#event-handlers) – if you want, skip ahead to that section first then come back here!

Most of the time you can make do with the standard DOM events (the sort you'd add via `element.addEventListener`, such as `click`) but sometimes you might need custom events to handle gestures, for example.

Custom events are just functions that take a node and a callback as their argument, and return an object with a `destroy` method that gets called when the element is removed from the page:

```html
<!-- { title: 'Custom events' } -->
<button on:longpress="set({ done: true })">click and hold</button>

{#if done}
	<p>clicked and held</p>
{/if}

<script>
	export default {
		events: {
			longpress(node, callback) {
				function onmousedown(event) {
					const timeout = setTimeout(() => callback(event), 1000);

					function cancel() {
						clearTimeout(timeout);
						node.removeEventListener('mouseup', cancel, false);
					}

					node.addEventListener('mouseup', cancel, false);
				}

				node.addEventListener('mousedown', onmousedown, false);

				return {
					destroy() {
						node.removeEventListener('mousedown', onmousedown, false);
					}
				};
			}
		}
	};
</script>
```


### Namespaces

Components are assumed to be in the HTML namespace. If your component is designed to be used inside an `<svg>` element, you need to specify the namespace:

```html
<!--{ title: 'SVG' }-->
<svg viewBox="0 0 1000 1000" style="width: 100%; height: 100%;">
	<SmileyFace x=70 y=280 size=100 fill="#f4d9c7"/>
	<SmileyFace x=800 y=250 size=150 fill="#40250f"/>
	<SmileyFace x=150 y=700 size=110 fill="#d2aa7a"/>
	<SmileyFace x=875 y=730 size=130 fill="#824e2e"/>
	<SmileyFace x=450 y=500 size=240 fill="#d2b198"/>
</svg>

<script>
	import SmileyFace from './SmileyFace.html';

	export default {
		components: { SmileyFace }
	};
</script>
```

```html
<!--{ filename: 'SmileyFace.html' }-->
<!-- CC-BY-SA — https://commons.wikimedia.org/wiki/File:718smiley.svg -->
<g transform="translate({x},{y}) scale({size / 366.5})">
	<circle r=366.5/>
	<circle r=336.5 fill={fill}/>
	<path d="m-41.5 298.5c-121-21-194-115-212-233v-8l-25-1-1-18h481c6 13 10 27 13 41 13 94-38 146-114 193-45 23-93 29-142 26z"/>
	<path d="m5.5 280.5c52-6 98-28 138-62 28-25 46-56 51-87 4-20 1-57-5-70l-423-1c-2 56 39 118 74 157 31 34 72 54 116 63 11 2 38 2 49 0z" fill="#871945"/>
	<path d="m-290.5 -24.5c-13-26-13-57-9-85 6-27 18-52 35-68 21-20 50-23 77-18 15 4 28 12 39 23 18 17 30 40 36 67 4 20 4 41 0 60l-6 21z"/>
	<path d="m-132.5 -43.5c5-6 6-40 2-58-3-16-4-16-10-10-14 14-38 14-52 0-15-18-12-41 6-55 3-3 5-5 5-6-1-4-22-8-34-7-42 4-57.6 40-66.2 77-3 17-1 53 4 59h145.2z" fill="#fff"/>
	<path d="m11.5 -23.5c-2-3-6-20-7-29-5-28-1-57 11-83 15-30 41-52 72-60 29-7 57 0 82 15 26 17 45 49 50 82 2 12 2 33 0 45-1 10-5 26-8 30z"/>
	<path d="m198.5 -42.5c4-5 5-34 4-50-2-14-6-24-8-24-1 0-3 2-6 5-17 17-47 13-58-9-7-16-4-31 8-43 4-4 7-8 7-9 0 0-4-2-8-3-51-17-105 20-115 80-3 15 0 43 3 53z" fill="#fff"/>
	<path d="m137.5 223.5s-46 40-105 53c-66 15-114-7-114-7s14-76 93-95c76-18 126 49 126 49z" fill="#f9bedd"/>
</g>

<script>
	export default {
		// you can either use the shorthand 'svg', or the full
		// namespace: 'http://www.w3.org/2000/svg'. (I know
		// which one I prefer.)
		namespace: 'svg',

		data() {
			return {
				x: 100,
				y: 100,
				size: 100
			};
		}
	};
</script>
```
