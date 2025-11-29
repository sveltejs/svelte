import type ts from 'esrap/languages/ts';

export type Options = {
	getLeadingComments?: NonNullable<Parameters<typeof ts>[0]>['getLeadingComments'] | undefined;
	getTrailingComments?: NonNullable<Parameters<typeof ts>[0]>['getTrailingComments'] | undefined;
};
