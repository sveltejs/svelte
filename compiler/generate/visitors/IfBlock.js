import deindent from '../utils/deindent.js';
import counter from '../utils/counter.js';

export default {
	enter ( generator, node ) {
		const i = generator.counters.if++;
		const name = `ifBlock_${i}`;
		const renderer = `renderIfBlock_${i}`;

		const elseName = `elseBlock_${i}`;
		const elseRenderer = `renderElseBlock_${i}`;

		generator.current.initStatements.push( deindent`
			var ${name}_anchor = document.createComment( ${JSON.stringify( `#if ${generator.source.slice( node.expression.start, node.expression.end )}` )} );
			${generator.current.target}.appendChild( ${name}_anchor );
			var ${name} = null;${node.else ? `\nvar ${elseName} = null;` : ``}
		` );

		generator.addSourcemapLocations( node.expression );
		const { snippet } = generator.contextualise( node.expression );

		const ifTrue = [ deindent`
			if ( !${name } ) {
				${name} = ${renderer}( component, ${generator.current.target}, ${name}_anchor );
			}
		` ];

		if ( node.else ) {
			ifTrue.push( deindent`
				if ( ${elseName } ) {
					${elseName}.teardown();
					${elseName} = null;
				}
			` );
		}

		const ifFalse = [ deindent`
			if ( ${name} ) {
				${name}.teardown();
				${name} = null;
			}
		` ];

		if ( node.else ) {
			ifFalse.push( deindent`
				if ( !${elseName } ) {
					${elseName} = ${elseRenderer}( component, ${generator.current.target}, ${name}_anchor );
				}
			` );
		}

		let update = deindent`
			if ( ${snippet} ) {
				${ifTrue.join( '\n\n' )}
			}

			else {
				${ifFalse.join( '\n\n' )}
			}

			if ( ${name} ) ${name}.update( ${generator.current.params.join( ', ' )} );
		`;

		if ( node.else ) {
			update += `\nif ( ${elseName} ) ${elseName}.update( ${generator.current.params.join( ', ' )} );`;
		}

		generator.current.updateStatements.push( update );

		generator.current.teardownStatements.push( deindent`
			if ( ${name} ) ${name}.teardown();${node.else ? `\nif ( ${elseName} ) ${elseName}.teardown();` : ``}
			${name}_anchor.parentNode.removeChild( ${name}_anchor );
		` );

		generator.push({
			useAnchor: true,
			name: renderer,
			target: 'target',

			initStatements: [],
			updateStatements: [],
			teardownStatements: [],

			counter: counter()
		});
	},

	leave ( generator, node ) {
		generator.addRenderer( generator.current );

		if ( node.else ) {
			generator.visit( node.else );
		}

		generator.pop();
	}
};
