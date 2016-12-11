const LINE = {};
const BLOCK = {};

export default class CodeBuilder {
	constructor () {
		this.result = '';

		this.first = null;
		this.last = null;
	}

	addLine ( line ) {
		if ( this.last === BLOCK ) {
			this.result += `\n\n${line}`;
		} else {
			this.result += `\n${line}`;
		}

		this.last = LINE;
	}

	addLineAtStart ( line ) {
		if ( this.first === BLOCK ) {
			this.result = `${line}\n\n${this.result}`;
		} else {
			this.result = `${line}\n${this.result}`;
		}

		this.first = LINE;
	}

	addBlock ( block ) {
		this.result += `\n\n${block}`;

		this.last = BLOCK;
	}

	addBlockAtStart ( block ) {
		this.result = `${block}\n\n${this.result}`;

		this.first = BLOCK;
	}

	isEmpty () {
		return this.result === '';
	}

	toString () {
		return this.result.trim();
	}
}
