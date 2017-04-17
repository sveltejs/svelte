export default function visitYieldTag ( generator, block, state ) {
	const anchor = `yield_anchor`;
	block.createAnchor( anchor, state.parentNode );

	block.builders.mount.addLine(
		`${block.component}._yield && ${block.component}._yield.mount( ${state.parentNode || block.target}, ${anchor} );`
	);

	block.builders.destroy.addLine(
		`${block.component}._yield && ${block.component}._yield.destroy( detach );`
	);
}