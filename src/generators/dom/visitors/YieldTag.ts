import { DomGenerator } from '../index';
import Block from '../Block';
import { State } from '../interfaces';

export default function visitYieldTag(
	generator: DomGenerator,
	block: Block,
	state: State
) {
	const parentNode = state.parentNode || '#target';

	block.builders.mount.addLine(
		`if ( #component._yield ) #component._yield.mount( ${parentNode}, null );`
	);

	block.builders.unmount.addLine(
		`if ( #component._yield ) #component._yield.unmount();`
	);
}
