import repeat from './repeat';

const whitespace = /^\s+$/;

interface Chunk {
	parent?: BlockChunk;
	type: 'root'|'line'|'condition';
	children?: Chunk[];
	line?: string;
	block?: boolean;
	condition?: string;
}

interface BlockChunk extends Chunk {
	type: 'root'|'condition';
	children: Chunk[];
	parent: BlockChunk;
}

export default class CodeBuilder {
	root: BlockChunk = { type: 'root', children: [], parent: null };
	last: Chunk;
	current: BlockChunk;

	constructor(str = '') {
		this.current = this.last = this.root;
		this.addLine(str);
	}

	addConditional(condition: string, body: string) {
		if (this.last.type === 'condition' && this.last.condition === condition) {
			if (body && !whitespace.test(body)) this.last.children.push({ type: 'line', line: body });
		} else {
			const next = this.last = { type: 'condition', condition, parent: this.current, children: [] };
			this.current.children.push(next);
			if (body && !whitespace.test(body)) next.children.push({ type: 'line', line: body });
		}
	}

	addLine(line: string) {
		if (line && !whitespace.test(line)) this.current.children.push(this.last = { type: 'line', line });
	}

	addLineAtStart(line: string) {
		if (line && !whitespace.test(line)) this.root.children.unshift({ type: 'line', line });
	}

	addBlock(block: string) {
		if (block && !whitespace.test(block)) this.current.children.push(this.last = { type: 'line', line: block, block: true });
	}

	addBlockAtStart(block: string) {
		if (block && !whitespace.test(block)) this.root.children.unshift({ type: 'line', line: block, block: true });
	}

	isEmpty() { return !findLine(this.root); }

	pushCondition(condition: string) {
		if (this.last.type === 'condition' && this.last.condition === condition) {
			this.current = this.last as BlockChunk;
		} else {
			const next = this.last = { type: 'condition', condition, parent: this.current, children: [] };
			this.current.children.push(next);
			this.current = next;
		}
	}

	popCondition() {
		if (!this.current.parent) throw new Error(`Popping a condition that maybe wasn't pushed.`);
		this.current = this.current.parent;
	}

	toString() {
		return chunkToString(this.root);
	}
}

function findLine(chunk: BlockChunk) {
	for (const c of chunk.children) {
		if (c.type === 'line' || findLine(c as BlockChunk)) return true;
	}
	return false;
}

function chunkToString(chunk: Chunk, level: number = 0, lastBlock?: boolean, first?: boolean): string {
	if (chunk.type === 'line') {
		return `${lastBlock || (!first && chunk.block) ? '\n' : ''}${chunk.line.replace(/^/gm, repeat('\t', level))}`;
	} else if (chunk.type === 'condition') {
		let t = false;
		const lines = chunk.children.map((c, i) => {
			const str = chunkToString(c, level + 1, t, i === 0);
			t = c.type !== 'line' || c.block;
			return str;
		}).filter(l => !!l);

		if (!lines.length) return '';

		return `${lastBlock || (!first) ? '\n' : ''}${repeat('\t', level)}if (${chunk.condition}) {\n${lines.join('\n')}\n${repeat('\t', level)}}`;
	} else if (chunk.type === 'root') {
		let t = false;
		const lines = chunk.children.map((c, i) => {
			const str = chunkToString(c, 0, t, i === 0);
			t = c.type !== 'line' || c.block;
			return str;
		}).filter(l => !!l);

		if (!lines.length) return '';

		return lines.join('\n');
	}
}
