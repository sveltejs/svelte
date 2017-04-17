import Block from './Block.js';

function isElseIf ( node ) {
	return node && node.children.length === 1 && node.children[0].type === 'IfBlock';
}

const preprocessors = {
	MustacheTag: ( generator, block, node ) => {
		const { dependencies } = block.contextualise( node.expression );
		block.addDependencies( dependencies );
	},

	IfBlock: ( generator, block, node ) => {
		function attachBlocks ( node ) {
			const { dependencies } = block.contextualise( node.expression );
			block.addDependencies( dependencies );

			node._block = block.child({
				name: generator.getUniqueName( `create_if_block` )
			});

			preprocessChildren( generator, node._block, node.children );
			block.addDependencies( node._block.dependencies );

			if ( isElseIf( node.else ) ) {
				attachBlocks( node.else.children[0] );
			} else if ( node.else ) {
				node.else._block = block.child({
					name: generator.getUniqueName( `create_if_block` )
				});

				preprocessChildren( generator, node.else._block, node.else.children );
				block.addDependencies( node.else._block.dependencies );
			}
		}

		attachBlocks( node );
	},

	EachBlock: ( generator, block, node ) => {
		const { dependencies } = block.contextualise( node.expression );
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

		preprocessChildren( generator, node._block, node.children );
		block.addDependencies( node._block.dependencies );
	},

	Element: ( generator, block, node ) => {
		// TODO attributes and bindings (and refs?)...
		preprocessChildren( generator, block, node.children );
	}
};

preprocessors.RawMustacheTag = preprocessors.MustacheTag;

function preprocessChildren ( generator, block, children ) {
	children.forEach( child => {
		const preprocess = preprocessors[ child.type ];
		if ( preprocess ) preprocess( generator, block, child );
	});
}

export default function preprocess ( generator, children, namespace ) {
	const block = new Block({
		generator,
		name: generator.alias( 'create_main_fragment' ),
		key: null,

		contexts: new Map(),
		indexes: new Map(),

		params: [ 'root' ],
		indexNames: new Map(),
		listNames: new Map(),

		dependencies: new Set()
	});

	const state = {
		namespace,
		parentNode: null,
		isTopLevel: true
	};

	preprocessChildren( generator, block, children );

	return { block, state };
}