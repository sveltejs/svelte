import * as $ from "svelte/internal/server";
import TextInput from './Child.svelte';

export default function Bind_component_snippet($$payload, $$props) {
	$.push();

	let value = '';
	const _snippet = snippet;

	function snippet($$payload) {
		$$payload.out += `Something`;
	}

	let $$settled = true;
	let $$inner_payload;

	function $$render_inner($$payload) {
		$$payload.out += `<!--[-->`;

		TextInput($$payload, {
			get value() {
				return value;
			},
			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$payload.out += `<!--]--> value: ${$.escape(value)}`;
	};

	do {
		$$settled = true;
		$$inner_payload = $.copy_payload($$payload);
		$$render_inner($$inner_payload);
	} while (!$$settled);

	$.assign_payload($$payload, $$inner_payload);
	$.pop();
}