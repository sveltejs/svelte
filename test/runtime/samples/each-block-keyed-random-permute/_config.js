const VALUES = Array.from( 'abcdefghijklmnopqrstuvwxyz' );

function toObjects ( array ) {
	return array.split( '' ).map( x => ({ id: x }) );
}

function permute () {
	const values = VALUES.slice();
	const number = Math.floor(Math.random() * VALUES.length);
	const permuted = [];
	for (let i = 0; i < number; i++) {
		permuted.push( ...values.splice( Math.floor( Math.random() * ( number - i ) ), 1 ) );
	}

	return permuted.join( '' );
}

export default {
	data: {
		values: toObjects( 'abc' )
	},

	html: `(a)(b)(c)`,

	test ( assert, component, target ) {
		function test ( sequence ) {
			component.set({ values: toObjects( sequence ) });
			assert.htmlEqual( target.innerHTML, sequence.split( '' ).map( x => `(${x})` ).join( '' ) );
		}

		// first, some fixed tests so that we can debug them
		test( 'abc' );
		test( 'abcd' );
		test( 'abecd' );
		test( 'fabecd' );
		test( 'fabed' );
		test( 'beadf' );
		test( 'ghbeadf' );
		test( 'gf' );
		test( 'gc' );
		test( 'g' );
		test( '' );
		test( 'abc' );
		test( 'duqbmineapjhtlofrskcg' );
		test( 'hdnkjougmrvftewsqpailcb' );

		// then, we party
		for ( let i = 0; i < 100; i += 1 ) test( permute() );
	}
};
