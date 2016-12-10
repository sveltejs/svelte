import deindent from '../../utils/deindent.js';
import addComponentAttributes from './attributes/addComponentAttributes.js';

export default {
	enter ( generator, node ) {
		const hasChildren = node.children.length > 0;
		const name = generator.current.getUniqueName( `${node.name[0].toLowerCase()}${node.name.slice( 1 )}` );

		const local = {
			name,
			namespace: generator.current.namespace,
			isComponent: true,

			allUsedContexts: new Set(),

			init: [],
			mount: [],
			update: [],
			detach: [],
			teardown: []
		};

		const isToplevel = generator.current.localElementDepth === 0;

		generator.hasComponents = true;

		addComponentAttributes( generator, node, local );

		const componentInitProperties = [
			`target: ${!isToplevel ? generator.current.target: 'null'}`,
			'root: component.root || component'
		];

		// Component has children, put them in a separate {{yield}} block
		if ( hasChildren ) {
			const yieldName = generator.current.getUniqueName( `render${name}YieldFragment` );

			generator.generateBlock( node, yieldName );

			generator.current.builders.init.addLine(
				`var ${name}_yieldFragment = ${yieldName}( root, component );`
			);

			generator.current.updateStatements.push(`${name}_yieldFragment.update ( changed, root );`);

			componentInitProperties.push(`yield: ${name}_yieldFragment`);
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
					const parts = binding.value.split( '.' );
					const tail = parts.pop();
					return `if ( '${tail}' in ${parts.join( '.' )} ) ${name}_initialData.${binding.name} = ${binding.value};`;
				});

				statements.push( bindings.join( '\n' ) );
			}
			componentInitProperties.push(`data: ${name}_initialData`);
		}

		local.init.unshift( deindent`
			${statements.join( '\n\n' )}
			var ${name} = new template.components.${node.name}({
				${componentInitProperties.join(',\n')}
			});
		` );

		if ( isToplevel ) {
			local.mount.unshift( `${name}._mount( target, anchor );` );
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

			local.update.push( deindent`
				var ${name}_changes = {};

				${updates.join( '\n' )}

				if ( Object.keys( ${name}_changes ).length ) ${name}.set( ${name}_changes );
			` );
		}

		local.teardown.push( `${name}.teardown( ${isToplevel ? 'detach' : 'false'} );` );

		generator.current.builders.init.addBlock( local.init.join( '\n' ) );
		if ( local.update.length ) generator.current.updateStatements.push( local.update.join( '\n' ) );
		if ( local.mount.length ) generator.current.mountStatements.push( local.mount.join( '\n' ) );
		if ( local.detach.length ) generator.current.detachStatements.push( local.detach.join( '\n' ) );
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
