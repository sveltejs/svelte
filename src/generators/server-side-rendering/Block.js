import deindent from '../../utils/deindent.js';
import flattenReference from '../../utils/flattenReference.js';

export default class Block {
	constructor ( options ) {
		Object.assign( this, options );
	}

	addBinding ( binding, name ) {
		const conditions = [ `!( '${binding.name}' in root )`].concat( // TODO handle contextual bindings...
			this.conditions.map( c => `(${c})` )
		);

		const { keypath } = flattenReference( binding.value );

		this.generator.bindings.push( deindent`
			if ( ${conditions.join( '&&' )} ) {
				tmp = ${name}.data();
				if ( '${keypath}' in tmp ) {
					root.${binding.name} = tmp.${keypath};
					settled = false;
				}
			}
		` );
	}

	child ( options ) {
		return new Block( Object.assign( {}, this, options, { parent: this } ) );
	}
}