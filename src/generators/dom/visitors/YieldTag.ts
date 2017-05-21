import { DomGenerator } from '../index';
import Block from '../Block';

export default function visitYieldTag ( generator: DomGenerator, block: Block, state ) {
	const parentNode = state.parentNode || block.target;

	( state.parentNode ? block.builders.create : block.builders.mount ).addLine(
		`if ( ${block.component}._yield ) ${block.component}._yield.mount( ${parentNode}, null );`
	);

	block.builders.destroy.addLine(
		`if ( ${block.component}._yield ) ${block.component}._yield.destroy( detach );`
	);
}