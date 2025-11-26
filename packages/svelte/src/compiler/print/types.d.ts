export type Options = {
	getLeadingComments?:
		| ((
				node: any
		  ) =>
				| Array<{ type: 'Line' | 'Block'; value: string; start?: number; end?: number }>
				| undefined)
		| undefined;
	getTrailingComments?:
		| ((
				node: any
		  ) =>
				| Array<{ type: 'Line' | 'Block'; value: string; start?: number; end?: number }>
				| undefined)
		| undefined;
};
