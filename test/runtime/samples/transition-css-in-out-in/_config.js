export default {
	test({ assert, component, target, window, raf }) {
		component.visible = true;
		const div = target.querySelector('div');
		const startsWith = (str) =>
			assert.equal(div.style.animation.slice(0, div.style.animation.length-1), str);

		startsWith(`100ms linear 0ms 1 normal both running __svelte_3261048502`);

		raf.tick(50);
		component.visible = false;

		startsWith(`100ms linear 0ms 1 normal both running __svelte_890840093`);

		raf.tick(75);
		component.visible = true;

		startsWith(`100ms linear 0ms 1 normal both running __svelte_3261048502`);
	},
};
