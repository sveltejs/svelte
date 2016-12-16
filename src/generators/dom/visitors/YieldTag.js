export default {
	enter ( generator ) {
		const anchor = `yield_anchor`;
		generator.fire( 'createAnchor', {
			name: anchor,
			description: 'yield'
		});

		generator.current.builders.mount.addLine(
			`component.yield && component.yield.mount( ${generator.current.target}, ${anchor} );`
		);

		generator.current.builders.teardown.addLine(
			`component.yield && component.yield.teardown( detach );`
		);
	}
};
