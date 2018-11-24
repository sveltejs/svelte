export default {
	test({ assert, component, target }) {
		// Would cause "TypeError: Cannot read property 'o' of undefined"
		component.foo = false;
	}
};
