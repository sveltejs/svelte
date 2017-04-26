import deindent from '../../../../utils/deindent.js';

export default function visitTransition ( generator, block, state, node, attribute ) {
	const name = block.getUniqueName( `${state.name}_${attribute.intro ? 'intro' : 'outro'}` );

	block.addVariable( name );

	if ( attribute.intro ) {
		generator.hasIntroTransitions = true;

		const { snippet } = block.contextualise( attribute.expression );
		const fn = `${generator.alias( 'template' )}.transitions.${attribute.name}`; // TODO add built-in transitions?

		block.builders.create.addBlock( deindent`
			${block.component}._renderHooks.push({
				fn: function () {
					${name} = ${generator.helper( 'wrapTransition' )}( ${state.name}, ${fn}, ${snippet}, true );
					${generator.helper( 'transitionManager' )}.add( ${name} );
				},
				context: ${block.component}
			});
		` );
	}

	( attribute.intro ? block.intros : block.outros ).push({
		node: state.name,
		transition: attribute.name,
		params: block.contextualise( attribute.expression ).snippet
	});
}