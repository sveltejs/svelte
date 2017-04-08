export default function visitYieldTag ( generator, fragment, state ) {
	const anchor = `yield_anchor`;
	fragment.createAnchor( anchor, state.parentNode );

	fragment.builders.mount.addLine(
		`${fragment.component}._yield && ${fragment.component}._yield.mount( ${state.parentNode || 'target'}, ${anchor} );`
	);

	fragment.builders.destroy.addLine(
		`${fragment.component}._yield && ${fragment.component}._yield.destroy( detach );`
	);
}