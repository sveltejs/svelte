import Block from './Block.js';
import { trimStart, trimEnd } from '../../utils/trim.js';
import { assign } from '../../shared/index.js';

function isElseIf ( node ) {
	return node && node.children.length === 1 && node.children[0].type === 'IfBlock';
}

function getChildState ( parent, child ) {
	return assign( {}, parent, { name: null, parentNode: null }, child || {} );
}

// Whitespace inside one of these elements will not result in
// a whitespace node being created in any circumstances. (This
// list is almost certainly very incomplete)
const elementsWithoutText = new Set([
	'audio',
	'datalist',
	'dl',
	'ol',
	'optgroup',
	'select',
	'ul',
	'video'
]);

const preprocessors = {
	MustacheTag: ( generator, block, state, node ) => {
		const dependencies = block.findDependencies( node.expression );
		block.addDependencies( dependencies );

		node._state = getChildState( state, {
			name: block.getUniqueName( 'text' )
		});
	},

	RawMustacheTag: ( generator, block, state, node ) => {
		const dependencies = block.findDependencies( node.expression );
		block.addDependencies( dependencies );

		const basename = block.getUniqueName( 'raw' );
		const name = block.getUniqueName( `${basename}_before` );

		node._state = getChildState( state, { basename, name });
	},

	Text: ( generator, block, state, node ) => {
		node._state = getChildState( state );

		if ( !/\S/.test( node.data ) ) {
			if ( state.namespace ) return;
			if ( elementsWithoutText.has( state.parentNodeName ) ) return;
		}

		node._state.shouldCreate = true;
		node._state.name = block.getUniqueName( `text` );
	},

	IfBlock: ( generator, block, state, node ) => {
		const blocks = [];
		let dynamic = false;

		function attachBlocks ( node ) {
			const dependencies = block.findDependencies( node.expression );
			block.addDependencies( dependencies );

			node._block = block.child({
				name: generator.getUniqueName( `create_if_block` )
			});

			node._state = getChildState( state );

			blocks.push( node._block );
			preprocessChildren( generator, node._block, node._state, node );

			if ( node._block.dependencies.size > 0 ) {
				dynamic = true;
				block.addDependencies( node._block.dependencies );
			}

			if ( isElseIf( node.else ) ) {
				attachBlocks( node.else.children[0] );
			} else if ( node.else ) {
				node.else._block = block.child({
					name: generator.getUniqueName( `create_if_block` )
				});

				node.else._state = getChildState( state );

				blocks.push( node.else._block );
				preprocessChildren( generator, node.else._block, node.else._state, node.else );

				if ( node.else._block.dependencies.size > 0 ) {
					dynamic = true;
					block.addDependencies( node.else._block.dependencies );
				}
			}
		}

		attachBlocks( node );

		blocks.forEach( block => {
			block.hasUpdateMethod = dynamic;
		});

		generator.blocks.push( ...blocks );
	},

	EachBlock: ( generator, block, state, node ) => {
		const dependencies = block.findDependencies( node.expression );
		block.addDependencies( dependencies );

		const indexNames = new Map( block.indexNames );
		const indexName = node.index || block.getUniqueName( `${node.context}_index` );
		indexNames.set( node.context, indexName );

		const listNames = new Map( block.listNames );
		const listName = block.getUniqueName( `each_block_value` );
		listNames.set( node.context, listName );

		const context = generator.getUniqueName( node.context );
		const contexts = new Map( block.contexts );
		contexts.set( node.context, context );

		const indexes = new Map( block.indexes );
		if ( node.index ) indexes.set( indexName, node.context );

		const contextDependencies = new Map( block.contextDependencies );
		contextDependencies.set( node.context, dependencies );

		node._block = block.child({
			name: generator.getUniqueName( 'create_each_block' ),
			expression: node.expression,
			context: node.context,
			key: node.key,

			contextDependencies,
			contexts,
			indexes,

			listName,
			indexName,

			indexNames,
			listNames,
			params: block.params.concat( listName, context, indexName )
		});

		node._state = getChildState( state, {
			inEachBlock: true
		});

		generator.blocks.push( node._block );
		preprocessChildren( generator, node._block, node._state, node );
		block.addDependencies( node._block.dependencies );
		node._block.hasUpdateMethod = node._block.dependencies.size > 0;

		if ( node.else ) {
			node.else._block = block.child({
				name: generator.getUniqueName( `${node._block.name}_else` )
			});

			node.else._state = getChildState( state );

			generator.blocks.push( node.else._block );
			preprocessChildren( generator, node.else._block, node.else._state, node.else );
			node.else._block.hasUpdateMethod = node.else._block.dependencies.size > 0;
		}
	},

	Element: ( generator, block, state, node ) => {
		const isComponent = generator.components.has( node.name ) || node.name === ':Self';

		if ( isComponent ) {
			node._state = getChildState( state );
		} else {
			const name = block.getUniqueName( node.name );

			node._state = getChildState( state, {
				isTopLevel: false,
				name,
				parentNode: name,
				parentNodeName: node.name,
				namespace: node.name === 'svg' ? 'http://www.w3.org/2000/svg' : state.namespace,
				allUsedContexts: []
			});
		}

		node.attributes.forEach( attribute => {
			if ( attribute.type === 'Attribute' && attribute.value !== true ) {
				attribute.value.forEach( chunk => {
					if ( chunk.type !== 'Text' ) {
						const dependencies = block.findDependencies( chunk.expression );
						block.addDependencies( dependencies );
					}
				});
			}

			else if ( attribute.type === 'Binding' ) {
				const dependencies = block.findDependencies( attribute.value );
				block.addDependencies( dependencies );
			}
		});

		if ( node.children.length ) {
			if ( isComponent ) {
				const name = block.getUniqueName( ( node.name === ':Self' ? generator.name : node.name ).toLowerCase() );

				node._block = block.child({
					name: generator.getUniqueName( `create_${name}_yield_fragment` )
				});

				generator.blocks.push( node._block );
				preprocessChildren( generator, node._block, node._state, node );
				block.addDependencies( node._block.dependencies );
				node._block.hasUpdateMethod = node._block.dependencies.size > 0;
			}

			else {
				preprocessChildren( generator, block, node._state, node );
			}
		}
	}
};

