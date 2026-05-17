import * as $ from 'svelte/internal/server';

export default function Nested_if_optimization($$renderer) {
	let iconData = { paths: [{ d: 'M0 0' }] };

	$$renderer.push(`<svg>`);

	if (iconData && iconData.paths) {
		$$renderer.push('<!--[0-->');
		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(iconData.paths);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let path = each_array[$$index];

			$$renderer.push(`<path${$.attributes({ ...path }, void 0, void 0, void 0, 3)}></path>`);
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></svg>`);
}