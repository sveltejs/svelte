export default {
	enter ( generator ) {
	  const anchor = generator.createAnchor( 'yield', 'yield' );
		generator.current.mountStatements.push(`component.yield && component.yield.mount( ${generator.current.target}, ${anchor} );`);
		generator.current.teardownStatements.push(`component.yield && component.yield.teardown( detach );`);
	}
};