function preprocessChildren ( generator, block, state, node ) {
	// glue text nodes together
	const cleaned = [];
	let lastChild;

	node.children.forEach( child => {
		if ( child.type === 'Comment' ) return;

		if ( child.type === 'Text' && lastChild && lastChild.type === 'Text' ) {
			lastChild.data += child.data;
			lastChild.end = child.end;
		} else {
			cleaned.push( child );
		}

		if ( lastChild ) lastChild.next = child;
		lastChild = child;
	});

	node.children = cleaned;

	cleaned.forEach( child => {
		const preprocess = preprocessors[ child.type ];
		if ( preprocess ) preprocess( generator, block, state, child );
	});
}

export default function preprocess ( generator, state, node ) {
	const block = new Block({
		generator,
		name: generator.alias( 'create_main_fragment' ),
		key: null,

		contexts: new Map(),
		indexes: new Map(),
		contextDependencies: new Map(),

		params: [ 'state' ],
		indexNames: new Map(),
		listNames: new Map(),

		dependencies: new Set()
	});

	generator.blocks.push( block );
	preprocessChildren( generator, block, state, node );
	block.hasUpdateMethod = block.dependencies.size > 0;

	// trim leading and trailing whitespace from the top level
	const firstChild = node.children[0];
	if ( firstChild && firstChild.type === 'Text' ) {
		firstChild.data = trimStart( firstChild.data );
		if ( !firstChild.data ) node.children.shift();
	}

	const lastChild = node.children[ node.children.length - 1 ];
	if ( lastChild && lastChild.type === 'Text' ) {
		lastChild.data = trimEnd( lastChild.data );
		if ( !lastChild.data ) node.children.pop();
	}

	return block;
}