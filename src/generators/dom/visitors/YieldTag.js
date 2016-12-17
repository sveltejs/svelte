export default {
	enter ( generator ) {
		const anchor = `yield_anchor`;
		generator.createAnchor( anchor, 'yield' );

		generator.current.builders.mount.addLine(
			`component.yield && component.yield.mount( ${generator.current.target}, ${anchor} );`
		);

		generator.current.builders.teardown.addLine(
			`component.yield && component.yield.teardown( detach );`
		);
	}
};
