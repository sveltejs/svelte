import * as $ from 'svelte/internal/server';

export default function Prevent_template_cloning($$payload) {
	let counter = { count: 0 };
	const promise = Promise.resolve(counter);

	function increment() {
		counter.count += 1;
	}

	$$payload.out += `<button>clicks: ${$.escape(counter.count)}</button> <!---->`;
	$.await(promise, () => {}, (counter) => {}, () => {});
	$$payload.out += `<!----> ${$.escape(counter.count)}`;
}