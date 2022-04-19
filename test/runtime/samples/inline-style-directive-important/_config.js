export default {
	html: `
		<h1 class="svelte-szzkfu" style="background-color: red;">hello</h1>
		<h1 class="svelte-szzkfu">hello</h1>
		<h1 class="svelte-szzkfu" style="background-color: red !important;">hello</h1>
	`,

	ssrHtml: `
		<h1 class="svelte-szzkfu" style="background-color: red;">hello</h1>
		<h1 class="svelte-szzkfu" style="background-color: red important;">hello</h1>
		<h1 class="svelte-szzkfu" style="background-color: red !important;">hello</h1>
	`,
	skip: true,
	test({ assert, target, window, component }) {
		const h1s = target.querySelectorAll('h1');

		assert.equal(window.getComputedStyle(h1s[0])['backgroundColor'], 'blue'); // TODO: This should be blue but ends up being red
		assert.equal(window.getComputedStyle(h1s[1])['backgroundColor'], 'blue');
		assert.equal(window.getComputedStyle(h1s[2])['backgroundColor'], 'red');

		component.color = 'yellow';
		assert.equal(window.getComputedStyle(h1s[0])['backgroundColor'], 'blue');
		assert.equal(window.getComputedStyle(h1s[1])['backgroundColor'], 'blue');
		assert.equal(window.getComputedStyle(h1s[2])['backgroundColor'], 'yellow');
	}
};
