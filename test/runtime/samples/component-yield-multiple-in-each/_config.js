export default {
	html: `
		<p><slot>Hello Alice</slot></p>
		<p><slot>Hello Bob</slot></p>
		<p><slot>Hello Charles</slot></p>
	`,

	test ( assert, component, target ) {
		component.set({
			people: [ 'Alice', 'Charles', 'Bob' ]
		});

		assert.htmlEqual( target.innerHTML, `
			<p><slot>Hello Alice</slot></p>
			<p><slot>Hello Charles</slot></p>
			<p><slot>Hello Bob</slot></p>
		`);
	}
};
