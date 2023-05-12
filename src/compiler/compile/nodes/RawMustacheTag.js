import Tag from './shared/Tag.js';

/** @extends Tag */
export default class RawMustacheTag extends Tag {
	/** @type {'RawMustacheTag'} */
	type;

	/**
	 * @param {any} component
	 * @param {any} parent
	 * @param {any} scope
	 * @param {any} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.cannot_use_innerhtml();
		this.not_static_content();
	}
}
