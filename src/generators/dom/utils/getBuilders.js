import CodeBuilder from '../../../utils/CodeBuilder.js';

export default function getBuilders () {
	return {
		create: new CodeBuilder(),
		mount: new CodeBuilder(),
		update: new CodeBuilder(),
		detach: new CodeBuilder(),
		detachRaw: new CodeBuilder(),
		destroy: new CodeBuilder()
	};
}
