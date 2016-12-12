export default {
	enter ( generator ) {
		const anchor = generator.createAnchor( 'yield', 'yield' );

		generator.current.builders.mount.addLine(
			`component.yield && component.yield.mount( ${generator.current.target}, ${anchor} );`
		);

		generator.current.builders.teardown.addLine(
			`component.yield && component.yield.teardown( detach );`
		);
	}
};
