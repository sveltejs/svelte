export default {
	props: {
		show: true
	},

	html: `
		<button>Hide</button>
	`,

	test(assert, component, target, window) {
		const click = new window.MouseEvent('click');

		target.querySelector('button').dispatchEvent(click);

		assert.equal(component.show, false);
		assert.htmlEqual(target.innerHTML, `
			<button>Show</button>
		`);

		target.querySelector('button').dispatchEvent(click);

		assert.equal(component.show, true);
		assert.htmlEqual(target.innerHTML, `
			<button>Hide</button>
		`);
	}
};
