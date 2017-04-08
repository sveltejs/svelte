import visitComponent from './Component.js';
import isVoidElementName from '../../../utils/isVoidElementName.js';
import visit from '../visit.js';
import visitWindow from './meta/Window.js';

const meta = {
	':Window': visitWindow
};

export default function visitElement ( generator, fragment, node ) {
	if ( node.name in meta ) {
		return meta[ node.name ]( generator, fragment, node );
	}

	if ( generator.components.has( node.name ) || node.name === ':Self' ) {
		visitComponent( generator, fragment, node );
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

				const { snippet } = generator.contextualise( fragment, chunk.expression );
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

	generator.elementDepth += 1;

	node.children.forEach( child => {
		visit( generator, fragment, child );
	});

	generator.elementDepth -= 1;

	if ( !isVoidElementName( node.name ) ) {
		generator.append( `</${node.name}>` );
	}
}