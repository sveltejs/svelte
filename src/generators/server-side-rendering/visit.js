import visitors from './visitors/index.js';

export default function visit ( node, generator ) {
	const visitor = visitors[ node.type ];

	if ( visitor.enter ) visitor.enter( generator, node );
	if ( visitor.leave ) visitor.leave( generator, node );
}