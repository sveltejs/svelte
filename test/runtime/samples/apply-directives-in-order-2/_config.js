const value = [];
export default {
	props: {
		value
	},

	async test({ assert, target, window }) {
		const inputs = target.querySelectorAll('input');

		const event = new window.Event('input');

		for (const input of inputs) {
			input.value = 'h';
			await input.dispatchEvent(event);
		}

		assert.deepEqual(value, [
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
			'9',
			'10',
			'11',
			'12',
			'13',
			'14',
			'15',
			'16',
			'17',
			'18'
		]);
	}
};
