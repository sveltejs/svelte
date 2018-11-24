export default {
	props: {
		items: ['one', 'two', 'three'],
	},

	html: `
		<div>
			<input><p>one</p>
		</div>
		<div>
			<input><p>two</p>
		</div>
		<div>
			<input><p>three</p>
		</div>
	`,

	ssrHtml: `
		<div>
			<input value=one><p>one</p>
		</div>
		<div>
			<input value=two><p>two</p>
		</div>
		<div>
			<input value=three><p>three</p>
		</div>
	`,

	async test({ assert, component, target, window }) {
		const inputs = [...target.querySelectorAll('input')];
		const items = component.items;
		const event = new window.Event('input');

		assert.equal(inputs[0].value, 'one');

		inputs[1].value = 'four';
		await inputs[1].dispatchEvent(event);

		assert.equal(items[1], 'four');
		assert.htmlEqual(target.innerHTML, `
			<div>
				<input><p>one</p>
			</div>
			<div>
				<input><p>four</p>
			</div>
			<div>
				<input><p>three</p>
			</div>
		`);

		items[2] = 'five';

		component.items = items;
		assert.equal(inputs[2].value, 'five');
		assert.htmlEqual(target.innerHTML, `
			<div>
				<input><p>one</p>
			</div>
			<div>
				<input><p>four</p>
			</div>
			<div>
				<input><p>five</p>
			</div>
		`);
	},
};
