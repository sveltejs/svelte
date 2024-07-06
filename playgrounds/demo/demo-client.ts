import { mount, hydrate, unmount } from 'svelte';
import App from './src/main.svelte';

const root = document.getElementById('root')!;
const render = root.firstChild?.nextSibling ? hydrate : mount;

const component = render(App, {
	target: document.getElementById('root')!,
	recover: false
});

// @ts-ignore
window.unmount = () => unmount(component);
