import deindent from '../../../utils/deindent.js';
import CodeBuilder from '../../../utils/CodeBuilder.js';
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

export default function visitComponent ( generator, block, state, node ) {
	const hasChildren = node.children.length > 0;
	const name = block.getUniqueName( capDown( node.name === ':Self' ? generator.name : node.name ) );

	const local = {
		name,
		namespace: state.namespace,
		isComponent: true,

		allUsedContexts: [],

		create: new CodeBuilder(),
		update: new CodeBuilder()
	};

	const isToplevel = !state.parentNode;

	generator.hasComponents = true;

	addComponentAttributes( generator, block, node, local );

	if ( local.allUsedContexts.length ) {
		const initialProps = local.allUsedContexts.map( contextName => {
			if ( contextName === 'root' ) return `root: root`;

			const listName = block.listNames.get( contextName );
			const indexName = block.indexNames.get( contextName );

			return `${listName}: ${listName},\n${indexName}: ${indexName}`;
		}).join( ',\n' );

		const updates = local.allUsedContexts.map( contextName => {
			if ( contextName === 'root' ) return `${name}._context.root = root;`;

			const listName = block.listNames.get( contextName );
			const indexName = block.indexNames.get( contextName );

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
		`target: ${!isToplevel ? state.parentNode: 'null'}`,
		`_root: ${block.component}._root || ${block.component}`
	];

	// Component has children, put them in a separate {{yield}} block
	if ( hasChildren ) {
		const params = block.params.join( ', ' );

		const childBlock = block.child({
			name: generator.getUniqueName( `render_${name}_yield_fragment` ) // TODO should getUniqueName happen inside Fragment? probably
		});

		const childState = Object.assign( {}, state, {
			parentNode: null
		});

		node.children.forEach( child => {
			visit( generator, childBlock, childState, child );
		});

		const yieldFragment = block.getUniqueName( `${name}_yield_fragment` );

		block.builders.create.addLine(
			`var ${yieldFragment} = ${childBlock.name}( ${params}, ${block.component} );`
		);

		block.builders.update.addLine(
			`${yieldFragment}.update( changed, ${params} );`
		);

		componentInitProperties.push( `_yield: ${yieldFragment}`);

		generator.addBlock( childBlock );
	}

	const statements = [];

	if ( local.staticAttributes.length || local.dynamicAttributes.length || local.bindings.length ) {
		const initialProps = local.staticAttributes
			.concat( local.dynamicAttributes )
			.map( attribute => `${attribute.name}: ${attribute.value}` );

		const initialPropString = stringifyProps( initialProps );

		if ( local.bindings.length ) {
			const initialData = block.getUniqueName( `${name}_initial_data` );

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
		block.builders.mount.addLine( `${name}._fragment.mount( target, anchor );` );
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

	block.builders.destroy.addLine( `${name}.destroy( ${isToplevel ? 'detach' : 'false'} );` );

	block.builders.create.addBlock( local.create );
	if ( !local.update.isEmpty() ) block.builders.update.addBlock( local.update );
}