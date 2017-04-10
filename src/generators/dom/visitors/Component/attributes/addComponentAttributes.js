import addComponentBinding from './addComponentBinding.js';
import deindent from '../../../../../utils/deindent.js';

export default function addComponentAttributes ( generator, block, node, local ) {
	local.staticAttributes = [];
	local.dynamicAttributes = [];
	local.bindings = [];

	node.attributes.forEach( attribute => {
		if ( attribute.type === 'Attribute' ) {
			if ( attribute.value === true ) {
				// attributes without values, e.g. <textarea readonly>
				local.staticAttributes.push({
					name: attribute.name,
					value: true
				});
			}

			else if ( attribute.value.length === 0 ) {
				local.staticAttributes.push({
					name: attribute.name,
					value: `''`
				});
			}

			else if ( attribute.value.length === 1 ) {
				const value = attribute.value[0];

				if ( value.type === 'Text' ) {
					// static attributes
					const result = isNaN( value.data ) ? JSON.stringify( value.data ) : value.data;
					local.staticAttributes.push({
						name: attribute.name,
						value: result
					});
				}

				else {
					// simple dynamic attributes
					const { dependencies, string } = generator.contextualise( block, value.expression );

					// TODO only update attributes that have changed
					local.dynamicAttributes.push({
						name: attribute.name,
						value: string,
						dependencies
					});
				}
			}

			else {
				// complex dynamic attributes
				const allDependencies = [];

				const value = ( attribute.value[0].type === 'Text' ? '' : `"" + ` ) + (
					attribute.value.map( chunk => {
						if ( chunk.type === 'Text' ) {
							return JSON.stringify( chunk.data );
						} else {
							const { dependencies, string } = generator.contextualise( block, chunk.expression );
							dependencies.forEach( dependency => {
								if ( !~allDependencies.indexOf( dependency ) ) allDependencies.push( dependency );
							});

							return `( ${string} )`;
						}
					}).join( ' + ' )
				);

				local.dynamicAttributes.push({
					name: attribute.name,
					value,
					dependencies: allDependencies
				});
			}
		}

		else if ( attribute.type === 'EventHandler' ) {
			// TODO verify that it's a valid callee (i.e. built-in or declared method)
			generator.addSourcemapLocations( attribute.expression );
			generator.code.prependRight( attribute.expression.start, `${block.component}.` );

			const usedContexts = [];
			attribute.expression.arguments.forEach( arg => {
				const { contexts } = generator.contextualise( block, arg, null, true );

				contexts.forEach( context => {
					if ( !~usedContexts.indexOf( context ) ) usedContexts.push( context );
					if ( !~local.allUsedContexts.indexOf( context ) ) local.allUsedContexts.push( context );
				});
			});

			// TODO hoist event handlers? can do `this.__component.method(...)`
			const declarations = usedContexts.map( name => {
				if ( name === 'root' ) return 'var root = this._context.root;';

				const listName = block.listNames.get( name );
				const indexName = block.indexNames.get( name );

				return `var ${listName} = this._context.${listName}, ${indexName} = this._context.${indexName}, ${name} = ${listName}[${indexName}]`;
			});

			const handlerBody = ( declarations.length ? declarations.join( '\n' ) + '\n\n' : '' ) + `[✂${attribute.expression.start}-${attribute.expression.end}✂];`;

			local.create.addBlock( deindent`
				${local.name}.on( '${attribute.name}', function ( event ) {
					${handlerBody}
				});
			` );
		}

		else if ( attribute.type === 'Binding' ) {
			addComponentBinding( generator, node, attribute, block, local );
		}

		else if ( attribute.type === 'Ref' ) {
			generator.usesRefs = true;

			local.create.addLine(
				`${block.component}.refs.${attribute.name} = ${local.name};`
			);

			block.builders.destroy.addLine( deindent`
				if ( ${block.component}.refs.${attribute.name} === ${local.name} ) ${block.component}.refs.${attribute.name} = null;
			` );
		}

		else {
			throw new Error( `Not implemented: ${attribute.type}` );
		}
	});
}
