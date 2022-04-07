import Tag from './shared/Tag';

export default class RawMustacheTag extends Tag {
	type: 'RawMustacheTag';
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.not_static_content();
	}
}
