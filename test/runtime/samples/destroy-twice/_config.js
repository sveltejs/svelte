export default {
	test({ assert, component }) {
		component.$destroy();
		component.$destroy();
	}
};