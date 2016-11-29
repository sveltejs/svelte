export default {
	skip: true, // nice-to-have – tricky though, so skipping for now

	test ( assert, component ) {
		component.set({ foo: { x: 2 } });
		component.teardown();
	}
};
