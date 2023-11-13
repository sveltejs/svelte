// @ts-ignore
import { mount } from 'svelte';
// @ts-ignore you need to create this file
import App from './App.svelte';
// @ts-ignore
[window.unmount] = mount(App, {
	target: document.getElementById('root')!
});
