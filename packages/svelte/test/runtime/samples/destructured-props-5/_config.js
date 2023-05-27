export default {
	html: `
		<div>x: 1, list_two_a: 4, list_two_b: 5, y: 3, l: 1, m: 2, n: 4, o: 5, p: 5, q: 6, r: 7, s: 1</div>
		<div>[1,2,3,{"a":4},[5,{},{},8]]</div>
		<br><div>x: 1, list_two_a: 4, list_two_b: 5, y: 3, l: l, m: m, n: n, o: o, p: p, q: q, r: r, s: s</div>
		<div>[1,2,3,{"a":4},[5,{},{},8]]</div>
	`,

	async test({ component, assert, target }) {
		await component.update();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>x: 1, list_two_a: 4, list_two_b: 5, y: 3, l: 1, m: 2, n: 4, o: 5, p: 5, q: 6, r: 7, s: 1</div>
			<div>[1,2,3,{"a":4},[5,{},{},8]]</div>
			<br><div>x: 1, list_two_a: 4, list_two_b: 5, y: 3, l: LL, m: MM, n: NN, o: OO, p: PP, q: QQ, r: RR, s: SS</div>
			<div>[1,2,3,{"a":4},[5,{},{},8]]</div>
		`
		);
	}
};
