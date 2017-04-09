import attributeLookup from './lookup.js';
import addElementBinding from './addElementBinding';
import deindent from '../../../../../utils/deindent.js';
import flattenReference from '../../../../../utils/flattenReference.js';
import getStaticAttributeValue from './getStaticAttributeValue.js';

export default function addElementAttributes ( generator, block, state, node, local ) {
	node.attributes.forEach( attribute => {
		const name = attribute.name;

		if ( attribute.type === 'Attribute' ) {
			let metadata = state.namespace ? null : attributeLookup[ name ];
			if ( metadata && metadata.appliesTo && !~metadata.appliesTo.indexOf( node.name ) ) metadata = null;

			let dynamic = false;

			const isIndirectlyBoundValue = name === 'value' && (
				node.name === 'option' || // TODO check it's actually bound
				node.name === 'input' && /^(checkbox|radio)$/.test( getStaticAttributeValue( node, 'type' ) )
			);

			const propertyName = isIndirectlyBoundValue ? '__value' : metadata && metadata.propertyName;

			const isXlink = name.slice( 0, 6 ) === 'xlink:';

			// xlink is a special case... we could maybe extend this to generic
			// namespaced attributes but I'm not sure that's applicable in
			// HTML5?
			const method = isXlink ? 'setXlinkAttribute' : 'setAttribute';

			if ( attribute.value === true ) {
				// attributes without values, e.g. <textarea readonly>
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

			else if ( attribute.value.length === 1 ) {
				const value = attribute.value[0];

				let result = '';

				if ( value.type === 'Text' ) {
					// static attributes
					result = JSON.stringify( value.data );

					let addAttribute = false;
					if ( name === 'xmlns' ) {
						// special case
						// TODO this attribute must be static – enforce at compile time
						state.namespace = value.data;
						addAttribute = true;
					} else if ( propertyName ) {
						block.builders.create.addLine(
							`${state.parentNode}.${propertyName} = ${result};`
						);
					} else {
						addAttribute = true;
					}

					if ( addAttribute ) {
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

					let updater;
					if ( propertyName ) {
						updater = `${state.parentNode}.${propertyName} = ${last};`;
					} else {
						updater = `${generator.helper( method )}( ${state.parentNode}, '${name}', ${last} );`;
					}

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

				let updater;
				if (propertyName) {
					updater = `${state.parentNode}.${propertyName} = ${value};`;
				} else {
					updater = `${generator.helper( method )}( ${state.parentNode}, '${name}', ${value} );`;
				}

				block.builders.create.addLine( updater );
				block.builders.update.addLine( updater );
			}

			if ( isIndirectlyBoundValue ) {
				const updateValue = `${state.parentNode}.value = ${state.parentNode}.__value;`;

				block.builders.create.addLine( updateValue );
				if ( dynamic ) block.builders.update.addLine( updateValue );
			}
		}

		else if ( attribute.type === 'EventHandler' ) {
			// TODO verify that it's a valid callee (i.e. built-in or declared method)
			generator.addSourcemapLocations( attribute.expression );

			const flattened = flattenReference( attribute.expression.callee );
			if ( flattened.name !== 'event' && flattened.name !== 'this' ) {
				// allow event.stopPropagation(), this.select() etc
				generator.code.prependRight( attribute.expression.start, `${block.component}.` );
			}

			const usedContexts = [];
			attribute.expression.arguments.forEach( arg => {
				const { contexts } = generator.contextualise( block, arg, true );

				contexts.forEach( context => {
					if ( !~usedContexts.indexOf( context ) ) usedContexts.push( context );
					if ( !~local.allUsedContexts.indexOf( context ) ) local.allUsedContexts.push( context );
				});
			});

			// TODO hoist event handlers? can do `this.__component.method(...)`
			const declarations = usedContexts.map( name => {
				if ( name === 'root' ) return 'var root = this.__svelte.root;';

				const listName = block.listNames.get( name );
				const indexName = block.indexNames.get( name );

				return `var ${listName} = this.__svelte.${listName}, ${indexName} = this.__svelte.${indexName}, ${name} = ${listName}[${indexName}]`;
			});

			const handlerName = block.getUniqueName( `${name}_handler` );
			const handlerBody = ( declarations.length ? declarations.join( '\n' ) + '\n\n' : '' ) + `[✂${attribute.expression.start}-${attribute.expression.end}✂];`;

			if ( generator.events.has( name ) ) {
				block.builders.create.addBlock( deindent`
					var ${handlerName} = ${generator.alias( 'template' )}.events.${name}.call( ${block.component}, ${state.parentNode}, function ( event ) {
						${handlerBody}
					}.bind( ${state.parentNode} ) );
				` );

				block.builders.destroy.addLine( deindent`
					${handlerName}.teardown();
				` );
			} else {
				block.builders.create.addBlock( deindent`
					function ${handlerName} ( event ) {
						${handlerBody}
					}

					${generator.helper( 'addEventListener' )}( ${state.parentNode}, '${name}', ${handlerName} );
				` );

				block.builders.destroy.addLine( deindent`
					${generator.helper( 'removeEventListener' )}( ${state.parentNode}, '${name}', ${handlerName} );
				` );
			}
		}

		else if ( attribute.type === 'Binding' ) {
			addElementBinding( generator, node, block, state, attribute, local );
		}

		else if ( attribute.type === 'Ref' ) {
			generator.usesRefs = true;

			block.builders.create.addLine(
				`${block.component}.refs.${name} = ${state.parentNode};`
			);

			block.builders.destroy.addLine( deindent`
				if ( ${block.component}.refs.${name} === ${state.parentNode} ) ${block.component}.refs.${name} = null;
			` );
		}

		else {
			throw new Error( `Not implemented: ${attribute.type}` );
		}
	});
}
