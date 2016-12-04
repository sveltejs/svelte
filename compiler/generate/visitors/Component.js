import deindent from '../utils/deindent.js';
import addComponentAttributes from './attributes/addComponentAttributes.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.counter( `${node.name[0].toLowerCase()}${node.name.slice( 1 )}` );

		const local = {
			name,
			namespace: generator.current.namespace,
			isComponent: true,

			allUsedContexts: new Set(),

			init: [],
			mount: [],
			update: [],
			teardown: []
		};

		const isToplevel = generator.current.localElementDepth === 0;

		generator.hasComponents = true;

		addComponentAttributes( generator, node, local );

		if ( local.staticAttributes.length || local.dynamicAttributes.length || local.bindings.length ) {
			const initialProps = local.staticAttributes
				.concat( local.dynamicAttributes )
				.map( attribute => `${attribute.name}: ${attribute.value}` );

			const statements = [];

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
					const parts = binding.value.split( '.' );
					const tail = parts.pop();
					return `if ( '${tail}' in ${parts.join( '.' )} ) ${name}_initialData.${binding.name} = ${binding.value};`;
				});

				statements.push( bindings.join( '\n' ) );
			}

			local.init.unshift( deindent`
				${statements.join( '\n\n' )}

				var ${name} = new template.components.${node.name}({
					target: ${!isToplevel ? generator.current.target: 'null'},
					root: component.root || component,
					data: ${name}_initialData
				});
			` );
		} else {
			local.init.unshift( deindent`
				var ${name} = new template.components.${node.name}({
					target: ${!isToplevel ? generator.current.target: 'null'},
					root: component.root || component
				});
			` );
		}

		if ( isToplevel ) {
			local.mount.unshift( `${name}.mount( target, anchor );` );
		}

		if ( local.dynamicAttributes.length ) {
			const updates = local.dynamicAttributes.map( attribute => {
				return deindent`
					if ( ${attribute.dependencies.map( dependency => `'${dependency}' in changed` ).join( '||' )} ) ${name}_changes.${attribute.name} = ${attribute.value};
				`;
			});

			local.update.push( deindent`
				var ${name}_changes = {};

				${updates.join( '\n' )}

				if ( Object.keys( ${name}_changes ).length ) ${name}.set( ${name}_changes );
			` );
		}

		local.teardown.push( `${name}.teardown( ${isToplevel ? 'detach' : 'false'} );` );

		generator.current.initStatements.push( local.init.join( '\n' ) );
		if ( local.update.length ) generator.current.updateStatements.push( local.update.join( '\n' ) );
		if ( local.mount.length ) generator.current.mountStatements.push( local.mount.join( '\n' ) );
		generator.current.teardownStatements.push( local.teardown.join( '\n' ) );

		generator.push({
			namespace: local.namespace,
			target: name,
			parent: generator.current,
			elementDepth: generator.current.elementDepth + 1,
			localElementDepth: generator.current.localElementDepth + 1
		});
	},

	leave ( generator ) {
		generator.pop();
	}
};
