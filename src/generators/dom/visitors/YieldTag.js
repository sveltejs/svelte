export default function visitYieldTag ( generator ) {
	const anchor = `yield_anchor`;
	generator.createAnchor( anchor );

	generator.current.builders.mount.addLine(
		`${generator.current.component}._yield && ${generator.current.component}._yield.mount( ${generator.current.target}, ${anchor} );`
	);

	generator.current.builders.destroy.addLine(
		`${generator.current.component}._yield && ${generator.current.component}._yield.destroy( detach );`
	);
}