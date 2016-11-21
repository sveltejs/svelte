import deindent from '../utils/deindent.js';
import isReference from '../utils/isReference.js';
import counter from '../utils/counter.js';

export default {
	enter ( generator, node ) {
		const i = generator.counters.if++;
		const name = `ifBlock_${i}`;
		const renderer = `renderIfBlock_${i}`;

		generator.current.initStatements.push( deindent`
			var ${name}_anchor = document.createComment( ${JSON.stringify( `#if ${generator.template.slice( node.expression.start, node.expression.end )}` )} );
			${generator.current.target}.appendChild( ${name}_anchor );
			var ${name} = null;
		` );

		generator.addSourcemapLocations( node.expression );

		const usedContexts = generator.contextualise( node.expression );
		const snippet = `[✂${node.expression.start}-${node.expression.end}✂]`;

		let expression;

		if ( isReference( node.expression ) ) {
			const reference = `${generator.template.slice( node.expression.start, node.expression.end )}`;
			expression = usedContexts[0] === 'root' ? `root.${reference}` : reference;

			generator.current.updateStatements.push( deindent`
				if ( ${snippet} && !${name} ) {
					${name} = ${renderer}( component, ${generator.current.target}, ${name}_anchor );
				}
			` );
		} else {
			expression = `${name}_value`;

			generator.current.updateStatements.push( deindent`
				var ${expression} = ${snippet};

				if ( ${expression} && !${name} ) {
					${name} = ${renderer}( component, ${generator.current.target}, ${name}_anchor );
				}
			` );
		}

		generator.current.updateStatements.push( deindent`
			else if ( !${expression} && ${name} ) {
				${name}.teardown();
				${name} = null;
			}

			if ( ${name} ) {
				${name}.update( ${generator.current.contextChain.join( ', ' )} );
			}
		` );

		generator.current.teardownStatements.push( deindent`
			if ( ${name} ) ${name}.teardown();
			${name}_anchor.parentNode.removeChild( ${name}_anchor );
		` );

		generator.current = Object.assign( {}, generator.current, {
			useAnchor: true,
			name: renderer,
			target: 'target',

			initStatements: [],
			updateStatements: [],
			teardownStatements: [],

			counter: counter(),

			parent: generator.current
		});
	},

	leave ( generator ) {
		generator.addRenderer( generator.current );
		generator.current = generator.current.parent;
	}
};
