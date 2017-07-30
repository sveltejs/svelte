import { Node } from '../interfaces';

export interface Computation {
	key: string;
	deps: string[]
}

export interface TemplateProperties {
	computed?: Node;
	components?: Node;
	data?: Node;
	events?: Node;
	helpers?: Node;
	methods?: Node;
	namespace?: Node;
	oncreate?: Node;
	ondestroy?: Node;
	transitions?: Node;

	// TODO remove in v2
	onrender?: Node;
	onteardown?: Node;
}