import deindent from '../../../utils/deindent.js';
import CodeBuilder from '../../../utils/CodeBuilder.js';
import getBuilders from '../utils/getBuilders.js';
import visit from '../visit.js';
import addComponentAttributes from './attributes/addComponentAttributes.js';

function capDown ( name ) {
	return `${name[0].toLowerCase()}${name.slice( 1 )}`;
}

function stringifyProps ( props ) {
	if ( !props.length ) return '{}';

	const joined = props.join( ', ' );
	if ( joined.length > 40 ) {
		// make larger data objects readable
		return `{\n\t${props.join( ',\n\t' )}\n}`;
	}

	return `{ ${joined} }`;
}

export default function visitComponent ( generator, fragment, node ) {
	const hasChildren = node.children.length > 0;
	const name = fragment.getUniqueName( capDown( node.name === ':Self' ? generator.name : node.name ) );

	const local = {
		name,
		namespace: fragment.namespace,
		isComponent: true,

		allUsedContexts: [],

		create: new CodeBuilder(),
		update: new CodeBuilder()
	};

	const isToplevel = fragment.localElementDepth === 0;

	generator.hasComponents = true;

	addComponentAttributes( generator, fragment, node, local );

	if ( local.allUsedContexts.length ) {
		const initialProps = local.allUsedContexts.map( contextName => {
			if ( contextName === 'root' ) return `root: root`;

			const listName = fragment.listNames.get( contextName );
			const indexName = fragment.indexNames.get( contextName );

			return `${listName}: ${listName},\n${indexName}: ${indexName}`;
		}).join( ',\n' );

		const updates = local.allUsedContexts.map( contextName => {
			if ( contextName === 'root' ) return `${name}._context.root = root;`;

			const listName = fragment.listNames.get( contextName );
			const indexName = fragment.indexNames.get( contextName );

			return `${name}._context.${listName} = ${listName};\n${name}._context.${indexName} = ${indexName};`;
		}).join( '\n' );

		local.create.addBlock( deindent`
			${name}._context = {
				${initialProps}
			};
		` );

		local.update.addBlock( updates );
	}

	const componentInitProperties = [
		`target: ${!isToplevel ? fragment.target: 'null'}`,
		`_root: ${fragment.component}._root || ${fragment.component}`
	];

	// Component has children, put them in a separate {{yield}} block
	if ( hasChildren ) {
		const params = fragment.params.join( ', ' );

		const childFragment = fragment.child({
			type: 'component',
			name: generator.getUniqueName( `render_${name}_yield_fragment` ), // TODO should getUniqueName happen inside Fragment? probably
			target: 'target',
			localElementDepth: 0,
			builders: getBuilders()
		});

		node.children.forEach( child => {
			visit( generator, childFragment, child );
		});

		const yieldFragment = fragment.getUniqueName( `${name}_yield_fragment` );

		fragment.builders.create.addLine(
			`var ${yieldFragment} = ${childFragment.name}( ${params}, ${fragment.component} );`
		);

		fragment.builders.update.addLine(
			`${yieldFragment}.update( changed, ${params} );`
		);

		componentInitProperties.push( `_yield: ${yieldFragment}`);

		generator.addRenderer( childFragment );
	}

	const statements = [];

	if ( local.staticAttributes.length || local.dynamicAttributes.length || local.bindings.length ) {
		const initialProps = local.staticAttributes
			.concat( local.dynamicAttributes )
			.map( attribute => `${attribute.name}: ${attribute.value}` );

		const initialPropString = stringifyProps( initialProps );

		if ( local.bindings.length ) {
			const initialData = fragment.getUniqueName( `${name}_initial_data` );

			statements.push( `var ${name}_initial_data = ${initialPropString};` );

			local.bindings.forEach( binding => {
				statements.push( `if ( ${binding.prop} in ${binding.obj} ) ${initialData}.${binding.name} = ${binding.value};` );
			});

			componentInitProperties.push( `data: ${initialData}` );
		} else if ( initialProps.length ) {
			componentInitProperties.push( `data: ${initialPropString}` );
		}
	}

	const expression = node.name === ':Self' ? generator.name : generator.importedComponents.get( node.name ) || `${generator.alias( 'template' )}.components.${node.name}`;

	local.create.addBlockAtStart( deindent`
		${statements.join( '\n' )}
		var ${name} = new ${expression}({
			${componentInitProperties.join(',\n')}
		});
	` );

	if ( isToplevel ) {
		fragment.builders.mount.addLine( `${name}._fragment.mount( target, anchor );` );
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

	fragment.builders.destroy.addLine( `${name}.destroy( ${isToplevel ? 'detach' : 'false'} );` );

	fragment.builders.create.addBlock( local.create );
	if ( !local.update.isEmpty() ) fragment.builders.update.addBlock( local.update );
}