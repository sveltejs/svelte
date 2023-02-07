export interface Section {
	title: string;
	slug: string;
	sections?: Section[];
}

export interface Type {
	name: string;
	comment: string;
	snippet: string;
	bullets: string[];
	children: Type[];
}
