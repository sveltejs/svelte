import Component from './Component.js';
import voidElementNames from '../../../utils/voidElementNames.js';

export default {
	enter ( generator, node ) {
		if ( node.name in generator.components ) {
			Component.enter( generator, node );
			return;
		}

		let openingTag = `<${node.name}`;

		node.attributes.forEach( attribute => {
			if ( attribute.type !== 'Attribute' ) return;

			let str = ` ${attribute.name}`;

			if ( attribute.value !== true ) {
				str += `="` + attribute.value.map( chunk => {
					if ( chunk.type === 'Text' ) {
						return chunk.data;
					}

					const { snippet } = generator.contextualise( chunk.expression );
					return '${' + snippet + '}';
				}).join( '' ) + `"`;
			}

			openingTag += str;
		});

		if ( generator.cssId && !generator.elementDepth ) {
			openingTag += ` ${generator.cssId}`;
		}

		openingTag += '>';

		generator.append( openingTag );
	},

	leave ( generator, node ) {
		if ( node.name in generator.components ) {
			Component.leave( generator, node );
			return;
		}

		if ( !voidElementNames.test( node.name ) ) {
			generator.append( `</${node.name}>` );
		}
	}
};
