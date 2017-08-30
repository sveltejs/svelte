import { DomGenerator } from './index';
import Block from './Block';
import { Node } from '../../interfaces';

export interface State {
	namespace: string;
	parentNode: string;
	parentNodes: string;
	parentNodeName?: string;
	inEachBlock?: boolean;
	allUsedContexts?: string[];
	usesComponent?: boolean;
	selectBindingDependencies?: string[];
}

export type Visitor = (
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	elementStack: Node[],
	componentStack: Node[]
) => void;