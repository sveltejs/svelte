import { tick } from 'svelte';
import { test } from '../../test';

// Test ensures that the `const` tag is coarse-grained in legacy mode (i.e. always fires an update when the array changes)
export default test({
	html: `
		<button>Show</button>
		<p>0</p>
		<p>1</p>
		<p>2</p>
		<p>3</p>
	`,
	async test({ target, assert }) {
		const btn = target.querySelector('button');

		btn?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Show</button>
				<p>0 show (v_item) show (item)</p>
				<p>1</p>
				<p>2 show (v_item) show (item)</p>
				<p>3</p>
			`
		);
	}
});
