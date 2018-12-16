export default {
	props: {
		a: 'foo',
		b: true,
		c: [ 1, 2, 3 ],
	},

	html: `
		<span>foo</span>
		<span class="foo"></span>
		<span>true</span>
		<span>1</span>
		<span>2</span>
		<span>3</span>
	`
};
