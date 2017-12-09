import { assign } from '../../shared/index.js';

interface StateData {
	namespace?: string;
	parentNode?: string;
	parentNodes?: string;
	parentNodeName?: string;
	inEachBlock?: boolean;
	allUsedContexts?: string[];
	usesComponent?: boolean;
	selectBindingDependencies?: string[];
}

export default class State {
	namespace?: string;
	parentNode?: string;
	parentNodes?: string;
	parentNodeName?: string;
	inEachBlock?: boolean;
	allUsedContexts?: string[];
	usesComponent?: boolean;
	selectBindingDependencies?: string[];

	constructor(data: StateData = {}) {
		assign(this, data)
	}

	child(data?: StateData) {
		return new State(assign({}, this, {
			parentNode: null,
			parentNodes: 'nodes'
		}, data));
	}
}