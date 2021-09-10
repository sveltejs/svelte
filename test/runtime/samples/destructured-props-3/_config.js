export default {
	html: `
		<div>i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, a: 9, b: 10, c: 11, d: 12, e: 13, f: 14</div>
		<br>
		<div>i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, a: a, b: 10, c: c, d: d, e: 13, f: f</div>
	`,
	async test({ component, target, assert }) {
		await component.update();
		assert.htmlEqual(target.innerHTML, `
			<div>i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, a: 9, b: 10, c: 11, d: 12, e: 13, f: 14</div>
			<br>
			<div>i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, a: aa, b: 10, c: cc, d: dd, e: 13, f: ff</div>
		`);
	}
};
