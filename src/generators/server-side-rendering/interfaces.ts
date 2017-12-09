import { SsrGenerator } from './index';
import Block from './Block';
import { Node } from '../../interfaces';

export type Visitor = (
	generator: SsrGenerator,
	block: Block,
	node: Node
) => void;

export interface AppendTarget {
	slots: Record<string, string>;
	slotStack: string[]
}