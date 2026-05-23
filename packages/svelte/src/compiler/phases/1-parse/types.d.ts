import type { Comment } from 'estree';

export type CommentWithLocation = Comment & {
	start: number;
	end: number;
};
