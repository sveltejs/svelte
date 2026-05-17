import * as $ from 'svelte/internal/server';

export default function Nested_if_preserve_whitespace($$renderer) {
	let visible = true;
	let childVisible = true;

	$$renderer.push(`<!---->

<p>
	`);

	if (visible) {
		$$renderer.push('<!--[0-->');

		$$renderer.push(`
		`);

		if (childVisible) {
			$$renderer.push('<!--[0-->');

			$$renderer.push(`
			child
		`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->
	`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->
</p>`);
}