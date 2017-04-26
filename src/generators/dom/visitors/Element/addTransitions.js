import deindent from '../../../../utils/deindent.js';

export default function addTransitions ( generator, block, state, node, intro, outro ) {
	const introName = intro && block.getUniqueName( `${state.name}_intro` );
	const outroName = outro && block.getUniqueName( `${state.name}_outro` );

	const introSnippet = intro && intro.expression ? block.contextualise( intro.expression ).snippet : '{}';

	const outroSnippet = outro === intro ?
		introSnippet :
		outro && outro.expression ? block.contextualise( outro.expression ).snippet : '{}';

	const wrapTransition = generator.helper( 'wrapTransition' );

	if ( intro ) {
		block.addVariable( introName );

		const fn = `${generator.alias( 'template' )}.transitions.${intro.name}`; // TODO add built-in transitions?

		block.builders.create.addBlock( deindent`
			${block.component}._renderHooks.push( function () {
				${introName} = ${wrapTransition}( ${state.name}, ${fn}, ${introSnippet}, true, null, function () {
					${block.component}.fire( 'intro.end', { node: ${state.name} });
				});
				${generator.helper( 'transitionManager' )}.add( ${introName} );
			});
		` );
	}

	if ( outro ) {
		block.addVariable( outroName );

		const fn = `${generator.alias( 'template' )}.transitions.${outro.name}`;

		if ( intro ) {
			block.builders.outro.addBlock( `${introName}.abort();` );
		}

		block.builders.outro.addBlock( deindent`
			${outroName} = ${wrapTransition}( ${state.name}, ${fn}, ${outroSnippet}, false, null, function () {
				detachNode( div );
				${block.component}.fire( 'outro.end', { node: ${state.name} });
				if ( --${block.alias( 'outros' )} === 0 ) ${block.alias( 'outrocallback' )}();
			});
			transitionManager.add( ${outroName} );
		` );
	}
}