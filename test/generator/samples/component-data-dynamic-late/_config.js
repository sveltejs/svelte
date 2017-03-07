export default {
	test ( assert, component, target ) {
		component.set({ q: 42 });
		component.set({ foo: true });

		assert.htmlEqual( target.innerHTML, `
			<p>42</p>
		` );
	}
};
