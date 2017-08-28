import { DomGenerator } from './index';
import Block from './Block';
import { Node } from '../../interfaces';

export interface State {
	name?: string;
	namespace: string;
	parentNode: string;
	parentNodes: string;
	isTopLevel: boolean;
	parentNodeName?: string;
	basename?: string;
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