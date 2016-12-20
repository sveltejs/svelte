export default {
	enter ( generator ) {
		const anchor = `yield_anchor`;
		generator.createAnchor( anchor, 'yield' );

		generator.current.builders.mount.addLine(
			`component._yield && component._yield.mount( ${generator.current.target}, ${anchor} );`
		);

		generator.current.builders.teardown.addLine(
			`component._yield && component._yield.teardown( detach );`
		);
	}
};
