export default function visitYieldTag ( generator, fragment ) {
	const anchor = `yield_anchor`;
	fragment.createAnchor( anchor );

	fragment.builders.mount.addLine(
		`${fragment.component}._yield && ${fragment.component}._yield.mount( ${fragment.target}, ${anchor} );`
	);

	fragment.builders.destroy.addLine(
		`${fragment.component}._yield && ${fragment.component}._yield.destroy( detach );`
	);
}