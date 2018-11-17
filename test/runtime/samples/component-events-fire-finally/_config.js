export default {
	test(assert, component, target, window) {
		const buttons = target.querySelectorAll('button');
		const click = new window.MouseEvent('click');

		const events = [];
		component.$on('foo', event => {
			const shouldThrow = event.detail;

			events.push(shouldThrow);
			if (shouldThrow) {
				throw new Error();
			}
		});

		buttons[1].dispatchEvent(click);
		assert.equal(events.toString(), 'false');

		let threw = false;
		try {
			buttons[0].dispatchEvent(click);
		} catch (err) {
			threw = true;
		}

		assert.equal(threw, true);
		assert.equal(events.toString(), 'false,true');

		buttons[1].dispatchEvent(click);
		assert.equal(events.toString(), 'false,true,false');
	},
};
