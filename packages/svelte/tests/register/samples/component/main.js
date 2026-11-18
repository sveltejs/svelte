import { createRequire } from 'node:module';
import { render } from 'svelte/server';
import App from './App.svelte';

const require = createRequire(import.meta.url);

console.log(
	JSON.stringify({
		imported: render(App, { props: { name: 'import' } }).body,
		required: render(require('./App.svelte').default, { props: { name: 'require' } }).body
	})
);
