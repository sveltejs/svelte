import * as $ from 'svelte/internal/server';

export default function Props_identifier($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;

		props.a;
		props[a];
		props.a.b;
		props.a.b = true;
		props.a = true;
		props[a] = true;
		props;
	});
}