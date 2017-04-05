import visitors from './visitors/index.js';

export default function visit ( node, generator ) {
	const visitor = visitors[ node.type ];
	visitor( generator, node );
}