import * as $ from 'svelte/internal/server';

export default function Svelte_element($$payload, $$props) {
	$$payload.child(({ $$payload }) => {
		let { tag = 'hr' } = $$props;

		$.element($$payload, tag);
	});
}