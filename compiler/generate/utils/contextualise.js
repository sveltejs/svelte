import { walk } from 'estree-walker';
import isReference from './isReference.js';
import flattenReference from './flattenReference.js';

export default function contextualise ( code, expression, contexts, helpers ) {
	const usedContexts = [];

	walk( expression, {
		enter ( node, parent ) {
			if ( isReference( node, parent ) ) {
				const { name } = flattenReference( node );

				if ( parent && parent.type === 'CallExpression' && node === parent.callee ) {
					if ( helpers[ name ] ) code.insertRight( node.start, `template.helpers.` );
					return;
				}

				if ( contexts[ name ] ) {
					if ( !~usedContexts.indexOf( name ) ) usedContexts.push( name );
				} else {
					code.insertRight( node.start, `root.` );
					if ( !~usedContexts.indexOf( 'root' ) ) usedContexts.push( 'root' );
				}

				this.skip();
			}
		}
	});

	return usedContexts;
}
