export default {
	description: 'nested {{#each}} blocks',
	data: {
		columns: [ 'a', 'b', 'c' ],
		rows: [ 1, 2, 3 ]
	},
	html: `<div>a, 1</div><div>a, 2</div><div>a, 3</div><!--#each rows--><div>b, 1</div><div>b, 2</div><div>b, 3</div><!--#each rows--><div>c, 1</div><div>c, 2</div><div>c, 3</div><!--#each rows--><!--#each columns-->`,
	test ( component, target ) {
		// TODO
	}
};
