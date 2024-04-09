// @ts-ignore
import { mount, unmount } from 'svelte';
// @ts-ignore you need to create this file
import App from './App.svelte';
const component = mount(App, {
	target: document.getElementById('root')!
});
// @ts-ignore
window.unmount = () => unmount(component);
