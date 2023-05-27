export default {
	skip: true, // nice-to-have – tricky though, so skipping for now

	test({ component }) {
		component.foo = { x: 2 };
	}
};
