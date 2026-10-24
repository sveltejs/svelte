import * as $ from 'svelte/internal/server';
import A from './A.svelte';

export default function Lone_dynamic_component($$renderer) {
	let Component = A;
	let items = [1, 2, 3];
	let show = true;

	if (show) {
		$$renderer.push('<!--[0-->');

		if (Component) {
			$$renderer.push('<!--[-->');
			Component($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (show) {
		$$renderer.push('<!--[0-->');

		if (Component) {
			$$renderer.push('<!--[-->');
			Component($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`<span></span>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		if (Component) {
			$$renderer.push('<!--[-->');
			Component($$renderer, { item });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	$$renderer.push(`<!--]-->`);
}