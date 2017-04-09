import attributeLookup from './lookup.js';
import deindent from '../../../../utils/deindent.js';
import getStaticAttributeValue from './getStaticAttributeValue.js';

export default function visitAttribute ( generator, block, state, node, attribute ) {
	const name = attribute.name;

	let metadata = state.namespace ? null : attributeLookup[ name ];
	if ( metadata && metadata.appliesTo && !~metadata.appliesTo.indexOf( node.name ) ) metadata = null;

	let dynamic = false;

	const isIndirectlyBoundValue = name === 'value' && (
		node.name === 'option' || // TODO check it's actually bound
		node.name === 'input' && /^(checkbox|radio)$/.test( getStaticAttributeValue( node, 'type' ) )
	);

	const propertyName = isIndirectlyBoundValue ? '__value' : metadata && metadata.propertyName;

	// xlink is a special case... we could maybe extend this to generic
	// namespaced attributes but I'm not sure that's applicable in
	// HTML5?
	const method = name.slice( 0, 6 ) === 'xlink:' ? 'setXlinkAttribute' : 'setAttribute';

	// attributes without values, e.g. <textarea readonly>
	if ( attribute.value === true ) {
		if ( propertyName ) {
			block.builders.create.addLine(
				`${state.parentNode}.${propertyName} = true;`
			);
		} else {
			block.builders.create.addLine(
				`${generator.helper( method )}( ${state.parentNode}, '${name}', true );`
			);
		}

		// special case – autofocus. has to be handled in a bit of a weird way
		if ( name === 'autofocus' ) {
			block.autofocus = state.parentNode;
		}
	}

	// empty string
	else if ( attribute.value.length === 0 ) {
		if ( propertyName ) {
			block.builders.create.addLine(
				`${state.parentNode}.${propertyName} = '';`
			);
		} else {
			block.builders.create.addLine(
				`${generator.helper( method )}( ${state.parentNode}, '${name}', '' );`
			);
		}
	}

	// static text or a single {{tag}}
	else if ( attribute.value.length === 1 ) {
		const value = attribute.value[0];

		if ( value.type === 'Text' ) {
			// static attributes
			const result = JSON.stringify( value.data );

			if ( propertyName ) {
				block.builders.create.addLine(
					`${state.parentNode}.${propertyName} = ${result};`
				);
			} else {
				if ( name === 'xmlns' ) {
					// special case
					// TODO this attribute must be static – enforce at compile time
					state.namespace = value.data;
				}

				block.builders.create.addLine(
					`${generator.helper( method )}( ${state.parentNode}, '${name}', ${result} );`
				);
			}
		}

		else {
			dynamic = true;

			// dynamic – but potentially non-string – attributes
			const { snippet } = generator.contextualise( block, value.expression );

			const last = `last_${state.parentNode}_${name.replace( /-/g, '_')}`;
			block.builders.create.addLine( `var ${last} = ${snippet};` );

			const updater = propertyName ?
				`${state.parentNode}.${propertyName} = ${last};` :
				`${generator.helper( method )}( ${state.parentNode}, '${name}', ${last} );`;

			block.builders.create.addLine( updater );

			block.builders.update.addBlock( deindent`
				if ( ( ${block.tmp()} = ${snippet} ) !== ${last} ) {
					${last} = ${block.tmp()};
					${updater}
				}
			` );
		}
	}

	else {
		dynamic = true;

		const value = ( attribute.value[0].type === 'Text' ? '' : `"" + ` ) + (
			attribute.value.map( chunk => {
				if ( chunk.type === 'Text' ) {
					return JSON.stringify( chunk.data );
				} else {
					const { snippet } = generator.contextualise( block, chunk.expression );
					return `( ${snippet} )`;
				}
			}).join( ' + ' )
		);

		const updater = propertyName ?
			`${state.parentNode}.${propertyName} = ${value};` :
			`${generator.helper( method )}( ${state.parentNode}, '${name}', ${value} );`;

		block.builders.create.addLine( updater );
		block.builders.update.addLine( updater );
	}

	if ( isIndirectlyBoundValue ) {
		const updateValue = `${state.parentNode}.value = ${state.parentNode}.__value;`;

		block.builders.create.addLine( updateValue );
		if ( dynamic ) block.builders.update.addLine( updateValue );
	}
}