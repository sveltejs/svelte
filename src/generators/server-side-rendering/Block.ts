import deindent from '../../utils/deindent.js';
import flattenReference from '../../utils/flattenReference';
import { SsrGenerator } from './index';
import { Node } from '../../interfaces';

interface BlockOptions {
	// TODO
}

export default class Block {
	generator: SsrGenerator;
	conditions: string[];

	contexts: Map<string, string>;
	indexes: Map<string, string>;
	contextDependencies: Map<string, string[]>;

	constructor ( options: BlockOptions ) {
		Object.assign( this, options );
	}

	addBinding ( binding: Node, name: string ) {
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

	child ( options: BlockOptions ) {
		return new Block( Object.assign( {}, this, options, { parent: this } ) );
	}

	contextualise ( expression: Node, context?: string, isEventHandler?: boolean ) {
		return this.generator.contextualise( this, expression, context, isEventHandler );
	}
}