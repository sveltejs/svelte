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

export interface BlogPostRSS {
	slug: string;
	title: string;
	content: string;
	author: {
		name: string;
	};
	date: string;
	draft: boolean;
}
