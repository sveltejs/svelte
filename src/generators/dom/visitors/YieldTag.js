export default function visitYieldTag ( generator, block, state ) {
	block.builders.mount.addLine(
		`${block.component}._yield && ${block.component}._yield.mount( ${state.parentNode || block.target}, null );`
	);

	block.builders.destroy.addLine(
		`${block.component}._yield && ${block.component}._yield.destroy( detach );`
	);
}