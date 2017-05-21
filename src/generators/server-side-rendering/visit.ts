import visitors from './visitors/index';

export default function visit ( generator, fragment, node ) {
	const visitor = visitors[ node.type ];
	visitor( generator, fragment, node );
}