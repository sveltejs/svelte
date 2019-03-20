---
title: Compile time
---

Typically, you won't interact with the Svelte compiler directly, but will instead integrate it into your build system using a bundler plugin:

* [rollup-plugin-svelte](https://github.com/rollup/rollup-plugin-svelte) for users of [Rollup](https://rollupjs.org)
* [svelte-loader](https://github.com/sveltejs/svelte-loader) for users of [webpack](https://webpack.js.org)
* [parcel-plugin-svelte](https://github.com/DeMoorJasper/parcel-plugin-svelte) for users of [Parcel](https://parceljs.org/)

Nonetheless, it's useful to understand how to use the compiler, since bundler plugins generally expose compiler options to you.



### svelte.compile

```js
result: {
	js,
	css,
	ast,
	warnings,
	vars,
	stats
} = svelte.compile(source: string, options?: {...})
```

| option | type | default
| --- | --- | --- |
| `filename` | string | `null`
| `name` | string | `null`
| `format` | `"esm"` or `"cjs"` | `"esm"`
| `generate` | `"dom"` or `"ssr"` | `"dom"`
| `dev` | boolean | `false`
| `immutable` | boolean | `false`
| `hydratable` | boolean | `false`
| `legacy` | boolean | `false`
| `customElement` | boolean | `false`
| `css` | boolean | `true`
| `preserveComments` | boolean | `false`
| `preserveWhitespace` | boolean | `false`
| `outputFilename` | string | `null`
| `cssOutputFilename` | string | `null`
| `sveltePath` | string | `"node_modules/svelte"`

---

This is where the magic happens. `svelte.compile` takes your component source code, and turns it into a JavaScript module that exports a class.

Don't worry if the signature above looks a little overwhelming — none of the options are required.

```js
const svelte = require('svelte/compiler');

const { js } = svelte.compile(source);
console.log(js.code);
```

#### `result.js`

* TODO

#### `result.css`

* TODO

#### `result.ast`

* TODO

#### `result.warnings`

* TODO

#### `result.vars`

* TODO

#### `result.stats`

* TODO


<!--

```js
compiled: {
	// `map` is a v3 sourcemap with toString()/toUrl() methods
	js: { code: string, map: {...} },
	css: { code: string, map: {...} },
	ast: {...}, // ESTree-like syntax tree for the component, including HTML, CSS and JS
	warnings: Array<{
		code: string,
		message: string,
		filename: string,
		pos: number,
		start: { line: number, column: number },
		end: { line: number, column: number },
		frame: string,
		toString: () => string
	}>,
	vars: Array<{
		name: string,
		export_name: string,
		injected: boolean,
		module: boolean,
		mutated: boolean,
		reassigned: boolean,
		referenced: boolean,
		writable: boolean
	}>,
	stats: {
		timings: { [label]: number }
	}
} = svelte.compile(source: string, options?: {...})
```

-->


### svelte.preprocess

```js
result: {
	code: string,
	dependencies: Array<string>
} = svelte.preprocess(
	source: string,
	preprocessors: Array<{
		markup?: (input: { source: string, filename: string }) => Promise<{
			code: string,
			dependencies?: Array<string>
		}>,
		script?: (input: { source: string, attributes: Record<string, string>, filename: string }) => Promise<{
			code: string,
			dependencies?: Array<string>
		}>,
		style?: (input: { source: string, attributes: Record<string, string>, filename: string }) => Promise<{
			code: string,
			dependencies?: Array<string>
		}>
	}>,
	options?: {
		filename?: string
	}
)
```

---

The `preprocess` function provides convenient hooks for arbitrarily transforming component source code. For example, it can be used to convert a `<style lang="sass">` block into vanilla CSS.

The first argument is the component source code. The second is an array of *preprocessors* (or a single preprocessor, if you only have one), where a preprocessor is an object with `markup`, `script` and `style` functions, each of which is optional.

Each `markup`, `script` or `style` function must return an object (or a Promise that resolves to an object) with a `code` property, representing the transformed source code, and an optional array of `dependencies`.

The `markup` function receives the entire component source text, along with the component's `filename` if it was specified in the third argument.

> Preprocessor functions may additionally return a `map` object alongside `code` and `dependencies`, where `map` is a sourcemap representing the transformation. In current versions of Svelte it will be ignored, but future versions of Svelte may take account of preprocessor sourcemaps.

```js
const svelte = require('svelte/compiler');

const { code } = svelte.preprocess(source, {
	markup: ({ content, filename }) => {
		return {
			code: content.replace(/foo/g, 'bar')
		};
	}
}, {
	filename: 'App.svelte'
});
```

---

The `script` and `style` functions receive the contents of `<script>` and `<style>` elements respectively. In addition to `filename`, they get an object of the element's attributes.

If a `dependencies` array is returned, it will be included in the result object. This is used by packages like [rollup-plugin-svelte](https://github.com/rollup/rollup-plugin-svelte) to watch additional files for changes, in the case where your `<style>` tag has an `@import` (for example).

```js
const svelte = require('svelte/compiler');
const sass = require('node-sass');

const { code, dependencies } = svelte.preprocess(source, {
	style: ({ content, attributes, filename }) => {
		// only process <style lang="sass">
		if (attributes.lang !== 'sass') return;

		const { css, stats } = await new Promise((resolve, reject) => sass.render({
			file: filename,
			data: content,
			includePaths: [
				dirname(filename),
			],
		}), (err, result) => {
			if (err) reject(err);
			else resolve(result);
		}));

		return {
			code: css.toString(),
			dependencies: stats.includedFiles
		};
	}
}, {
	filename: 'App.svelte'
});
```

---

Multiple preprocessors can be used together. The output of the first becomes the input to the second. `markup` functions run first, then `script` and `style`.

```js
const svelte = require('svelte/compiler');

const { code } = svelte.preprocess(source, [
	{
		markup: () => {
			console.log('this runs first');
		},
		script: () => {
			console.log('this runs third');
		},
		style: () => {
			console.log('this runs fifth');
		}
	},
	{
		markup: () => {
			console.log('this runs second');
		},
		script: () => {
			console.log('this runs fourth');
		},
		style: () => {
			console.log('this runs sixth');
		}
	}
], {
	filename: 'App.svelte'
});
```


### svelte.VERSION

---

The current version, as set in package.json.

```js
const svelte = require('svelte/compiler');
console.log(`running svelte version ${svelte.VERSION}`);
```
