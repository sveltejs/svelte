export default {
	async test({ assert, target, window }) {
		const Component = require('./Component.svelte').default;

		const called = [];
		const component = new Component({
			target,
			context: {
				key: 'svelte',
				fn: (value) => called.push(value)
			}
		});
		assert.htmlEqual(target.innerHTML, '<div>svelte</div><button></button>');

		const button = target.querySelector('button');
		await button.dispatchEvent(new window.MouseEvent('click'));

		assert.deepEqual(called, ['hello world']);

		component.$destroy();
	}
};
