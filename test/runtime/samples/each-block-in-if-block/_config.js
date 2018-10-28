export default {
	data: {
		dummy: false,
		fruits: ['Apple', 'Banana', 'Tomato'],
	},

	html: '<div><div>Apple</div><div>Banana</div><div>Tomato</div></div>',

	test ( assert, component, target ) {
		component.set({ dummy: true });
		assert.htmlEqual(target.innerHTML, '<div><div>Apple</div><div>Banana</div><div>Tomato</div></div>' );
	}
};
