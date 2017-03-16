import deindent from '../../../utils/deindent.js';
import CodeBuilder from '../../../utils/CodeBuilder.js';
import flattenReference from '../../../utils/flattenReference.js';
import addComponentAttributes from './attributes/addComponentAttributes.js';

function capDown ( name ) {
	return `${name[0].toLowerCase()}${name.slice( 1 )}`;
}

export default {
	enter ( generator, node ) {
		const hasChildren = node.children.length > 0;
		const name = generator.current.getUniqueName( capDown( node.name === ':Self' ? generator.name : node.name ) );

		const local = {
			name,
			namespace: generator.current.namespace,
			isComponent: true,

			allUsedContexts: [],

			init: new CodeBuilder(),
			update: new CodeBuilder()
		};

		const isToplevel = generator.current.localElementDepth === 0;

		generator.hasComponents = true;

		addComponentAttributes( generator, node, local );

		if ( local.allUsedContexts.length ) {
			const initialProps = local.allUsedContexts.map( contextName => {
				if ( contextName === 'root' ) return `root: root`;

				const listName = generator.current.listNames[ contextName ];
				const indexName = generator.current.indexNames[ contextName ];

				return `${listName}: ${listName},\n${indexName}: ${indexName}`;
			}).join( ',\n' );

			const updates = local.allUsedContexts.map( contextName => {
				if ( contextName === 'root' ) return `${name}._context.root = root;`;

				const listName = generator.current.listNames[ contextName ];
				const indexName = generator.current.indexNames[ contextName ];

				return `${name}._context.${listName} = ${listName};\n${name}._context.${indexName} = ${indexName};`;
			}).join( '\n' );

			local.init.addBlock( deindent`
				${name}._context = {
					${initialProps}
				};
			` );

			local.update.addBlock( updates );
		}

		const componentInitProperties = [
			`target: ${!isToplevel ? generator.current.target: 'null'}`,
			'_root: component._root || component'
		];

		// Component has children, put them in a separate {{yield}} block
		if ( hasChildren ) {
			const yieldName = generator.getUniqueName( `render${name}YieldFragment` );
			const params = generator.current.params.join( ', ' );

			generator.generateBlock( node, yieldName );

			generator.current.builders.init.addLine(
				`var ${name}_yieldFragment = ${yieldName}( ${params}, component );`
			);

			generator.current.builders.update.addLine(
				`${name}_yieldFragment.update( changed, ${params} );`
			);

			componentInitProperties.push( `_yield: ${name}_yieldFragment`);
		}

		const statements = [];

		if ( local.staticAttributes.length || local.dynamicAttributes.length || local.bindings.length ) {
			const initialProps = local.staticAttributes
				.concat( local.dynamicAttributes )
				.map( attribute => `${attribute.name}: ${attribute.value}` );

			if ( initialProps.length ) {
				statements.push( deindent`
					var ${name}_initialData = {
						${initialProps.join( ',\n' )}
					};
				` );
			} else {
				statements.push( `var ${name}_initialData = {};` );
			}

			if ( local.bindings.length ) {
				const bindings = local.bindings.map( binding => {
					return `if ( ${binding.prop} in ${binding.obj} ) ${name}_initialData.${binding.name} = ${binding.value};`;
				});

				statements.push( bindings.join( '\n' ) );
			}
			componentInitProperties.push(`data: ${name}_initialData`);
		}

		const expression = node.name === ':Self' ? generator.name : `template.components.${node.name}`;

		local.init.addBlockAtStart( deindent`
			${statements.join( '\n\n' )}
			var ${name} = new ${expression}({
				${componentInitProperties.join(',\n')}
			});
		` );

		if ( isToplevel ) {
			generator.current.builders.mount.addLine( `${name}._fragment.mount( target, anchor );` );
		}

		if ( local.dynamicAttributes.length ) {
			const updates = local.dynamicAttributes.map( attribute => {
				if ( attribute.dependencies.length ) {
					return deindent`
						if ( ${attribute.dependencies.map( dependency => `'${dependency}' in changed` ).join( '||' )} ) ${name}_changes.${attribute.name} = ${attribute.value};
					`;
				}

				// TODO this is an odd situation to encounter – I *think* it should only happen with
				// each block indices, in which case it may be possible to optimise this
				return `${name}_changes.${attribute.name} = ${attribute.value};`;
			});

			local.update.addBlock( deindent`
				var ${name}_changes = {};

				${updates.join( '\n' )}

				if ( Object.keys( ${name}_changes ).length ) ${name}.set( ${name}_changes );
			` );
		}

		generator.current.builders.teardown.addLine( `${name}.destroy( ${isToplevel ? 'detach' : 'false'} );` );

		generator.current.builders.init.addBlock( local.init );
		if ( !local.update.isEmpty() ) generator.current.builders.update.addBlock( local.update );

		generator.push({
			namespace: local.namespace,
			target: name,
			parent: generator.current,
			localElementDepth: generator.current.localElementDepth + 1,
			key: null
		});
	},

	leave ( generator ) {
		generator.pop();
	}
};
