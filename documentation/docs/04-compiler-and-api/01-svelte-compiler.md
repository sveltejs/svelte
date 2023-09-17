---
title: 'svelte/compiler'
---

Typically, you won't interact with the Svelte compiler directly, but will instead integrate it into your build system using a bundler plugin. The bundler plugin that the Svelte team most recommends and invests in is [vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte). The [SvelteKit](https://kit.svelte.dev/) framework provides a setup leveraging `vite-plugin-svelte` to build applications as well as a [tool for packaging Svelte component libraries](https://kit.svelte.dev/docs/packaging). Svelte Society maintains a list of [other bundler plugins](https://sveltesociety.dev/tools/#bundling) for additional tools like Rollup and Webpack.

Nonetheless, it's useful to understand how to use the compiler, since bundler plugins generally expose compiler options to you.

## compile

> EXPORT_SNIPPET: svelte/compiler#compile

This is where the magic happens. `svelte.compile` takes your component source code, and turns it into a JavaScript module that exports a class.

```js
// @filename: ambient.d.ts
declare global {
	var source: string
}

export {}

// @filename: index.ts
// ---cut---
import { compile } from 'svelte/compiler';

const result = compile(source, {
	// options
});
```

Refer to [CompileOptions](#types-compileoptions) for all the available options.

The returned `result` object contains the code for your component, along with useful bits of metadata.

```ts
// @filename: ambient.d.ts
declare global {
	const source: string;
}

export {};

// @filename: main.ts
import { compile } from 'svelte/compiler';
// ---cut---
const { js, css, ast, warnings, vars, stats } = compile(source);
```

Refer to [CompileResult](#types-compileresult) for a full description of the compile result.

## parse

> EXPORT_SNIPPET: svelte/compiler#parse

The `parse` function parses a component, returning only its abstract syntax tree. Unlike compiling with the `generate: false` option, this will not perform any validation or other analysis of the component beyond parsing it. Note that the returned AST is not considered public API, so breaking changes could occur at any point in time.

```js
// @filename: ambient.d.ts
declare global {
	var source: string;
}

export {};

// @filename: main.ts
// ---cut---
import { parse } from 'svelte/compiler';

const ast = parse(source, { filename: 'App.svelte' });
```

## preprocess

> EXPORT_SNIPPET: svelte/compiler#preprocess

A number of [official and community-maintained preprocessing plugins](https://sveltesociety.dev/tools#preprocessors) are available to allow you to use Svelte with tools like TypeScript, PostCSS, SCSS, and Less.

You can write your own preprocessor using the `svelte.preprocess` API.

The `preprocess` function provides convenient hooks for arbitrarily transforming component source code. For example, it can be used to convert a `<style lang="sass">` block into vanilla CSS.

The first argument is the component source code. The second is an array of _preprocessors_ (or a single preprocessor, if you only have one), where a preprocessor is an object with a `name` which is required, and `markup`, `script` and `style` functions, each of which is optional.

The `markup` function receives the entire component source text, along with the component's `filename` if it was specified in the third argument.

The `script` and `style` functions receive the contents of `<script>` and `<style>` elements respectively (`content`) as well as the entire component source text (`markup`). In addition to `filename`, they get an object of the element's attributes.

Each `markup`, `script` or `style` function must return an object (or a Promise that resolves to an object) with a `code` property, representing the transformed source code. Optionally they can return an array of `dependencies` which represents files to watch for changes, and a `map` object which is a sourcemap mapping back the transformation to the original code. `script` and `style` preprocessors can optionally return a record of attributes which represent the updated attributes on the script/style tag.

> Preprocessor functions should return a `map` object whenever possible or else debugging becomes harder as stack traces can't link to the original code correctly.

```ts
// @filename: ambient.d.ts
declare global {
	var source: string;
}

export {};

// @filename: main.ts
// ---cut---
import { preprocess } from 'svelte/compiler';
import MagicString from 'magic-string';

const { code } = await preprocess(
	source,
	{
		markup: ({ content, filename }) => {
			const pos = content.indexOf('foo');
			if (pos < 0) {
				return { code: content };
			}
			const s = new MagicString(content, { filename });
			s.overwrite(pos, pos + 3, 'bar', { storeName: true });
			return {
				code: s.toString(),
				map: s.generateMap()
			};
		}
	},
	{
		filename: 'App.svelte'
	}
);
```

If a `dependencies` array is returned, it will be included in the result object. This is used by packages like [vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte) and [rollup-plugin-svelte](https://github.com/sveltejs/rollup-plugin-svelte) to watch additional files for changes, in the case where your `<style>` tag has an `@import` (for example).

```ts
/// file: preprocess-sass.js
// @filename: ambient.d.ts
declare global {
	var source: string;
}

export {};

// @filename: main.ts
// @errors: 2322 2345 2339
/// <reference types="@types/node" />
// ---cut---
import { preprocess } from 'svelte/compiler';
import MagicString from 'magic-string';
import sass from 'sass';
import { dirname } from 'path';

const { code } = await preprocess(
	source,
	{
		name: 'my-fancy-preprocessor',
		markup: ({ content, filename }) => {
			// Return code as is when no foo string present
			const pos = content.indexOf('foo');
			if (pos < 0) {
				return;
			}

			// Replace foo with bar using MagicString which provides
			// a source map along with the changed code
			const s = new MagicString(content, { filename });
			s.overwrite(pos, pos + 3, 'bar', { storeName: true });

			return {
				code: s.toString(),
				map: s.generateMap({ hires: true, file: filename })
			};
		},
		style: async ({ content, attributes, filename }) => {
			// only process <style lang="sass">
			if (attributes.lang !== 'sass') return;

			const { css, stats } = await new Promise((resolve, reject) =>
				sass.render(
					{
						file: filename,
						data: content,
						includePaths: [dirname(filename)]
					},
					(err, result) => {
						if (err) reject(err);
						else resolve(result);
					}
				)
			);

			// remove lang attribute from style tag
			delete attributes.lang;

			return {
				code: css.toString(),
				dependencies: stats.includedFiles,
				attributes
			};
		}
	},
	{
		filename: 'App.svelte'
	}
);
```

Multiple preprocessors can be used together. The output of the first becomes the input to the second. Within one preprocessor, `markup` runs first, then `script` and `style`.

> In Svelte 3, all `markup` functions ran first, then all `script` and then all `style` preprocessors. This order was changed in Svelte 4.

```js
/// file: multiple-preprocessor.js
// @errors: 2322
// @filename: ambient.d.ts
declare global {
	var source: string;
}

export {};

// @filename: main.ts
// ---cut---
import { preprocess } from 'svelte/compiler';

const { code } = await preprocess(source, [
	{
		name: 'first preprocessor',
		markup: () => {
			console.log('this runs first');
		},
		script: () => {
			console.log('this runs second');
		},
		style: () => {
			console.log('this runs third');
		}
	},
	{
		name: 'second preprocessor',
		markup: () => {
			console.log('this runs fourth');
		},
		script: () => {
			console.log('this runs fifth');
		},
		style: () => {
			console.log('this runs sixth');
		}
	}
], {
	filename: 'App.svelte'
});
```

## walk

> EXPORT_SNIPPET: svelte/compiler#walk

The `walk` function provides a way to walk the abstract syntax trees generated by the parser, using the compiler's own built-in instance of [estree-walker](https://github.com/Rich-Harris/estree-walker).

The walker takes an abstract syntax tree to walk and an object with two optional methods: `enter` and `leave`. For each node, `enter` is called (if present). Then, unless `this.skip()` is called during `enter`, each of the children are traversed, and then `leave` is called on the node.

```js
/// file: compiler-walk.js
// @filename: ambient.d.ts
declare global {
	var ast: import('estree').Node;
	function do_something(node: import('estree').Node): void;
	function do_something_else(node: import('estree').Node): void;
	function should_skip_children(node: import('estree').Node): boolean;
}

export {};

// @filename: main.ts
// @errors: 7006
// ---cut---
import { walk } from 'svelte/compiler';

walk(ast, {
	enter(node, parent, prop, index) {
		do_something(node);
		if (should_skip_children(node)) {
			this.skip();
		}
	},
	leave(node, parent, prop, index) {
		do_something_else(node);
	}
});
```

## VERSION

> EXPORT_SNIPPET: svelte/compiler#VERSION

The current version, as set in package.json.

```js
import { VERSION } from 'svelte/compiler';
console.log(`running svelte version ${VERSION}`);
```

## Types

> TYPES: svelte/compiler
