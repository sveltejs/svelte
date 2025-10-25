import * as $ from 'svelte/internal/server';

export default function State_proxy_literal($$renderer) {
	var str = '';
	var tpl = ``;

	function reset() {
		str = '';
		str = ``;
		tpl = '';
		tpl = ``;
	}

	$$renderer.push(`<input${$.attr('value', str)}/> <input${$.attr('value', tpl)}/> <button>reset</button>`);
}