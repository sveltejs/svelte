export default {
	html: `<div>bind</div>`,

	async test({ assert, component, target }) {
		assert.equal(component.ref, target.querySelector('div'));
		assert.equal(component.hooks[0], 'Before');
		assert.equal(component.hooks.pop(), 'After');

		while (component.hooks.length) component.hooks.pop();

		component.bind = false;
		assert.equal(component.ref, null);
		assert.equal(component.hooks[0], 'Before');
		assert.equal(component.hooks.pop(), 'After');

		while (component.hooks.length) component.hooks.pop();

		component.bind = true;
		assert.equal(component.ref, target.querySelector('div'));
		assert.equal(component.hooks[0], 'Before');
		assert.equal(component.hooks.pop(), 'After');
	}
};
