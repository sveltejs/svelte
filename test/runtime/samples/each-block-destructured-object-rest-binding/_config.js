export default {
	props: {
		arr: [{p: 'foo', val: 'val1', id: 'id-1'}, {p: 'bar', val: 'val2', id: 'id-2'}]
	},

	html: `
		<input placeholder="foo">
		{"val":"val1","id":"id-1"}
		<br>
		<input placeholder="bar">
		{"val":"val2","id":"id-2"}
		<br>
	`,

	ssrHtml: `
		<input placeholder="foo" value="val1">
		{"val":"val1","id":"id-1"}
		<br>
		<input placeholder="bar" value="val2">
		{"val":"val2","id":"id-2"}
		<br>
	`,

	async test({ assert, component, target, window }) {
		const inputs = target.querySelectorAll('input');

		inputs[0].value = 'val3';
		await inputs[0].dispatchEvent(new window.Event('input'));

		const { arr } = component;

		assert.deepEqual(arr, [
			{p: 'foo', val: 'val3', id: 'id-1'},
			{p: 'bar', val: 'val2', id: 'id-2'}
		]);

		assert.htmlEqual(target.innerHTML, `
			<input placeholder="foo">
			{"val":"val3","id":"id-1"}
			<br>
			<input placeholder="bar">
			{"val":"val2","id":"id-2"}
			<br>
		`);

		inputs[1].value = 'val4';
		await inputs[1].dispatchEvent(new window.Event('input'));

		assert.deepEqual(arr, [
			{p: 'foo', val: 'val3', id: 'id-1'},
			{p: 'bar', val: 'val4', id: 'id-2'}
		]);

		assert.htmlEqual(target.innerHTML, `
			<input placeholder="foo">
			{"val":"val3","id":"id-1"}
			<br>
			<input placeholder="bar">
			{"val":"val4","id":"id-2"}
			<br>
		`);
	}
};
