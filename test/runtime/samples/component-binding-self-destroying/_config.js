export default {
	solo: true,

	data: {
		show: true
	},

	html: `
		<button>Hide</button>
	`,

	test(assert, component, target, window) {
		const click = new window.MouseEvent('click');

		target.querySelector('button').dispatchEvent(click);

		assert.equal(component.get('show'), false);
		assert.htmlEqual(target.innerHTML, `
			<button>Show</button>
		`);

		target.querySelector('button').dispatchEvent(click);

		assert.equal(component.get('show'), true);
		assert.htmlEqual(target.innerHTML, `
			<button>Hide</button>
		`);
	}
};
