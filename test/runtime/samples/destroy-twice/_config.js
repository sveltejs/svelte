export default {
	test({ component }) {
		component.$destroy();
		component.$destroy();
	}
};
