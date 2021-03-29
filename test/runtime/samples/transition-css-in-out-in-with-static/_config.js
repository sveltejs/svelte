export default {
	test({ assert, component, target, window, raf }) {
		component.visible = true;
		const div = target.querySelector('div');

		assert.equal(div.className, '__svelte_2375698960');
		assert.equal(div.style.animation, '__svelte_3809512021_0 100ms linear 0ms 1 both');

		raf.tick(50);
		component.visible = false;

		// both in and out styles
		assert.equal(div.className, '__svelte_2375698960 __svelte_1786671888');
		assert.equal(div.style.animation, '__svelte_3809512021_0 100ms linear 0ms 1 both, __svelte_3750847757_0 100ms linear 0ms 1 both');

		raf.tick(75);
		component.visible = true;

		// reset to in styles (in transition in progress)
		assert.equal(div.style.animation, '__svelte_3809512021_1 100ms linear 0ms 1 both');
		assert.equal(div.className, '__svelte_2375698960');

		// 100ms after in transition started at 75
		raf.tick(175);

		// reset original styles after in transition is complete
		assert.equal(div.style.animation, '');
		assert.equal(div.className, '');
	}
};
