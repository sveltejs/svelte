import EachBlock from '../EachBlock';
import ThenBlock from '../ThenBlock';
import CatchBlock from '../CatchBlock';
import InlineComponent from '../InlineComponent';
import Element from '../Element';
import SlotTemplate from '../SlotTemplate';

type NodeWithScope = EachBlock | ThenBlock | CatchBlock | InlineComponent | Element | SlotTemplate;

export default class TemplateScope {
	names: Set<string>;
	dependencies_for_name: Map<string, Set<string>>;
	owners: Map<string, NodeWithScope> = new Map();
	parent?: TemplateScope;
	private static readonly LET_TYPES: string[] = ['Element', 'InlineComponent', 'SlotTemplate'];
	private static readonly AWAIT_TYPES: string[] = ['ThenBlock', 'CatchBlock'];

	constructor(parent?: TemplateScope) {
		this.parent = parent;
		this.names = new Set(parent?.names || []);
		this.dependencies_for_name = new Map(parent?.dependencies_for_name || []);
	}

	add(name, dependencies: Set<string>, owner) {
		this.names.add(name);
		this.dependencies_for_name.set(name, dependencies);
		this.owners.set(name, owner);
		return this;
	}

	child() {
		const child = new TemplateScope(this);
		return child;
	}

	is_top_level(name: string) {
		return !this.parent || !this.names.has(name) && this.parent.is_top_level(name);
	}

	get_owner(name: string): NodeWithScope {
		return this.owners.get(name) || this.parent?.get_owner(name);
	}

	is_let(name: string) {
		const owner = this.get_owner(name);
		return TemplateScope.LET_TYPES.includes(owner?.type);
	}

	is_await(name: string) {
		const owner = this.get_owner(name);
		return TemplateScope.AWAIT_TYPES.includes(owner?.type);
	}
}
