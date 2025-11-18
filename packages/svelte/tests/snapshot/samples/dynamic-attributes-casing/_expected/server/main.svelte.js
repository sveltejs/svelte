import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	// needs to be a snapshot test because jsdom does auto-correct the attribute casing
	let x = 'test';

	let y = () => 'test';

	$$renderer.push(`<div${$.attr('foobar', x)}></div> <svg${$.attr('viewBox', x)}></svg> <custom-element${$.attr('foobar', x)}></custom-element> <div${$.attr('foobar', y())}></div> <svg${$.attr('viewBox', y())}></svg> <custom-element${$.attr('foobar', y())}></custom-element>`);
}