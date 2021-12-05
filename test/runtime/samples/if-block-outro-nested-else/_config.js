export default {
	test({ component }) {
		// Would cause "TypeError: Cannot read property 'o' of undefined"
		component.foo = false;
	}
};
