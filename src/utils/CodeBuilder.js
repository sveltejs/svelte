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
		} else if ( this.last === LINE ) {
			this.result += `\n${line}`;
		} else {
			this.result += line;
		}

		this.last = LINE;
		if ( !this.first ) this.first = LINE;
	}

	addLineAtStart ( line ) {
		if ( this.first === BLOCK ) {
			this.result = `${line}\n\n${this.result}`;
		} else if ( this.first === LINE ) {
			this.result = `${line}\n${this.result}`;
		} else {
			this.result += line;
		}

		this.first = LINE;
		if ( !this.last ) this.last = LINE;
	}

	addBlock ( block ) {
		if ( this.result ) {
			this.result += `\n\n${block}`;
		} else {
			this.result += block;
		}

		this.last = BLOCK;
		if ( !this.first ) this.first = BLOCK;
	}

	addBlockAtStart ( block ) {
		if ( this.result ) {
			this.result = `${block}\n\n${this.result}`;
		} else {
			this.result += block;
		}

		this.first = BLOCK;
		if ( !this.last ) this.last = BLOCK;
	}

	isEmpty () {
		return this.result === '';
	}

	toString () {
		return this.result.trim();
	}
}
