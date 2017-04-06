export default class Fragment {
	constructor ( options ) {
		Object.assign( this, options );
	}

	child ( options ) {
		return new Fragment( Object.assign( {}, this, options, { parent: this } ) );
	}
}