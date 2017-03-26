export default {
	enter ( generator ) {
		const anchor = `yield_anchor`;
		generator.createAnchor( anchor );

		generator.current.builders.mount.addLine(
			`${generator.current.component}._yield && ${generator.current.component}._yield.mount( ${generator.current.target}, ${anchor} );`
		);

		generator.current.builders.teardown.addLine(
			`${generator.current.component}._yield && ${generator.current.component}._yield.teardown( detach );`
		);
	}
};
