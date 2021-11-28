export default {
	test({ assert, component, target, raf }) {
		component.visible = true;
		const h1 = target.querySelector('h1');

		assert.equal(h1.style.animation, '__svelte_3809512021_0 100ms linear 0ms 1 both');

		raf.tick(50);
		component.tag = 'h2';
		const h2 = target.querySelector('h2');
		assert.equal(h1.style.animation, '__svelte_3809512021_0 100ms linear 0ms 1 both');
		assert.equal(h2.style.animation, '__svelte_3809512021_0 100ms linear 0ms 1 both');
	}
};
