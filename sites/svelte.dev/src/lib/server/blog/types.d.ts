export interface BlogPost {
	title: string;
	description: string;
	date: string;
	date_formatted: string;
	slug: string;
	file: string;
	author: {
		name: string;
		url?: string;
	};
	draft: boolean;
	content: string;
}

export type BlogData = BlogPost[];

export interface BlogPostSummary {
	slug: string;
	title: string;
	description: string;
	date: string;
	draft: boolean;
}
