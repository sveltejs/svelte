export default {
	data: {
		name: 'world'
	},

	snapshot(target) {
		return {
			input: target.querySelector('input'),
			p: target.querySelector('p')
		};
	},

	test(assert, target, snapshot, component, window) {
		const input = target.querySelector('input');
		const p = target.querySelector('p');

		assert.equal(input, snapshot.input);
		assert.equal(p, snapshot.p);

		input.value = 'everybody';
		input.dispatchEvent(new window.Event('input'));

		assert.equal(component.get('name'), 'everybody');
		assert.htmlEqual(target.innerHTML, `
			<input>
			<p>Hello everybody!</p>
		`);
	}
};