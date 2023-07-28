export default {
	skip_if_ssr: true,
	skip_if_hydrate: true,
	skip_if_hydrate_from_ssr: true,
	test({ assert, component, target, raf }) {
		component.$destroy(true);

		return Promise.resolve().then(() => {
			const div = target.querySelector('div');

			raf.tick(50);
			assert.equal(div.transitioned, 0.5);
		});
	}
};
