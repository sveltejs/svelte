export default {
	html: `
		<button>racoon</button>
		<button>eagle</button>
	`,

	test(assert, component, target) {
		assert.htmlEqual(target.innerHTML,`
			<button>racoon</button>
			<button>eagle</button>
		`);

		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		button.dispatchEvent(event);
		assert.equal(component.get('clicked'), 'racoon');
	},
};
