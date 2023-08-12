// @ts-nocheck
import { Delim } from 'css-tree/tokenizer';

const FULLSTOP = 0x002E; // U+002E FULL STOP (.)

export const name = 'LayerName';
export const structure = {
	name: 'Identifier',
	sublayer: ['LayerName', null],
};

// TODO: Wait for css-tree to support a layer name AST and remove this file
export function parse() {
	const start = this.tokenStart;
	const name = this.Identifier();

	const char_idx = this.tokenStart;
	const char_code = this.charCodeAt(char_idx);

	let sublayer;
 	if (char_code === FULLSTOP) {
 		this.next();
		sublayer = parse.call(this);
	} else {
		sublayer = null;
	}

	return {
		type: 'LayerName',
		name,
		sublayer,
		loc: this.getLocation(start, this.tokenStart),
	}
}

export function generate(node) {
	this.token(Ident, node.name);
	this.token(Delim, ".");
	if (node.sublayer !== null) {
	 	generate.call(this, node.sublayer);
	}
}
