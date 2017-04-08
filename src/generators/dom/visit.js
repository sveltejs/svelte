import visitors from './visitors/index.js';

export default function visit ( generator, fragment, state, node ) {
	const visitor = visitors[ node.type ];
	visitor( generator, fragment, state, node );
}