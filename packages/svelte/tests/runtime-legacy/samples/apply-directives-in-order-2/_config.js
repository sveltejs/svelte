import { test } from '../../test';

/** @type {string[]} */
let value = [];

export default test({
	get props() {
		value = [];
		return { value };
	},

	async test({ assert, target, window }) {
		const inputs = target.querySelectorAll('input');

		const event = new window.Event('input');

		for (const input of inputs) {
			input.value = 'h';
			await input.dispatchEvent(event);
		}

		// Svelte 5 breaking change, use:action now fires
		// in effect phase. So they will occur AFTER the others.
		assert.deepEqual(value, [
			'2',
			'3',
			'1',
			'5',
			'6',
			'4',
			'7',
			'9',
			'8',
			'10',
			'11',
			'12',
			'13',
			'14',
			'15',
			'16',
			'18',
			'17'
		]);

		// Previously
		// assert.deepEqual(value, [
		// '1',
		// '2',
		// '3',
		// '4',
		// '5',
		// '6',
		// '7',
		// '8',
		// '9',
		// '10',
		// '11',
		// '12',
		// '13',
		// '14',
		// '15',
		// '16',
		// '17',
		// '18',
		// ]);
	}
});
