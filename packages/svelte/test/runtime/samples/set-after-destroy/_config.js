export default {
	get props() {
		return { x: 1 };
	},

	test({ component }) {
		component.$destroy();
		component.x = 2;
	}
};
