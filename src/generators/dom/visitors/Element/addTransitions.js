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
				${generator.helper( 'detachNode' )}( ${state.name} );
				${block.component}.fire( 'outro.end', { node: ${state.name} });
				if ( --${block.alias( 'outros' )} === 0 ) ${block.alias( 'outrocallback' )}();
				${name} = null;
			});
		` );
	}

	else {
		const introName = intro && block.getUniqueName( `${state.name}_intro` );
		const outroName = outro && block.getUniqueName( `${state.name}_outro` );

		if ( intro ) {
			block.addVariable( introName );
			const snippet = intro.expression ? block.contextualise( intro.expression ).snippet : '{}';

			const fn = `${generator.alias( 'template' )}.transitions.${intro.name}`; // TODO add built-in transitions?

			if ( outro ) {
				block.builders.intro.addBlock( `if ( ${outroName} ) ${outroName}.abort();` );
			}

			block.builders.intro.addBlock( deindent`
				${block.component}._renderHooks.push( function () {
					${introName} = ${wrapTransition}( ${state.name}, ${fn}, ${snippet}, true, null );
					${introName}.run( 0, 1, function () {
						${block.component}.fire( 'intro.end', { node: ${state.name} });
					});
				});
			` );
		}

		if ( outro ) {
			block.addVariable( outroName );
			const snippet = outro.expression ? block.contextualise( outro.expression ).snippet : '{}';

			const fn = `${generator.alias( 'template' )}.transitions.${outro.name}`;

			block.builders.outro.addBlock( deindent`
				${outroName} = ${wrapTransition}( ${state.name}, ${fn}, ${snippet}, false, null );
				${outroName}.run( 1, 0, function () {
					${generator.helper( 'detachNode' )}( ${state.name} );
					${block.component}.fire( 'outro.end', { node: ${state.name} });
					if ( --${block.alias( 'outros' )} === 0 ) ${block.alias( 'outrocallback' )}();
				});
			` );
		}
	}
}