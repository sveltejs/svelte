export default {
	nestedTransitions: true,

	test ( assert, component, target ) {
		// Would cause "TypeError: Cannot read property 'o' of undefined"
		component.set({ foo: false });
	}
};
