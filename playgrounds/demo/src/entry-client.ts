// @ts-ignore
import { hydrate } from 'svelte';
// @ts-ignore you need to create this file
import App from './App.svelte';
// @ts-ignore
[window.unmount] = hydrate(App, {
	target: document.getElementById('root')!
});
