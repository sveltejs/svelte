import { Node } from '../../../../interfaces';

export default function getStaticAttributeValue ( node: Node, name: string ) {
	const attribute = node.attributes.find( ( attr: Node ) => attr.name.toLowerCase() === name );
	if ( !attribute ) return null;

	if ( attribute.value.length !== 1 || attribute.value[0].type !== 'Text' ) {
		// TODO catch this in validation phase, give a more useful error (with location etc)
		throw new Error( `'${name} must be a static attribute` );
	}

	return attribute.value[0].data;
}