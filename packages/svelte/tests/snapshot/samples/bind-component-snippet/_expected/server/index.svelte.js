import * as $ from 'svelte/internal/server';
import TextInput from './Child.svelte';

function snippet($$renderer) {
	$$renderer.push(`<!---->Something`);
}

export default function Bind_component_snippet($$renderer) {
	let value = '';
	const _snippet = snippet;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextInput($$renderer, {
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> value: ${$.escape(value)}`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}