// @ts-nocheck
import {
    Ident,
    Number,
    Delim,
    Dimension,
    LeftParenthesis,
    RightParenthesis,
	  WhiteSpace
} from 'css-tree/tokenizer';

export const name = 'ContainerFeatureRange';
export const structure = {
    name: String,
    value: ['Identifier', 'Number', 'Comparison', 'Dimension', 'Ratio', null]
};

function lookupNonWSTypeAndValue(offset, type, referenceStr) {
	let currentType;

	do {
		currentType = this.lookupType(offset++);
		if (currentType !== WhiteSpace) {
			break;
		}
	} while (currentType !== 0); // NULL -> 0

	return currentType === type ? this.lookupValue(offset - 1, referenceStr) : false;
}

export function parse() {
    const children = this.createList();
    let child = null;

    this.eat(LeftParenthesis);
    this.skipSC();

    while (!this.eof && this.tokenType !== RightParenthesis) {
        switch (this.tokenType) {
            case Number:
                if (lookupNonWSTypeAndValue.call(this, 1, Delim, '/')) {
                    child = this.Ratio();
                } else {
                    child = this.Number();
                }
                break;

            case Delim:
                child = this.Comparison();
                break;

            case Dimension:
                child = this.Dimension();
                break;

            case Ident:
                child = this.Identifier();
                break;

            default:
                this.error('Number, dimension, comparison, ratio or identifier is expected');
                break;
        }

        children.push(child);

        this.skipSC();
    }

    this.eat(RightParenthesis);

    return {
        type: 'ContainerFeatureRange',
        loc: this.getLocationFromList(children),
        children
    };
}

export function generate(node) {
    this.children(node);
}
