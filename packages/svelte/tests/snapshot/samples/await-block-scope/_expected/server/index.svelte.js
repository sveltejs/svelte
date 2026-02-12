import * as $ from 'svelte/internal/server';

export default function Await_block_scope($$renderer) {
	let counter = { count: 0 };
	const promise = Promise.resolve(counter);

	function increment() {
		counter.count += 1;
	}

	$$renderer.push(`<button>clicks: ${$.escape(counter.count)}</button> `);
	$.await($$renderer, promise, () => {}, (counter) => {});
	$$renderer.push(`<!--]--> ${$.escape(counter.count)}`);
}