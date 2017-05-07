import visitors from './visitors/index';

export default function visit ( generator, block, state, node ) {
	const visitor = visitors[ node.type ];
	visitor( generator, block, state, node );
}