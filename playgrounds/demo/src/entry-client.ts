// @ts-ignore
import { hydrate, unmount } from 'svelte';
// @ts-ignore you need to create this file
import App from './App.svelte';
const component = hydrate(App, {
	target: document.getElementById('root')!
});
// @ts-ignore
window.unmount = () => unmount(component);
