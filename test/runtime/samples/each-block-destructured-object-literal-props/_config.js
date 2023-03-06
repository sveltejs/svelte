export default {
	props: {
		objectsArray: [
      { 'foo-bar': 'FooBar', 0: 'zero', prop: 'prop' },
      { 'foo-bar': 'foobar', 0: 'null', prop: 'a prop' },
      { 'foo-bar': 'FOO BAR', 0: 'nada', prop: 'the prop' }
		]
	},

	html: `
		<p>FooBar: prop zero</p>
		<p>foobar: a prop null</p>
		<p>FOO BAR: the prop nada</p>
	`,

	test({ assert, component, target }) {
		component.objectsArray = [{ 'foo-bar': 'Fool Ball', 0: 'nil', prop: 'one prop' }];
		assert.htmlEqual( target.innerHTML, `
			<p>Fool Ball: one prop nil</p>
		`);
	}
};
