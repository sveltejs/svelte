import visitComponent from './Component';
import isVoidElementName from '../../../utils/isVoidElementName';
import visit from '../visit';
import visitWindow from './meta/Window';
import { SsrGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';

const meta = {
	':Window': visitWindow
};

export default function visitElement ( generator: SsrGenerator, block: Block, node: Node ) {
	if ( node.name in meta ) {
		return meta[ node.name ]( generator, block, node );
	}

	if ( generator.components.has( node.name ) || node.name === ':Self' ) {
		visitComponent( generator, block, node );
		return;
	}

	let openingTag = `<${node.name}`;

	node.attributes.forEach( ( attribute: Node ) => {
		if ( attribute.type !== 'Attribute' ) return;

		let str = ` ${attribute.name}`;

		if ( attribute.value !== true ) {
			str += `="` + attribute.value.map( ( chunk: Node ) => {
				if ( chunk.type === 'Text' ) {
					return chunk.data;
				}

				const { snippet } = block.contextualise( chunk.expression );
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

	node.children.forEach( ( child: Node ) => {
		visit( generator, block, child );
	});

	generator.elementDepth -= 1;

	if ( !isVoidElementName( node.name ) ) {
		generator.append( `</${node.name}>` );
	}
}