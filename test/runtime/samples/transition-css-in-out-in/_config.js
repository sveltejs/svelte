export default {
	test({ assert, component, target, window, raf }) {
		component.visible = true;
		const div = target.querySelector('div');
		const startsWith = (v, t = div.style.animation) => {
			if (Array.isArray(v)) {
				t.split(", ").forEach((r,i)=>startsWith(v[i],r))
			} else {
				assert.equal(t.slice(0, -1), v);
			}
		}

		startsWith(`100ms linear 0ms 1 normal both running __svelte_3261048502`);

		raf.tick(50);
		component.visible = false;

		startsWith([`100ms linear 0ms 1 normal both running __svelte_3261048502`, `100ms linear 0ms 1 normal both running __svelte_890840093`]);

		raf.tick(75);
		component.visible = true;

		startsWith(`100ms linear 0ms 1 normal both running __svelte_3261048502`);
	},
};
