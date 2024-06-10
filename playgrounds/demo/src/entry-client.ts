import { mount, hydrate, unmount } from 'svelte';
import App from './App.svelte';

const root = document.getElementById('root')!;
const render = root.firstChild?.nextSibling ? hydrate : mount;

const component = render(App, {
	target: document.getElementById('root')!
});
// @ts-ignore
window.unmount = () => unmount(component);
