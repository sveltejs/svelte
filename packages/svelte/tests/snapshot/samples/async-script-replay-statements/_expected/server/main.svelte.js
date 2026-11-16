import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let input = 1;
	const load = (value) => Promise.resolve(value);

	console.log('prefix');

	var snapshot, value;

	var $$promises = $$renderer.run([
		() => load(input),
		async () => snapshot = await load(input),
		() => void console.log(snapshot),
		async () => value = await $.async_derived(() => load(input + snapshot)),
		() => void console.log(value())
	]);

	$$renderer.push(`<button>update</button> <output>`);
	$$renderer.async([$$promises[4]], ($$renderer) => $$renderer.push(() => $.escape(value())));
	$$renderer.push(` `);
	$$renderer.async([$$promises[4]], ($$renderer) => $$renderer.push(() => $.escape(snapshot)));
	$$renderer.push(`</output>`);
}