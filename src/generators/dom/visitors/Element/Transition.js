export default function visitTransition ( generator, block, state, node, attribute ) {
	( attribute.intro ? block.intros : block.outros ).push({
		node: state.name,
		transition: attribute.name,
		params: block.contextualise( attribute.expression ).snippet
	});
}