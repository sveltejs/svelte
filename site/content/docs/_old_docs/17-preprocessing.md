---
title: Preprocessing
---

Some developers like to use non-standard languages such as [Pug](https://pugjs.org/api/getting-started.html), [Sass](http://sass-lang.com/) or [CoffeeScript](http://coffeescript.org/).

It's possible to use these languages, or anything else that can be converted to HTML, CSS and JavaScript, using *preprocessors*.


### svelte.preprocess

Svelte exports a `preprocess` function that takes some input source code and returns a Promise for a standard Svelte component, ready to be used with `svelte.compile`:

```js
const svelte = require('svelte');

const input = fs.readFileSync('App.html', 'utf-8');

svelte.preprocess(input, {
	filename: 'App.html', // this is passed to each preprocessor

	markup: ({ content, filename }) => {
		return {
			code: '<!-- some HTML -->',
			map: {...}
		};
	},

	style: ({ content, attributes, filename }) => {
		return {
			code: '/* some CSS */',
			map: {...}
		};
	},

	script: ({ content, attributes, filename }) => {
		return {
			code: '// some JavaScript',
			map: {...}
		};
	}
}).then(preprocessed => {
	fs.writeFileSync('preprocessed/App.html', preprocessed.toString());

	const { js } = svelte.compile(preprocessed);
	fs.writeFileSync('compiled/App.js', js.code);
});
```

The `markup` preprocessor, if specified, runs first. The `content` property represents the entire input string.

The `style` and `script` preprocessors receive the contents of the `<style>` and `<script>` elements respectively, along with any `attributes` on those elements (e.g. `<style lang='scss'>`).

All three preprocessors are optional. Each should return a `{ code, map }` object or a Promise that resolves to a `{ code, map }` object, where `code` is the resulting string and `map` is a sourcemap representing the transformation.

> The returned `map` objects are not currently used by Svelte, but will be in future versions


### Using build tools

Many build tool plugins, such as [rollup-plugin-svelte](https://github.com/rollup/rollup-plugin-svelte) and [svelte-loader](https://github.com/sveltejs/svelte-loader), allow you to specify `preprocess` options, in which case the build tool will do the grunt work.