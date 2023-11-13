import { test } from '../../test';

export default test({
	html: `
		<div>x: 1, list_two_a: 2, list_two_b: 5, y: 4, m: 1, n: 2, o: 5, p: 3, q: 4</div>
		<div>[1,{"a":2},[3,{}]]</div>
		<br><div>x: 1, list_two_a: 2, list_two_b: 5, y: 4, m: m, n: n, o: o, p: p, q: q</div>
		<div>[1,{"a":2},[3,{}]]</div>
	`,

	async test({ component, assert, target }) {
		await component.update();
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>x: 1, list_two_a: 2, list_two_b: 5, y: 4, m: 1, n: 2, o: 5, p: 3, q: 4</div>
			<div>[1,{"a":2},[3,{}]]</div>
			<br><div>x: 1, list_two_a: 2, list_two_b: 5, y: 4, m: MM, n: NN, o: OO, p: PP, q: QQ</div>
			<div>[1,{"a":2},[3,{}]]</div>
		`
		);
	}
});
