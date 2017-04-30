import deindent from '../../../../utils/deindent.js';

export default function addTransitions ( generator, block, state, node, intro, outro ) {
	const wrapTransition = generator.helper( 'wrapTransition' );

	if ( intro === outro ) {
		const name = block.getUniqueName( `${state.name}_transition` );
		const snippet = intro.expression ? block.contextualise( intro.expression ).snippet : '{}';

		block.addVariable( name );

		const fn = `${generator.alias( 'template' )}.transitions.${intro.name}`;

		block.builders.intro.addBlock( deindent`
			${block.component}._renderHooks.push( function () {
				if ( !${name} ) ${name} = ${wrapTransition}( ${state.name}, ${fn}, ${snippet}, true, null );
				${name}.run( ${name}.t, 1, function () {
					${block.component}.fire( 'intro.end', { node: ${state.name} });
				});
			});
		` );

		block.builders.outro.addBlock( deindent`
			${name}.run( ${name}.t, 0, function () {
				detachNode( ${state.name} );
				${block.component}.fire( 'outro.end', { node: ${state.name} });
				if ( --${block.alias( 'outros' )} === 0 ) ${block.alias( 'outrocallback' )}();
				${name} = null;
			});
		` );
	}

	else {
		if ( intro ) {
			const name = block.getUniqueName( `${state.name}_intro` );
			const snippet = intro.expression ? block.contextualise( intro.expression ).snippet : '{}';

			block.addVariable( name );

			const fn = `${generator.alias( 'template' )}.transitions.${intro.name}`; // TODO add built-in transitions?

			block.builders.intro.addBlock( deindent`
				${block.component}._renderHooks.push( function () {
					${name} = ${wrapTransition}( ${state.name}, ${fn}, ${snippet}, true, null );
					${name}.run( 0, 1, function () {
						${block.component}.fire( 'intro.end', { node: ${state.name} });
					});
				});
			` );
		}

		if ( outro ) {
			const name = block.getUniqueName( `${state.name}_intro` );
			const snippet = outro.expression ? block.contextualise( outro.expression ).snippet : '{}';

			block.addVariable( name );

			const fn = `${generator.alias( 'template' )}.transitions.${outro.name}`;

			block.builders.outro.addBlock( deindent`
				${name} = ${wrapTransition}( ${state.name}, ${fn}, ${snippet}, false, null );
				${name}.run( 1, 0, function () {
					detachNode( ${state.name} );
					${block.component}.fire( 'outro.end', { node: ${state.name} });
					if ( --${block.alias( 'outros' )} === 0 ) ${block.alias( 'outrocallback' )}();
				});
			` );
		}
	}
}