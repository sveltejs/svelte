import { test } from '../../test';

// expect aborting halfway through outro transition
// to behave the same in `{#if}` block as in `{:else}` block
export default test({
	html: `
		<div>a</div>

		<div>a</div>
	`,

	async test({ assert, component, target, raf }) {
		component.visible = false;

		// abort halfway through the outro transition
		raf.tick(50);

		await component.$set({
			visible: true,
			array: ['a', 'b', 'c']
		});

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>a</div>
			<div>b</div>
			<div>c</div>

			<div>a</div>
			<div>b</div>
			<div>c</div>
		`
		);
	}
});
