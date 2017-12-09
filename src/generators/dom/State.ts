import { assign } from '../../shared/index.js';

interface StateData {
	namespace?: string;
	parentNode?: string;
	parentNodes?: string;
	allUsedContexts?: string[];
	usesComponent?: boolean;
}

export default class State {
	namespace?: string;
	parentNode?: string;
	parentNodes?: string;
	allUsedContexts?: string[];
	usesComponent?: boolean;

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