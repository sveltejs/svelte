import CodeBuilder from '../../../utils/CodeBuilder.js';
import deindent from '../../../utils/deindent.js';
import getBuilders from '../utils/getBuilders.js';

const reserved = new Set( [ 'component', 'root' ] );

export default {
	enter ( generator, node ) {
		const name = generator.getUniqueName( `eachBlock` );
		const renderer = generator.getUniqueName( `renderEachBlock` );
		const elseName = `${name}_else`;
		const iterations = `${name}_iterations`;
		const renderElse = `${renderer}_else`;
		const i = generator.current.getUniqueName( `i` );
		const { params } = generator.current;

		const listName = `${name}_value`;

		const isToplevel = generator.current.localElementDepth === 0;

		generator.addSourcemapLocations( node.expression );

		const { dependencies, snippet } = generator.contextualise( node.expression );

		const anchor = `${name}_anchor`;
		generator.createAnchor( anchor );

		generator.current.builders.init.addLine( `var ${name}_value = ${snippet};` );
		generator.current.builders.init.addLine( `var ${iterations} = [];` );
		if ( node.key ) generator.current.builders.init.addLine( `var ${name}_lookup = Object.create( null );` );
		if ( node.else ) generator.current.builders.init.addLine( `var ${elseName} = null;` );

		const initialRender = new CodeBuilder();

		const localVars = {};

		if ( node.key ) {
			localVars.fragment = generator.current.getUniqueName( 'fragment' );
			localVars.value = generator.current.getUniqueName( 'value' );
			localVars.key = generator.current.getUniqueName( 'key' );

			initialRender.addBlock( deindent`
				var ${localVars.key} = ${name}_value[${i}].${node.key};
				${name}_iterations[${i}] = ${name}_lookup[ ${localVars.key} ] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, component${node.key ? `, ${localVars.key}` : `` } );
			` );
		} else {
			initialRender.addLine(
				`${name}_iterations[${i}] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, component );`
			);
		}

		if ( !isToplevel ) {
			initialRender.addLine(
				`${name}_iterations[${i}].mount( ${anchor}.parentNode, ${anchor} );`
			);
		}

		generator.current.builders.init.addBlock( deindent`
			for ( var ${i} = 0; ${i} < ${name}_value.length; ${i} += 1 ) {
				${initialRender}
			}
		` );

		if ( node.else ) {
			generator.current.builders.init.addBlock( deindent`
				if ( !${name}_value.length ) {
					${elseName} = ${renderElse}( ${params}, component );
					${!isToplevel ? `${elseName}.mount( ${anchor}.parentNode, ${anchor} );` : ''}
				}
			` );
		}

		if ( isToplevel ) {
			generator.current.builders.mount.addBlock( deindent`
				for ( var ${i} = 0; ${i} < ${iterations}.length; ${i} += 1 ) {
					${iterations}[${i}].mount( ${anchor}.parentNode, ${anchor} );
				}
			` );
			if ( node.else ) {
				generator.current.builders.mount.addBlock( deindent`
					if ( ${elseName} ) {
						${elseName}.mount( ${anchor}.parentNode, ${anchor} );
					}
				` );
			}
		}

		if ( node.key ) {
			generator.current.builders.update.addBlock( deindent`
				var ${name}_value = ${snippet};
				var _${name}_iterations = [];
				var _${name}_lookup = Object.create( null );

				var ${localVars.fragment} = document.createDocumentFragment();

				// create new iterations as necessary
				for ( var ${i} = 0; ${i} < ${name}_value.length; ${i} += 1 ) {
					var ${localVars.value} = ${name}_value[${i}];
					var ${localVars.key} = ${localVars.value}.${node.key};

					if ( ${name}_lookup[ ${localVars.key} ] ) {
						_${name}_iterations[${i}] = _${name}_lookup[ ${localVars.key} ] = ${name}_lookup[ ${localVars.key} ];
						_${name}_lookup[ ${localVars.key} ].update( changed, ${params}, ${listName}, ${listName}[${i}], ${i} );
					} else {
						_${name}_iterations[${i}] = _${name}_lookup[ ${localVars.key} ] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, component${node.key ? `, ${localVars.key}` : `` } );
					}

					_${name}_iterations[${i}].mount( ${localVars.fragment}, null );
				}

				// remove old iterations
				for ( var ${i} = 0; ${i} < ${name}_iterations.length; ${i} += 1 ) {
					var ${name}_iteration = ${name}_iterations[${i}];
					if ( !_${name}_lookup[ ${name}_iteration.${localVars.key} ] ) {
						${name}_iteration.teardown( true );
					}
				}

				${name}_anchor.parentNode.insertBefore( ${localVars.fragment}, ${name}_anchor );

				${name}_iterations = _${name}_iterations;
				${name}_lookup = _${name}_lookup;
			` );
		} else {
			generator.current.builders.update.addBlock( deindent`
				var ${name}_value = ${snippet};

				for ( var ${i} = 0; ${i} < ${name}_value.length; ${i} += 1 ) {
					if ( !${iterations}[${i}] ) {
						${iterations}[${i}] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, component );
						${iterations}[${i}].mount( ${anchor}.parentNode, ${anchor} );
					} else {
						${iterations}[${i}].update( changed, ${params}, ${listName}, ${listName}[${i}], ${i} );
					}
				}

				teardownEach( ${iterations}, true, ${name}_value.length );

				${iterations}.length = ${listName}.length;
			` );
		}

		if ( node.else ) {
			generator.current.builders.update.addBlock( deindent`
				if ( !${name}_value.length && ${elseName} ) {
					${elseName}.update( changed, ${params} );
				} else if ( !${name}_value.length ) {
					${elseName} = ${renderElse}( ${params}, component );
					${elseName}.mount( ${anchor}.parentNode, ${anchor} );
				} else if ( ${elseName} ) {
					${elseName}.teardown( true );
				}
			` );
		}

		generator.current.builders.teardown.addBlock(
			`${generator.helper( 'teardownEach' )}( ${iterations}, ${isToplevel ? 'detach' : 'false'} );` );

		if ( node.else ) {
			generator.current.builders.teardown.addBlock( deindent`
				if ( ${elseName} ) {
					${elseName}.teardown( ${isToplevel ? 'detach' : 'false'} );
				}
			` );
		}

		if ( node.else ) {
			generator.generateBlock( node.else, renderElse );
		}

		const indexNames = new Map( generator.current.indexNames );
		const indexName = node.index || `${node.context}__index`;
		indexNames.set( node.context, indexName );

		const listNames = new Map( generator.current.listNames );
		listNames.set( node.context, listName );

		// ensure that contexts like `root` or `component` don't blow up the whole show
		let context = node.context;
		let c = 1;

		while ( reserved.has( context ) || ~generator.current.params.indexOf( context ) ) {
			context = `${node.context}$${c++}`;
		}

		const contexts = new Map( generator.current.contexts );
		contexts.set( node.context, context );

		const indexes = new Map( generator.current.indexes );
		if ( node.index ) indexes.set( indexName, node.context );

		const contextDependencies = new Map( generator.current.contextDependencies );
		contextDependencies.set( node.context, dependencies );

		const blockParams = generator.current.params.concat( listName, context, indexName );

		generator.push({
			name: renderer,
			target: 'target',
			expression: node.expression,
			context: node.context,
			key: node.key,
			localElementDepth: 0,

			contextDependencies,
			contexts,
			indexes,

			indexNames,
			listNames,
			params: blockParams,

			builders: getBuilders(),
			getUniqueName: generator.getUniqueNameMaker()
		});
	},

	leave ( generator ) {
		generator.addRenderer( generator.current );
		generator.pop();
	}
};
