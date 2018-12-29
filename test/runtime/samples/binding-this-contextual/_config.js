export default {
	props: {
		items: ['a', 'b', 'c']
	},

	html: `
		<div>a</div>
		<div>b</div>
		<div>c</div>
	`,

	test({ assert, component, target }) {
		let nodes = [...target.querySelectorAll('div')];
		assert.deepEqual(component.nodes, nodes);

		console.group('setting b, c, d, e');
		component.items = ['b', 'c', 'd', 'e'];
		console.groupEnd();

		assert.htmlEqual(target.innerHTML, `
			<div>b</div>
			<div>c</div>
			<div>d</div>
			<div>e</div>
		`);

		nodes = [...target.querySelectorAll('div')];
		assert.deepEqual(component.nodes, nodes);

		console.group('setting c, d');
		component.items = ['c', 'd'];
		console.groupEnd();

		assert.htmlEqual(target.innerHTML, `
			<div>c</div>
			<div>d</div>
		`);

		nodes = [...target.querySelectorAll('div')];
		assert.deepEqual(component.nodes, [...nodes, null, null]);
	}
};
