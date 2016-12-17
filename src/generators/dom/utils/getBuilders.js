import CodeBuilder from '../../../utils/CodeBuilder.js';

export default function getBuilders () {
	return {
		init: new CodeBuilder(),
		mount: new CodeBuilder(),
		update: new CodeBuilder(),
		detach: new CodeBuilder(),
		detachRaw: new CodeBuilder(),
		teardown: new CodeBuilder()
	};
}
