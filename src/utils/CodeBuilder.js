const LINE = {};
const BLOCK = {};

export default class CodeBuilder {
	constructor () {
		this.result = '';
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

	addBlock ( block ) {
		this.result += `\n\n${block}`;

		this.last = BLOCK;
	}

	isEmpty () {
		return this.result === '';
	}

	toString () {
		return this.result.trim();
	}
}
