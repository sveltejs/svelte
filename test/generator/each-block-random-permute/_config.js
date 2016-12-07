const VALUES = Array.from( 'abcdefghijklmnopqrstuvwxyz' );

function permute () {
	const values = VALUES.slice();
	const number = Math.floor(Math.random() * VALUES.length);
	const permuted = [];
	for (let i = 0; i < number; i++) {
		permuted.push( ...values.splice( Math.floor( Math.random() * ( number - i ) ), 1 ) );
	}

	return {
		data: permuted,
		expected: permuted.length ? `(${permuted.join(')(')})` : ''
	};
}

let step = permute();

export default {
	data: {
		values: step.data
	},

	html: step.expected,

	test ( assert, component, target ) {
		for (let i = 0; i < 100; i++) {
			step = permute();
			component.set({ values: step.data });
			assert.htmlEqual( target.innerHTML, step.expected );
		}
	}
};
