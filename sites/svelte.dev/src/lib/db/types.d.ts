export type UserID = number;

export interface User {
	id: UserID;
	github_name: string;
	github_login: string;
	github_avatar_url: string;
}

export interface GitHubUser {
	github_id: string;
	github_name: string;
	github_login: string;
	github_avatar_url: string;
}

export interface Gist {
	id: string;
	name: string;
	owner: UserID;
	files: Array<{ name: string; type: string; source: string }>;
}
