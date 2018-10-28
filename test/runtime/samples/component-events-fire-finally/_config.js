export default {
	test(assert, component) {
		const events = [];
		component.on('foo', (shouldThrow) => {
			events.push(shouldThrow);
			if (shouldThrow) {
				throw new Error();
			}
		});
		component.fire('foo', false);
		assert.equal(events.toString(), 'false');
		let threw = false;
		try {
			component.fire('foo', true);
		} catch (err) {
			threw = true;
		}
		assert.equal(threw, true);
		assert.equal(events.toString(), 'false,true');
		component.fire('foo', false);
		assert.equal(events.toString(), 'false,true,false');
	},
};
