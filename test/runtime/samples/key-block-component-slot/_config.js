const logs = [];

export default {
	html: '<button>Reset!</button>',
	props: {
		logs
	},
	async test({ assert, component, target, raf }) {
		assert.deepEqual(logs, ['mount']);

		const button = target.querySelector('button');

		const click = new window.MouseEvent('click');
		await button.dispatchEvent(click);

		assert.deepEqual(logs, ['mount', 'unmount', 'mount']);
	}
};
