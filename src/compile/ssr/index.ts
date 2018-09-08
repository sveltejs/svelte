import generate from '@sveltejs/generate-ssr';
import Compiler from '../Compiler';
import Stats from '../../Stats';
import Stylesheet from '../../css/Stylesheet';
import { Ast, CompileOptions } from '../../interfaces';
import { AppendTarget } from '../../interfaces';

export class SsrTarget {
	bindings: string[];
	renderCode: string;
	appendTargets: AppendTarget[];

	constructor() {
		this.bindings = [];
		this.renderCode = '';
		this.appendTargets = [];
	}

	append(code: string) {
		if (this.appendTargets.length) {
			const appendTarget = this.appendTargets[this.appendTargets.length - 1];
			const slotName = appendTarget.slotStack[appendTarget.slotStack.length - 1];
			appendTarget.slots[slotName] += code;
		} else {
			this.renderCode += code;
		}
	}
}

export default function ssr(
	ast: Ast,
	source: string,
	stylesheet: Stylesheet,
	options: CompileOptions,
	stats: Stats
) {
	const compiler = new Compiler(ast, source, options.name || 'SvelteComponent', stylesheet, options, stats, false);

	return generate(compiler);
}

function trim(nodes) {
	let start = 0;
	for (; start < nodes.length; start += 1) {
		const node = nodes[start];
		if (node.type !== 'Text') break;

		node.data = node.data.replace(/^\s+/, '');
		if (node.data) break;
	}

	let end = nodes.length;
	for (; end > start; end -= 1) {
		const node = nodes[end - 1];
		if (node.type !== 'Text') break;

		node.data = node.data.replace(/\s+$/, '');
		if (node.data) break;
	}

	return nodes.slice(start, end);
}
