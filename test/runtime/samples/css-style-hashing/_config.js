export default {
	test({ assert, component, target, window }) {
		const [component_one_red] = target.querySelectorAll('.component-1');
		const [component_two_red, component_two_yellow] = target.querySelectorAll('.component-2');

		assert.equal(window.getComputedStyle(component_one_red).background, 'red');
		assert.equal(window.getComputedStyle(component_two_red).background, 'red');
		assert.equal(window.getComputedStyle(component_two_yellow).background, 'yellow');
	}
};
