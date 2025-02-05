import { active_reaction, invocation_version } from '../runtime.js';

export function getAbortSignal() {
	if (active_reaction === null) {
		throw new Error('TODO');
	}

	var controller = (active_reaction.ctrl ??= new AbortController());

	if (active_reaction.iv > invocation_version) {
		controller.abort();
	}

	return controller.signal;
}
