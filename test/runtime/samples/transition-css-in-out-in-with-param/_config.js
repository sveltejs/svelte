export default {
	test({ assert, component, target, raf }) {
		component.visible = true;
		const div = target.querySelector('div');

		// animation duration of `in` should be 10ms.
		assert.equal(div.style.animation, '__svelte_1670736059_0 10ms linear 0ms 1 both');

		// animation duration of `out` should be 5ms.
		component.visible = false;
		assert.equal(div.style.animation, '__svelte_1670736059_0 10ms linear 0ms 1 both, __svelte_1998461463_0 5ms linear 0ms 1 both');

		// change param
		raf.tick(1);
		component.param = true;
		component.visible = true;

		// animation duration of `in` should be 20ms.
		assert.equal(div.style.animation, '__svelte_722598827_0 20ms linear 0ms 1 both');
	}
};
