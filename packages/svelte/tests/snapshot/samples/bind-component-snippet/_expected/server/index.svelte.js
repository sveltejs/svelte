import * as $ from 'svelte/internal/server';
import TextInput from './Child.svelte';

function snippet($$payload) {
	$$payload.push(`<!---->Something`);
}

export default function Bind_component_snippet($$payload) {
	let value = '';
	const _snippet = snippet;
	let $$settled = true;
	let $$inner_payload;

	function $$render_inner($$payload) {
		TextInput($$payload, {
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$payload.push(`<!----> value: ${$.escape(value)}`);
	}

	do {
		$$settled = true;
		$$inner_payload = $$payload.copy();
		$$render_inner($$inner_payload);
	} while (!$$settled);

	$$payload.subsume($$inner_payload);
}