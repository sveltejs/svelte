import ToolBar from './ToolBar.svelte';
import { mount } from 'svelte';
import {getConfig} from './configure.svelte.js';

export function mountUI() {
	if(typeof window !== 'undefined') {
		const id = 'svelte-toolbar-host';
		if (document.getElementById(id) != null) {
			console.debug('svelte-toolbar-host already exists, skipping');
			return
		}
		const props = $state({config: getConfig()})

		const el = document.createElement('div');
		el.setAttribute('id', id);
		// appending to documentElement adds it outside of body
		document.documentElement.appendChild(el);
		mount(ToolBar, { target: el,props });
	}
}
