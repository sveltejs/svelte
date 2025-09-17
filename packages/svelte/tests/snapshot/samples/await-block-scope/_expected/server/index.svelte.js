import * as $ from 'svelte/internal/server';

export default function Await_block_scope($$payload) {
	let counter = { count: 0 };
	const promise = Promise.resolve(counter);

	function increment() {
		counter.count += 1;
	}

	$$payload.push(`<button>clicks: ${$.escape(counter.count)}</button> `);
	$.await($$payload, promise, () => {}, (counter) => {});
	$$payload.push(`<!--]--> ${$.escape(counter.count)}`);
}