export default {
	props: {
		columns: [ 'a', 'b', 'c' ],
		rows: [ 1, 2, 3 ]
	},

	html: `<div>a, 1</div><div>a, 2</div><div>a, 3</div><!----><div>b, 1</div><div>b, 2</div><div>b, 3</div><!----><div>c, 1</div><div>c, 2</div><div>c, 3</div><!----><!---->`,

	test({ assert, component, target }) {
		// TODO
	}
};
