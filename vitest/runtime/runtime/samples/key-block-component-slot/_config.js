const logs = [];

export default {
	html: '<button>Reset!</button>',
	get props() {
	return { logs };
},
	async test({ assert, target }) {
		assert.deepEqual(logs, ['mount']);

		const button = target.querySelector('button');

		const click = new window.MouseEvent('click');
		await button.dispatchEvent(click);

		assert.deepEqual(logs, ['mount', 'unmount', 'mount']);
	}
};
