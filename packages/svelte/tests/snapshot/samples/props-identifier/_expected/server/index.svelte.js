import * as $ from 'svelte/internal/server';

export default function Props_identifier($$payload, $$props) {
	const $$cleanup = $.setup($$payload);

	$.push();

	let { $$slots, $$events, ...props } = $$props;

	props.a;
	props[a];
	props.a.b;
	props.a.b = true;
	props.a = true;
	props[a] = true;
	props;
	$.pop();
	$$cleanup($$payload);
}