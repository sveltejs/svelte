export interface ExamplesDatum {
	title: string;
	slug: string;
	examples: {
		title: string;
		slug: string;
		files: {
			content: string;
			type: string;
			name: string;
		}[];
	}[];
}

export type ExamplesData = ExamplesDatum[];

export interface Example {
	title: string;
	slug: string;
}

export interface ExampleSection {
	title: string;
	examples: Example[];
}

export type ExamplesList = ExampleSection[];
