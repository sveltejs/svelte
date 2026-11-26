import * as $ from 'svelte/internal/server';

export default function Option($$renderer) {
	$$renderer.option({}, ($$renderer) => {
		$$renderer.push(`Component Option`);
	});
}