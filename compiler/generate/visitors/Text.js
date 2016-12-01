import deindent from '../utils/deindent.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.counter( `text` );
		generator.addElement( name, `document.createTextNode( ${JSON.stringify( node.data )} )` );
	}
};
