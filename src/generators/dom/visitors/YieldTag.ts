import { DomGenerator } from '../index';
import Block from '../Block';
import { State } from '../interfaces';

export default function visitYieldTag(
	generator: DomGenerator,
	block: Block,
	state: State
) {
	const parentNode = state.parentNode || block.target;

	block.builders.mount.addLine(
		`if ( ${block.component}._yield ) ${block.component}._yield.mount( ${parentNode}, null );`
	);

	block.builders.unmount.addLine(
		`if ( ${block.component}._yield ) ${block.component}._yield.unmount();`
	);
}
