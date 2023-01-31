export type UserID = number;

export interface User {
	id: UserID;
	name: string;
	username: string;
	avatar: string;
}

export interface Gist {
	id: number;
	name: string;
	owner: UserID;
	files: Array<{ name: string; type: string; source: string }>;
}
