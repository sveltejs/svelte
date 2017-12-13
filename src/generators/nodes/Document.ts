import deindent from '../../utils/deindent';
import { stringify } from '../../utils/stringify';
import Node from './shared/Node';
import Block from '../dom/Block';
import Attribute from './Attribute';

export default class Document extends Node {
	type: 'Document';
	attributes: Attribute[];

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const { generator } = this;

		this.var = 'document';

		this.attributes.forEach((attribute: Attribute) => {
			if (attribute.name === 'title') {
				attribute.render(block);
			}
		});
	}
}
