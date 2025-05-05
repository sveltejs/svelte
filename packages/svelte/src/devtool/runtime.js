import DevTool from './DevTool.svelte';
import { mount } from 'svelte';
function create_devtool_host() {
	const id = 'svelte-devtool-host';
	if (document.getElementById(id) != null) {
		console.debug('svelte-devtool-host already exists, skipping');
		return;
	}
	const el = document.createElement('div');
	el.setAttribute('id', id);
	// appending to documentElement adds it outside of body
	document.documentElement.appendChild(el);
	return el;
}
export function mountUI(){
	if(typeof window !== 'undefined') {
		mount(DevTool, { target: create_devtool_host() });
	}
}


