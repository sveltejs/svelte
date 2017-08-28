import repeat from './repeat';

enum ChunkType {
	Line,
	Block
}

interface Condition {
	condition: string;
	used: boolean;
}

export default class CodeBuilder {
	result: string;
	first: ChunkType;
	last: ChunkType;
	lastCondition: string;
	conditionStack: Condition[];
	indent: string;

	constructor(str = '') {
		this.result = str;

		const initial = str
			? /\n/.test(str) ? ChunkType.Block : ChunkType.Line
			: null;
		this.first = initial;
		this.last = initial;

		this.lastCondition = null;
		this.conditionStack = [];
		this.indent = '';
	}

	addConditional(condition: string, body: string) {
		this.reifyConditions();

		body = body.replace(/^/gm, `${this.indent}\t`);

		if (condition === this.lastCondition) {
			this.result += `\n${body}`;
		} else {
			if (this.lastCondition) {
				this.result += `\n${this.indent}}`;
			}

			this.result += `${this.last === ChunkType.Block ? '\n\n' : '\n'}${this.indent}if ( ${condition} ) {\n${body}`;
			this.lastCondition = condition;
		}

		this.last = ChunkType.Block;
	}

	addLine(line: string) {
		this.reifyConditions();

		if (this.lastCondition) {
			this.result += `\n${this.indent}}`;
			this.lastCondition = null;
		}

		if (this.last === ChunkType.Block) {
			this.result += `\n\n${this.indent}${line}`;
		} else if (this.last === ChunkType.Line) {
			this.result += `\n${this.indent}${line}`;
		} else {
			this.result += line;
		}

		this.last = ChunkType.Line;
		if (!this.first) this.first = ChunkType.Line;
	}

	addLineAtStart(line: string) {
		this.reifyConditions();

		if (this.first === ChunkType.Block) {
			this.result = `${line}\n\n${this.indent}${this.result}`;
		} else if (this.first === ChunkType.Line) {
			this.result = `${line}\n${this.indent}${this.result}`;
		} else {
			this.result += line;
		}

		this.first = ChunkType.Line;
		if (!this.last) this.last = ChunkType.Line;
	}

	addBlock(block: string) {
		this.reifyConditions();

		if (this.indent) block = block.replace(/^/gm, `${this.indent}`);

		if (this.lastCondition) {
			this.result += `\n${this.indent}}`;
			this.lastCondition = null;
		}

		if (this.result) {
			this.result += `\n\n${this.indent}${block}`;
		} else {
			this.result += block;
		}

		this.last = ChunkType.Block;
		if (!this.first) this.first = ChunkType.Block;
	}

	addBlockAtStart(block: string) {
		this.reifyConditions();

		if (this.result) {
			this.result = `${block}\n\n${this.indent}${this.result}`;
		} else {
			this.result += block;
		}

		this.first = ChunkType.Block;
		if (!this.last) this.last = ChunkType.Block;
	}

	isEmpty() {
		return this.result === '';
	}

	pushCondition(condition: string) {
		this.conditionStack.push({ condition, used: false });
	}

	popCondition() {
		const { used } = this.conditionStack.pop();

		this.indent = repeat('\t', this.conditionStack.length);
		if (used) this.addLine('}');
	}

	reifyConditions() {
		for (let i = 0; i < this.conditionStack.length; i += 1) {
			const condition = this.conditionStack[i];
			if (!condition.used) {
				const line = `if (${condition.condition}) {`;

				if (this.last === ChunkType.Block) {
					this.result += `\n\n${this.indent}${line}`;
				} else if (this.last === ChunkType.Line) {
					this.result += `\n${this.indent}${line}`;
				} else {
					this.result += line;
				}

				this.last = ChunkType.Line;
				if (!this.first) this.first = ChunkType.Line;

				this.indent = repeat('\t', this.conditionStack.length);
				condition.used = true;
			}
		}
	}

	toString() {
		return this.result.trim() + (this.lastCondition ? `\n}` : ``);
	}
}
