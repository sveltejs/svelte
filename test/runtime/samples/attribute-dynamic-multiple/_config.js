export default {
	props: {
		items: [
			{ foo: true,  bar: false },
			{ foo: false, bar: true  },
			{ foo: true,  bar: true  }
		]
	},

	html: `
		<div class="foo ">1</div>
		<div class=" bar">2</div>
		<div class="foo bar">3</div>
	`
};
