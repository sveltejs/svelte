import * as $ from 'svelte/internal/server';

export default function Function_prop_no_getter($$renderer) {
	var count = 0;

	function onmouseup() {
		count += 2;
	}

	var plusOne = (num) => num + 1;

	Button($$renderer, {
		onmousedown: () => count += 1,
		onmouseup,
		onmouseenter: () => count = plusOne(count),

		children: ($$renderer) => {
			$$renderer.push(`<!---->clicks: ${$.escape(count)}`);
		},

		$$slots: { default: true }
	});
}