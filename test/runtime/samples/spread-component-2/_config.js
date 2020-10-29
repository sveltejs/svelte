export default {
	props: {
		list: [{
			foo: 'lol',
			baz: 40 + 2,
			qux: 5,
			quux: 'core'
		}, {
			foo: 'lolzz',
			baz: 50 + 2,
			qux: 1,
			quux: 'quuxx'
		}]
	},

	html: `
		<div>
			<p>foo: lol</p>
			<p>baz: 42 (number)</p>
			<p>qux: 0</p>
			<p>quux: core</p>
			<p>selected: true</p>
			<p>foo: lolzz</p>
			<p>baz: 52 (number)</p>
			<p>qux: 0</p>
			<p>quux: quuxx</p>
			<p>selected: false</p>
		</div>
	`,

	test({ assert, component, target }) {
		component.list = [{
			foo: 'lol',
			baz: 40 + 3,
			qux: 8,
			quux: 'heart'
		}, {
			foo: 'lolzz',
			baz: 50 + 3,
			qux: 8,
			quux: 'heartxx'
		}];

		assert.htmlEqual(target.innerHTML, `
			<div>
				<p>foo: lol</p>
				<p>baz: 43 (number)</p>
				<p>qux: 0</p>
				<p>quux: heart</p>
				<p>selected: true</p>
				<p>foo: lolzz</p>
				<p>baz: 53 (number)</p>
				<p>qux: 0</p>
				<p>quux: heartxx</p>
				<p>selected: false</p>
			</div>
		`);

		component.qux = 1;

		assert.htmlEqual(target.innerHTML, `
			<div>
				<p>foo: lol</p>
				<p>baz: 43 (number)</p>
				<p>qux: 1</p>
				<p>quux: heart</p>
				<p>selected: false</p>
				<p>foo: lolzz</p>
				<p>baz: 53 (number)</p>
				<p>qux: 1</p>
				<p>quux: heartxx</p>
				<p>selected: true</p>
			</div>
		`);
	}
};
