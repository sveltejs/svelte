import ToolBar from './ToolBar.svelte';
import { mount } from 'svelte';
function create_toolbar_host() {
	const id = 'svelte-toolbar-host';
	if (document.getElementById(id) != null) {
		console.debug('svelte-toolbar-host already exists, skipping');
		return;
	}
	const el = document.createElement('div');
	el.setAttribute('id', id);
	// appending to documentElement adds it outside of body
	document.documentElement.appendChild(el);
	return el;
}
export function mountUI() {
	if (typeof window !== 'undefined') {
		mount(ToolBar, { target: create_toolbar_host() });
	}
}
