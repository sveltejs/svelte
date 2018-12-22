import { afterUpdate } from 'svelte';

export default function flash(fn) {
	afterUpdate(() => {
		const span = fn();

		span.style.color = 'red';

		setTimeout(() => {
			span.style.color = 'black';
		}, 400);
	});
}