export default {
	data: {
		clicked: false
	},

	snapshot(target) {
		const button = target.querySelector('button');

		return {
			button
		};
	},

	test(assert, target, snapshot, component, window) {
		const button = target.querySelector('button');
		assert.equal(button, snapshot.button);

		button.dispatchEvent(new window.MouseEvent('click'));

		assert.ok(component.get('clicked'));
		assert.htmlEqual(target.innerHTML, `
			<button>click me</button>
			<p>clicked!</p>
		`);
	}
};