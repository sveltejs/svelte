import deindent from '../../../../utils/deindent.js';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';

export default function addTransitions ( generator: DomGenerator, block: Block, state: State, node: Node, intro, outro ) {
	const wrapTransition = generator.helper( 'wrapTransition' );

	if ( intro === outro ) {
		const name = block.getUniqueName( `${state.name}_transition` );
		const snippet = intro.expression ? block.contextualise( intro.expression ).snippet : '{}';

		block.addVariable( name );

		const fn = `${generator.alias( 'template' )}.transitions.${intro.name}`;

		block.builders.intro.addBlock( deindent`
			${block.component}._renderHooks.push( function () {
				if ( !${name} ) ${name} = ${wrapTransition}( ${state.name}, ${fn}, ${snippet}, true, null );
				${name}.run( true, function () {
					${block.component}.fire( 'intro.end', { node: ${state.name} });
				});
			});
		` );

		block.builders.outro.addBlock( deindent`
			${name}.run( false, function () {
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
				block.builders.intro.addBlock( deindent`
					if ( ${introName} ) ${introName}.abort();
					if ( ${outroName} ) ${outroName}.abort();
				` );
			}

			block.builders.intro.addBlock( deindent`
				${block.component}._renderHooks.push( function () {
					${introName} = ${wrapTransition}( ${state.name}, ${fn}, ${snippet}, true, null );
					${introName}.run( true, function () {
						${block.component}.fire( 'intro.end', { node: ${state.name} });
					});
				});
			` );
		}

		if ( outro ) {
			block.addVariable( outroName );
			const snippet = outro.expression ? block.contextualise( outro.expression ).snippet : '{}';

			const fn = `${generator.alias( 'template' )}.transitions.${outro.name}`;

			// TODO hide elements that have outro'd (unless they belong to a still-outroing
			// group) prior to their removal from the DOM
			block.builders.outro.addBlock( deindent`
				${outroName} = ${wrapTransition}( ${state.name}, ${fn}, ${snippet}, false, null );
				${outroName}.run( false, function () {
					${block.component}.fire( 'outro.end', { node: ${state.name} });
					if ( --${block.alias( 'outros' )} === 0 ) ${block.alias( 'outrocallback' )}();
				});
			` );
		}
	}
}