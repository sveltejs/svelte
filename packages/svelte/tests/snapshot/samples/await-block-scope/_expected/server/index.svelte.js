import * as $ from "svelte/internal/server";

export default function Await_block_scope($$payload) {
	let counter = { count: 0 };
	const promise = Promise.resolve(counter);

	function increment() {
		counter.count += 1;
	}

	$$payload.out += `<button>clicks: ${$.escape(counter.count)}</button> ${$.empty()}`;

	$.await(
		$$payload,
		promise,
		() => {},
		(counter, $$async_payload = $$payload) => {
			const $$payload = $$async_payload;
		},
		() => {}
	);

	$$payload.out += `${$.empty()} ${$.escape(counter.count)}`;
}