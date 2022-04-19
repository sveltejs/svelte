export default {
	html: `
		<h1 class="svelte-udf14z" style="background-color: red;">hello</h1>
		<h1 class="svelte-udf14z">hello</h1>
		<h1 class="svelte-udf14z" style="background-color: red !important;">hello</h1>
		<h1 class="svelte-udf14z" style="background-color: red !important;">hello</h1>
		<h1 class="svelte-udf14z" style="background-color: red !important;">hello</h1>
		<h2 class="svelte-udf14z" style="--background-color:red;">hello</h2>
		<h2 class="svelte-udf14z" style="--background-color:red !important;">hello</h2>
	`,

	ssrHtml: `
		<h1 class="svelte-udf14z" style="background-color: red;">hello</h1>
		<h1 class="svelte-udf14z" style="background-color: red important;">hello</h1>
		<h1 class="svelte-udf14z" style="background-color: red !important;">hello</h1>
		<h1 class="svelte-udf14z" style="background-color: red !important;">hello</h1>
		<h1 class="svelte-udf14z" style="background-color: red !important">hello</h1>
		<h2 class="svelte-udf14z" style="--background-color: red;">hello</h2>
		<h2 class="svelte-udf14z" style="--background-color: red !important;">hello</h2>
	`,

	test({ assert, target, window }) {
		const h1s = target.querySelectorAll('h1');
		const h2s = target.querySelectorAll('h2');

		assert.equal(window.getComputedStyle(h1s[0])['backgroundColor'], 'rgb(0, 0, 255)');
		assert.equal(window.getComputedStyle(h1s[1])['backgroundColor'], 'rgb(0, 0, 255)');
		assert.equal(window.getComputedStyle(h1s[2])['backgroundColor'], 'rgb(255, 0, 0)');
		assert.equal(window.getComputedStyle(h1s[3])['backgroundColor'], 'rgb(255, 0, 0)');
		assert.equal(window.getComputedStyle(h1s[4])['backgroundColor'], 'rgb(255, 0, 0)');
		assert.equal(window.getComputedStyle(h2s[0])['backgroundColor'], 'rgb(0, 0, 255)');
		assert.equal(window.getComputedStyle(h2s[1])['backgroundColor'], 'rgb(255, 0, 0)');
	}
};
