export type ExamplesData = {
	title: string;
	slug: string;
	examples: {
		title: string;
		slug: string;
		files: {
			content: string;
			type: 'svelte' | 'js';
			filename: string;
		}[];
	}[];
}[];

export interface Example {
	title: string;
	slug: string;
}

export interface ExampleSection {
	title: string;
	examples: Example[];
}

export type ExamplesList = ExampleSection[];
