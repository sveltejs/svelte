import deindent from '../utils/deindent.js';

export default {
	enter ( generator, node ) {
	  const anchor = generator.createAnchor( 'yield', 'yield' );
		generator.current.mountStatements.push(`component.yield && component.yield.mount( ${generator.current.target}, ${anchor} );`);
		generator.current.teardownStatements.push(`component.yield && component.yield.teardown( detach );`);
	}
};
