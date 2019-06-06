import repeat from '../../utils/repeat';

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
		this.add_line(str);
	}

	add_conditional(condition: string, body: string) {
		if (this.last.type === 'condition' && this.last.condition === condition) {
			if (body && !whitespace.test(body)) this.last.children.push({ type: 'line', line: body });
		} else {
			const next = this.last = { type: 'condition', condition, parent: this.current, children: [] };
			this.current.children.push(next);
			if (body && !whitespace.test(body)) next.children.push({ type: 'line', line: body });
		}
	}

	add_line(line: string) {
		if (line && !whitespace.test(line)) this.current.children.push(this.last = { type: 'line', line });
	}

	add_block(block: string) {
		if (block && !whitespace.test(block)) this.current.children.push(this.last = { type: 'line', line: block, block: true });
	}

	is_empty() { return !find_line(this.root); }

	push_condition(condition: string) {
		if (this.last.type === 'condition' && this.last.condition === condition) {
			this.current = this.last as BlockChunk;
		} else {
			const next = this.last = { type: 'condition', condition, parent: this.current, children: [] };
			this.current.children.push(next);
			this.current = next;
		}
	}

	pop_condition() {
		if (!this.current.parent) throw new Error(`Popping a condition that maybe wasn't pushed.`);
		this.current = this.current.parent;
	}

	toString() {
		return chunk_to_string(this.root);
	}
}

function find_line(chunk: BlockChunk) {
	for (const c of chunk.children) {
		if (c.type === 'line' || find_line(c as BlockChunk)) return true;
	}
	return false;
}

function chunk_to_string(chunk: Chunk, level: number = 0, last_block?: boolean, first?: boolean): string {
	if (chunk.type === 'line') {
		return `${last_block || (!first && chunk.block) ? '\n' : ''}${chunk.line.replace(/^/gm, repeat('\t', level))}`;
	} else if (chunk.type === 'condition') {
		let t = false;
		const lines = chunk.children.map((c, i) => {
			const str = chunk_to_string(c, level + 1, t, i === 0);
			t = c.type !== 'line' || c.block;
			return str;
		}).filter(l => !!l);

		if (!lines.length) return '';

		return `${last_block || (!first) ? '\n' : ''}${repeat('\t', level)}if (${chunk.condition}) {\n${lines.join('\n')}\n${repeat('\t', level)}}`;
	} else if (chunk.type === 'root') {
		let t = false;
		const lines = chunk.children.map((c, i) => {
			const str = chunk_to_string(c, 0, t, i === 0);
			t = c.type !== 'line' || c.block;
			return str;
		}).filter(l => !!l);

		if (!lines.length) return '';

		return lines.join('\n');
	}
}
