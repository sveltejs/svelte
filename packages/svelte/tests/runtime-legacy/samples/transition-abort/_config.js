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

		raf.tick(25);
		assert.htmlEqual(
			target.innerHTML,
			`
			<div style="opacity: 0.75;">a</div>
			<div style="opacity: 0.75;">a</div>
		`
		);

		// abort 1/4 through the outro transition
		await component.$set({
			visible: true,
			array: ['a', 'b', 'c']
		});

		raf.tick(50);
		assert.htmlEqual(
			target.innerHTML,
			// because outro is aborted it will be finished earlier with the intro than the new items
			`
			<div style="">a</div>
			<div style="opacity: 0.25;">b</div>
			<div style="opacity: 0.25;">c</div>

			<div style="">a</div>
			<div style="opacity: 0.25;">b</div>
			<div style="opacity: 0.25;">c</div>
		`
		);

		// intros of new items almost finished, aborted outro shouldn't overlap re-intro
		raf.tick(75);
		assert.htmlEqual(
			target.innerHTML,
			`
			<div style="">a</div>
			<div style="opacity: 0.5;">b</div>
			<div style="opacity: 0.5;">c</div>

			<div style="">a</div>
			<div style="opacity: 0.5;">b</div>
			<div style="opacity: 0.5;">c</div>
		`
		);
	}
});
