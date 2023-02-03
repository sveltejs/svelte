export interface BlogPost {
	title: string;
	description: string;
	date: string;
	date_formatted: string;
	author: {
		name: string;
		url?: string;
	};
	draft: boolean;
	content: string;
}

export interface BlogPostSummary {
	slug: string;
	title: string;
	description: string;
	date: string;
	draft: boolean;
}
