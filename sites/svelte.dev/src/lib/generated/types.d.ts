export type Modules = {
	name?: string;
	comment?: string;
	exempt?: boolean;
	types?: Child[];
	exports?: Child[];
}[];

type Child = {
	name: string;
	snippet: string;
	comment: string;
	deprecated?: string;
	bullets?: string[];
	children?: Child[];
};
