import deindent from '../../utils/deindent.js';
import flattenReference from '../../utils/flattenReference';

export default class Block {
	constructor ( options ) {
		Object.assign( this, options );
	}

	addBinding ( binding, name ) {
		const conditions = [ `!( '${binding.name}' in state )`].concat( // TODO handle contextual bindings...
			this.conditions.map( c => `(${c})` )
		);

		const { keypath } = flattenReference( binding.value );

		this.generator.bindings.push( deindent`
			if ( ${conditions.join( '&&' )} ) {
				tmp = ${name}.data();
				if ( '${keypath}' in tmp ) {
					state.${binding.name} = tmp.${keypath};
					settled = false;
				}
			}
		` );
	}

	child ( options ) {
		return new Block( Object.assign( {}, this, options, { parent: this } ) );
	}

	contextualise ( expression, context, isEventHandler ) {
		return this.generator.contextualise( this, expression, context, isEventHandler );
	}
}