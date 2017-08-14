enum ChunkType {
	Line,
	Block
}

export default class CodeBuilder {
	result: string;
	first: ChunkType;
	last: ChunkType;
	lastCondition: string;

	constructor(str = '') {
		this.result = str;

		const initial = str
			? /\n/.test(str) ? ChunkType.Block : ChunkType.Line
			: null;
		this.first = initial;
		this.last = initial;

		this.lastCondition = null;
	}

	addConditionalLine(condition: string, line: string) {
		if (condition === this.lastCondition) {
			this.result += `\n\t${line}`;
		} else {
			if (this.lastCondition) {
				this.result += `\n}`;
			}

			this.result += `${this.last === ChunkType.Block ? '\n\n' : '\n'}if ( ${condition} ) {\n\t${line}`;
			this.lastCondition = condition;
		}

		this.last = ChunkType.Block;
	}

	addLine(line: string) {
		if (this.lastCondition) {
			this.result += `\n}`;
			this.lastCondition = null;
		}

		if (this.last === ChunkType.Block) {
			this.result += `\n\n${line}`;
		} else if (this.last === ChunkType.Line) {
			this.result += `\n${line}`;
		} else {
			this.result += line;
		}

		this.last = ChunkType.Line;
		if (!this.first) this.first = ChunkType.Line;
	}

	addLineAtStart(line: string) {
		if (this.first === ChunkType.Block) {
			this.result = `${line}\n\n${this.result}`;
		} else if (this.first === ChunkType.Line) {
			this.result = `${line}\n${this.result}`;
		} else {
			this.result += line;
		}

		this.first = ChunkType.Line;
		if (!this.last) this.last = ChunkType.Line;
	}

	addBlock(block: string) {
		if (this.lastCondition) {
			this.result += `\n}`;
			this.lastCondition = null;
		}

		if (this.result) {
			this.result += `\n\n${block}`;
		} else {
			this.result += block;
		}

		this.last = ChunkType.Block;
		if (!this.first) this.first = ChunkType.Block;
	}

	addBlockAtStart(block: string) {
		if (this.result) {
			this.result = `${block}\n\n${this.result}`;
		} else {
			this.result += block;
		}

		this.first = ChunkType.Block;
		if (!this.last) this.last = ChunkType.Block;
	}

	isEmpty() {
		return this.result === '';
	}

	toString() {
		return this.result.trim() + (this.lastCondition ? `\n}` : ``);
	}
}
