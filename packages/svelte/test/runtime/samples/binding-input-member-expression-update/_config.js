// binding member expression shouldn't invalidate the property name
export default {
	async test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		assert.deepEqual(component.logs.length, 1);
		assert.equal(input.value, 'abc');

		input.value = 'hij';
		await input.dispatchEvent(new window.Event('input'));

		assert.deepEqual(component.values.a, 'hij');
		assert.deepEqual(component.logs.length, 1);

		component.paths = ['b'];
		assert.deepEqual(component.logs.length, 2);
		assert.equal(input.value, 'def');
	}
};
