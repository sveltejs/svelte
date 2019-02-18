# Svelte

The magical disappearing UI framework.

* [Read the introductory blog post](https://svelte.technology/blog/frameworks-without-the-framework)
* [Read the guide](https://svelte.technology/guide)
* [Try it out](https://svelte.technology/repl)
* [Chat on Discord](https://discord.gg/yy75DKs)

---

## Tooling

This is the Svelte compiler, which is primarily intended for authors of tooling that integrates Svelte with different build systems. If you just want to write Svelte components and use them in your app, you probably want one of those tools:

### Build Systems

* [gulp-svelte](https://github.com/shinnn/gulp-svelte) - gulp plugin
* [metalsmith-svelte](https://github.com/shinnn/metalsmith-svelte) - Metalsmith plugin
* [system-svelte](https://github.com/CanopyTax/system-svelte) – System.js loader
* [svelte-loader](https://github.com/sveltejs/svelte-loader) – Webpack loader
* [meteor-svelte](https://github.com/klaussner/meteor-svelte) – Meteor build plugin
* [sveltejs-brunch](https://github.com/StarpTech/sveltejs-brunch) – Brunch build plugin
* [rollup-plugin-svelte](https://github.com/rollup/rollup-plugin-svelte) – Rollup plugin
* [parcel-plugin-svelte](https://github.com/DeMoorJasper/parcel-plugin-svelte) - Parcel build plugin
* [sveltify](https://github.com/tehshrike/sveltify) - Browserify transform

### CSS Preprocessors

* [Less](https://github.com/ls-age/svelte-preprocess-less)
* [modular-css](https://github.com/tivac/modular-css/tree/master/packages/svelte)
* [PostCSS](https://github.com/TehShrike/svelte-preprocess-postcss)
* [Sass](https://github.com/ls-age/svelte-preprocess-sass)

### Additional tools

* [svelte-dev-store](https://github.com/GarethOates/svelte-dev-store) - Use Redux tools to visualise Svelte store
* More to come!

## Example usage

```js
import * as svelte from 'svelte/compiler';

const { js, css, ast } = svelte.compile(source, {
	// the target module format – defaults to 'esm' (ES2015 modules), can also be 'cjs'
	format: 'cjs',

	// the filename of the source file, used in e.g. generating sourcemaps
	filename: 'MyComponent.html',

	// custom warning handler. By default, warnings will be printed to the console.
	// Where applicable, the warning object will have `pos`, `loc` and `frame` properties
	onwarn: warning => {
		console.warn(warning.message);
	}
});
```


## API

The Svelte compiler exposes the following API:

* `compile(source [, options]) => { ... }` - Compile the component with the given options (see below). Returns an object, containing:
	* `js` - the compiled JavaScript, containing:
		* `code` - a string
		* `map` - the sourcemap
	* `css` - the transformed CSS, containing:
		* `code` - a string
		* `map` - the sourcemap
	* `ast` - ASTs for the input component, containing:
		* `html` - the template
		* `css` - the styles
		* `instance` - the per-instance JavaScript code
		* `module` - the one-time (module-level) JavaScript code
	* `warnings` - an array of compiler warnings
	* `vars` - an array of referenced variables
	* `stats` - other diagnostic information
* `preprocess(source, options) => Promise` — Preprocess a source file, e.g. to use PostCSS or CoffeeScript
* `VERSION` - The version of this copy of the Svelte compiler as a string, `'x.x.x'`.

### Compiler options

The Svelte compiler optionally takes a second argument, an object of configuration options:

| | **Values** | **Description** | **Default** |
|---|---|---|---|
| `generate` | `'dom'`, `'ssr'`, `false` | Whether to generate JavaScript code intended for use on the client (`'dom'`), or for use in server-side rendering (`'ssr'`). If `false`, component will be parsed and validated but no code will be emitted. | `'dom'` |
| `dev` | `boolean` | Whether to enable run-time checks in the compiled component. These are helpful during development, but slow your component down. | `false` |
| `css` | `boolean` | Whether to include JavaScript code to inject your component's styles into the DOM. | `true` |
| `hydratable` | `boolean` | Whether to support hydration on the compiled component. | `false` |
| `customElement` | `boolean`, `{ tag, props }` | Whether to compile this component to a custom element. If `tag`/`props` are passed, compiles to a custom element and overrides the values exported by the component. | `false` |
| `bind` | `boolean` | If `false`, disallows `bind:` directives. | `true` |
| `legacy` | `boolean` | Ensures compatibility with very old browsers, at the cost of some extra code. | `false` |
| | | |
| `format` | `'esm'`, `'cjs'` | The format to output in the compiled component.<br>`'esm'` - ES6/ES2015 module, suitable for consumption by a bundler<br>`'cjs'` - CommonJS module | `'esm'` |
| `name` | `string` | The name of the constructor in the compiled component. | `'SvelteComponent'` |
| `filename` | `string` | The filename to use in sourcemaps and compiler error and warning messages. | `'SvelteComponent.html'` |
| `sveltePath` | `string` | The path to the root of the package used in `import`s generated by the compiler. | `'svelte'` |
| `preserveComments` | `boolean` | Include comments in rendering. Currently, only applies to SSR rendering. | `false` |

### Preprocessor options

`svelte.preprocess` returns a Promise that resolves to an object with a `toString` method (other properties will be added in future). It takes an options object with `markup`, `style` or `script` properties:

```js
const processed = await svelte.preprocess(source, {
	markup: ({ content }) => {
		// `content` is the entire component string
		return { code: '...', map: {...} };
	},

	style: ({ content, attributes }) => {
		// `content` is what's inside the <style> element, if present
		// `attributes` is a map of attributes on the element
		if (attributes.type !== 'text/scss') return;
		return { code: '...', map: {...} };
	},

	script: ({ content, attributes }) => {
		// `content` is what's inside the <script> element, if present
		// `attributes` is a map of attributes on the element
		if (attributes.type !== 'text/coffeescript') return;
		return { code: '...', map: {...} };
	}
});
```

The `style` and `script` preprocessors will run *after* the `markup` preprocessor. Each preprocessor can return a) nothing (in which case no transformation takes place), b) a `{ code, map }` object, or c) a Promise that resolves to a) or b). Note that sourcemaps are currently discarded, but will be used in future versions of Svelte.

## Example/starter repos

* [sveltejs/template](https://github.com/sveltejs/template) — the 'official' starter template
* [sveltejs/template-webpack](https://github.com/sveltejs/template-webpack) — using webpack for bundling
* [charpeni/svelte-example](https://github.com/charpeni/svelte-example) - Some Svelte examples with configured Rollup, Babel, ESLint, directives, Two-Way binding, and nested components
* [EmilTholin/svelte-test](https://github.com/EmilTholin/svelte-test)
* [lukechinworth/codenames](https://github.com/lukechinworth/codenames/tree/svelte) – example integration with Redux
* [khtdr/svelte-redux-shopping-cart](https://github.com/khtdr/svelte-redux-shopping-cart) – Redux Shopping Cart example (with devtools and hot-reloading)

## Development

Pull requests are encouraged and always welcome. [Pick an issue](https://github.com/sveltejs/svelte/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) and help us out!

To install and work on Svelte locally:

```bash
git clone git@github.com:sveltejs/svelte.git
cd svelte
npm ci
npm run dev
```

The compiler is written in [TypeScript](https://www.typescriptlang.org/), but don't let that put you off — it's basically just JavaScript with type annotations. You'll pick it up in no time. If you're using an editor other than [VSCode](https://code.visualstudio.com/) you may need to install a plugin in order to get syntax highlighting and code hints etc.

### Linking to a Live Project

You can make changes locally to Svelte and test it against any Svelte project. You can also use a [default template](https://github.com/sveltejs/template) for development. Instruction on setup are found in that project repository.

From your project:

```bash
cd ~/path/to/your-svelte-project
npm install ~/path/to/svelte
```

And you should be good to test changes locally.

To undo this and link to the official latest Svelte release, just run:

```bash
npm install svelte@latest
```

### Running Tests

```bash
npm run test
```

For running single tests, you can use pattern matching:

```bash
npm run test -- -g "includes AST in svelte.compile output"
```

Alternately, you can add `solo: true` to any given `test/../_config.js` file, but **remember never to commit that setting.**

## License

[MIT](LICENSE)
