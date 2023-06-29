export type DocsData = Category[];

export interface Section {
	title: string;
	slug: string;
	// Currently, we are only going with 2 level headings, so this will be undefined. In future, we may want to support 3 levels, in which case this will be a list of sections
	sections?: Section[];
	breadcrumbs: string[];
	text: string;
}

export type Category = {
	title: string;
	slug: string;
	pages: Page[];
};

export type Page = {
	title: string;
	slug: string;
	file: string;
	path: string;
	content: string;
	sections: Section[];
};
