import type { Section } from '../docs/types';

export interface BlogPost {
	title: string;
	description: string;
	date: string;
	date_formatted: string;
	slug: string;
	file: string;
	authors: {
		name: string;
		url?: string;
	}[];
	draft: boolean;
	content: string;
	sections: Section[];
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
