export function test ( assert, code, map, smc, locator ) {
	console.log( `code`, code )
	console.log( `map`, map )

	let loc = locator( 'foo.bar.baz' );
	console.log( `loc`, loc )
}
