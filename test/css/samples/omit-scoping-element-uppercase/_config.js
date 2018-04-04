export default {
	cascade: false,

	warnings: [{
		message: 'P component is not defined',
		loc: {
			line: 2,
			column: 1
		},
		end: {
			line: 2,
			column: 22
		},
		pos: 7,
		frame: `
			1: <div>
			2:   <P>this is styled</P>
			     ^
			3: </div>
			4:`
	}]
};