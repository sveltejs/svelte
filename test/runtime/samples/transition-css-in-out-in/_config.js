export default {
	test({ assert, component, target, window, raf }) {
		component.visible = true;
		const div = target.querySelector('div');
		const startsWith = (str) =>
			assert.ok(div.style.animation.startsWith(str) && div.style.animation.length === str.length + 1);

		startsWith(`100ms linear 0ms 1 normal both running __svelte_3730643286`);

		raf.tick(50);
		component.visible = false;
		startsWith(`100ms linear 0ms 1 normal both running __svelte_3301188069`);

		raf.tick(75);
		component.visible = true;

		// reset original styles
		startsWith(`100ms linear 0ms 1 normal both running __svelte_3730643286`);
	},
};
