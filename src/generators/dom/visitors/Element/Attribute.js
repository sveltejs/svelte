import attributeLookup from './lookup.js';
import deindent from '../../../../utils/deindent.js';
import getStaticAttributeValue from './getStaticAttributeValue.js';

export default function visitAttribute ( generator, block, state, node, attribute ) {
	const name = attribute.name;

	let metadata = state.namespace ? null : attributeLookup[ name ];
	if ( metadata && metadata.appliesTo && !~metadata.appliesTo.indexOf( node.name ) ) metadata = null;

	const isIndirectlyBoundValue = name === 'value' && (
		node.name === 'option' || // TODO check it's actually bound
		node.name === 'input' && /^(checkbox|radio)$/.test( getStaticAttributeValue( node, 'type' ) )
	);

	const propertyName = isIndirectlyBoundValue ? '__value' : metadata && metadata.propertyName;

	// xlink is a special case... we could maybe extend this to generic
	// namespaced attributes but I'm not sure that's applicable in
	// HTML5?
	const method = name.slice( 0, 6 ) === 'xlink:' ? 'setXlinkAttribute' : 'setAttribute';

	const isDynamic = attribute.value !== true && attribute.value.length > 1 || ( attribute.value.length === 1 && attribute.value[0].type !== 'Text' );

	if ( isDynamic ) {
		let value;

		if ( attribute.value.length === 1 ) {
			// single {{tag}} — may be a non-string
			const { snippet } = generator.contextualise( block, attribute.value[0].expression );
			value = snippet;
		} else {
			// '{{foo}} {{bar}}' — treat as string concatenation
			value = ( attribute.value[0].type === 'Text' ? '' : `"" + ` ) + (
				attribute.value.map( chunk => {
					if ( chunk.type === 'Text' ) {
						return JSON.stringify( chunk.data );
					} else {
						const { snippet } = generator.contextualise( block, chunk.expression );
						return `( ${snippet} )`;
					}
				}).join( ' + ' )
			);
		}

		const last = `last_${state.parentNode}_${name.replace( /-/g, '_')}`;
		block.builders.create.addLine( `var ${last} = ${value};` );

		const updater = propertyName ?
			`${state.parentNode}.${propertyName} = ${last};` :
			`${generator.helper( method )}( ${state.parentNode}, '${name}', ${last} );`;

		block.builders.create.addLine( updater );
		block.builders.update.addBlock( deindent`
			if ( ( ${block.tmp()} = ${value} ) !== ${last} ) {
				${last} = ${block.tmp()};
				${updater}
			}
		` );
	}

	else {
		const value = attribute.value === true ? 'true' :
		              attribute.value.length === 0 ? `''` :
		              JSON.stringify( attribute.value[0].data );

		const statement = propertyName ?
			`${state.parentNode}.${propertyName} = ${value};` :
			`${generator.helper( method )}( ${state.parentNode}, '${name}', ${value} );`;


		block.builders.create.addLine( statement );

		// special case – autofocus. has to be handled in a bit of a weird way
		if ( attribute.value === true && name === 'autofocus' ) {
			block.autofocus = state.parentNode;
		}

		// special case — xmlns
		if ( name === 'xmlns' ) {
			// TODO this attribute must be static – enforce at compile time
			state.namespace = attribute.value[0].data;
		}
	}

	if ( isIndirectlyBoundValue ) {
		const updateValue = `${state.parentNode}.value = ${state.parentNode}.__value;`;

		block.builders.create.addLine( updateValue );
		if ( isDynamic ) block.builders.update.addLine( updateValue );
	}
}