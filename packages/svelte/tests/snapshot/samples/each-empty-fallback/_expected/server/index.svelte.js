import * as $ from 'svelte/internal/server';

export default function Each_empty_fallback($$renderer, $$props) {
	let { items } = $$props;
	const each_array = $.ensure_array_like(items);

	if (each_array.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<p>${$.escape(item)}</p>`);
		}
	} else {
		$$renderer.push('<!--[!-->');
	}

	$$renderer.push(`<!--]--> `);

	const each_array_1 = $.ensure_array_like(items);

	if (each_array_1.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let item = each_array_1[$$index_1];

			$$renderer.push(`<p>${$.escape(item)}</p>`);
		}
	} else {
		$$renderer.push('<!--[!-->');
	}

	$$renderer.push(`<!--]-->`);
}