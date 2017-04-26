import deindent from '../../../../utils/deindent.js';

export default function visitTransition ( generator, block, state, node, attribute ) {
	const name = block.getUniqueName( `${state.name}_${attribute.intro ? 'intro' : 'outro'}` );

	block.addVariable( name );

	const snippet = attribute.expression ? block.contextualise( attribute.expression ).snippet : '{}';
	const fn = `${generator.alias( 'template' )}.transitions.${attribute.name}`; // TODO add built-in transitions?

	if ( attribute.intro ) {
		generator.hasIntroTransitions = true;

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

	if ( attribute.outro ) {
		generator.hasOutroTransitions = true;

		throw new Error( 'TODO' );
	}
}