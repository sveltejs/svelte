# Svelte

The magical disappearing UI framework.

* [Read the introductory blog post](https://svelte.technology/blog/frameworks-without-the-framework/)
* [Read the guide](https://svelte.technology/guide)
* [Try it out](https://svelte.technology/repl)
* [Chat on Gitter](https://gitter.im/sveltejs/svelte)

---

This is the Svelte compiler, which is primarily intended for authors of tooling that integrates Svelte with different build systems. If you just want to write Svelte components and use them in your app, you probably want one of those tools:

* [svelte-cli](https://github.com/sveltejs/svelte-cli) – Command line interface for compiling components
* [rollup-plugin-svelte](https://github.com/rollup/rollup-plugin-svelte) – Rollup plugin
* [sveltify](https://github.com/tehshrike/sveltify) - Browserify transform
* [gulp-svelte](https://github.com/shinnn/gulp-svelte) - gulp plugin
* [metalsmith-svelte](https://github.com/shinnn/metalsmith-svelte) - Metalsmith plugin
* [system-svelte](https://github.com/CanopyTax/system-svelte) – System.js loader
* [svelte-loader](https://github.com/sveltejs/svelte-loader) – Webpack loader
* [meteor-svelte](https://github.com/klaussner/meteor-svelte) – Meteor build plugin
* More to come!


## Example usage

```js
import * as svelte from 'svelte';

const { code, map } = svelte.compile( source, {
	// the target module format – defaults to 'es' (ES2015 modules), can
	// also be 'amd', 'cjs', 'umd', 'iife' or 'eval'
	format: 'umd',

	// the filename of the source file, used in e.g. generating sourcemaps
	filename: 'MyComponent.html',

	// the name of the constructor. Required for 'iife' and 'umd' output,
	// but otherwise mostly useful for debugging. Defaults to 'SvelteComponent'
	name: 'MyComponent',

	// for 'amd' and 'umd' output, you can optionally specify an AMD module ID
	amd: {
		id: 'my-component'
	},

	// custom error/warning handlers. By default, errors will throw, and
	// warnings will be printed to the console. Where applicable, the
	// error/warning object will have `pos`, `loc` and `frame` properties
	onerror: err => {
		console.error( err.message );
	},

	onwarn: warning => {
		console.warn( warning.message );
	}
});
```


## API

The Svelte compiler exposes the following API:

* `compile( source [, options ] ) => { code, map }` - Compile the component with the given options (see below). Returns an object containing the compiled JavaScript and a sourcemap.
* `create( source [, options ] ) => function` - Compile the component and return the component itself.
* `VERSION` - The version of this copy of the Svelte compiler as a string, `'x.x.x'`.

### Options

The Svelte compiler optionally takes a second argument, an object of configuration options:

<table>

<tr>
	<td>
	<td>**Values**
	<td>**Description**
	<td>**Default**

<tr>
	<td>`format`
	<td>`'es'`, `'amd'`, `'cjs'`, `'umd'`, `'iife'`, `'eval'`
	<td>The format to output in the compiled component.<br>`'es'` - ES6/ES2015 module, suitable for consumption by a bundler<br>`'amd'` - AMD module<br>`'cjs'` - CommonJS module<br>`'iife'` - IIFE-wrapped function defining a global variable, suitable for use directly in browser<br>`'eval'` - standalone function, suitable for passing to `eval()`
	<td>`'es'`

<tr>
	<td>`generate`
	<td>`'dom'`, `'ssr'`
	<td>Whether to generate JavaScript code intended for use on the client (`'dom'`), or for use in server-side rendering (`'ssr'`).
	<td>`'dom'`

<tr>
	<td>`name`
	<td>`string`
	<td>The name of the constructor in the compiled component.
	<td>`'SvelteComponent'`

<tr>
	<td>`filename`
	<td>`string`
	<td>The filename to use in sourcemaps and compiler error and warning messages.
	<td>`'SvelteComponent.html'`

<tr>
	<td>`amd`.`id`
	<td>`string`
	<td>The AMD module ID to use for the `'amd'` and `'umd'` output formats.
	<td>`undefined`

<tr>
	<td>`shared`
	<td>`true`, `false`, `string`
	<td>Whether to import various helpers from a shared external library. When you have a project with multiple components, this reduces the overall size of your JavaScript bundle, at the expense of having immediately-usable component. You can pass a string of the module path to use, or `true` will import from `'svelte/shared.js'`.
	<td>`false`

<tr>
	<td>`dev`
	<td>`true`, `false`
	<td>Whether to enable run-time checks in the compiled component. These are helpful during development, but slow your component down.
	<td>`false`

<tr>
	<td>`css`
	<td>`true`, `false`
	<td>Whether to include code to inject your component's styles into the DOM.
	<td>`true`

<tr>
	<td>`globals`
	<td>`object`, `function`
	<td>When outputting to the `'umd'`, `'iife'` or `'eval'` formats, an object or function mapping the names of imported dependencies to the names of global variables.
	<td>`{}`

<tr>
	<td>`onerror`
	<td>`function`
	<td>Specify a callback for when Svelte encounters an error while compiling the component.
	<td>(exception is thrown)

<tr>
	<td>`onwarn`
	<td>`function`
	<td>Specify a callback for when Svelte encounters a non-fatal warning while compiling the component.
	<td>(warning is logged to console)

</table>

## Example/starter repos

* [charpeni/svelte-example](https://github.com/charpeni/svelte-example) - Some Svelte examples with configured Rollup, Babel, ESLint, directives, Two-Way binding, and nested components
* [EmilTholin/svelte-test](https://github.com/EmilTholin/svelte-test)
* [lukechinworth/codenames](https://github.com/lukechinworth/codenames/tree/svelte) – example integration with Redux


## License

[MIT](LICENSE)
