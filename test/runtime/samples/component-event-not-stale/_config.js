export default {
	data: {
		value: 1,
	},

	test(assert, component, target, window) {
		const buttons = target.querySelectorAll('button');
		const click = new window.MouseEvent('click');

		const events = [];
		component.on('value', event => {
			events.push(event);
		});

		buttons[0].dispatchEvent(click);
		buttons[1].dispatchEvent(click);

		component.set({ value: 2 });

		buttons[0].dispatchEvent(click);
		buttons[1].dispatchEvent(click);

		assert.deepEqual(events, [
			{ value: 1 },
			{ value: 1 },
			{ value: 2 },
			{ value: 2 }
		]);
	},
};
