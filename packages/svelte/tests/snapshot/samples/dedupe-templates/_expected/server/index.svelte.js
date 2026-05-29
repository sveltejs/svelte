import * as $ from 'svelte/internal/server';

export default function Dedupe_templates($$renderer, $$props) {
	let { a, b } = $$props;

	if (a) {
		$$renderer.push('<!--[0-->');
		$$renderer.push(`<p class="x">hello</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
		$$renderer.push(`<p class="x">hello</p>`);
	}

	$$renderer.push(`<!--]--> `);

	if (b) {
		$$renderer.push('<!--[0-->');
		$$renderer.push(`<p class="x">hello</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}