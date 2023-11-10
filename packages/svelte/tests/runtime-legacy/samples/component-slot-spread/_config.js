import { test } from '../../test';

export default test({
	get props() {
		return {
			/** @type {Record<string, number>} */
			obj: { a: 1, b: 42 },
			c: 5,
			d: 10
		};
	},
	html: `
		<p>1</p>
		<p>42</p>
		<p>5</p>
		<p>10</p>
	`,

	test({ assert, target, component }) {
		component.obj = { a: 2, b: 50, c: 30 };
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>2</p>
			<p>50</p>
			<p>30</p>
			<p>10</p>
		`
		);

		component.c = 22;
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>2</p>
			<p>50</p>
			<p>30</p>
			<p>10</p>
		`
		);

		component.d = 44;
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>2</p>
			<p>50</p>
			<p>30</p>
			<p>44</p>
		`
		);

		component.obj = { a: 9, b: 12 };
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>9</p>
			<p>12</p>
			<p>22</p>
			<p>44</p>
		`
		);

		component.c = 88;
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>9</p>
			<p>12</p>
			<p>88</p>
			<p>44</p>
		`
		);
	}
});
