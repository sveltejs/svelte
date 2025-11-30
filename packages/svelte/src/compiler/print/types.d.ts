import 'esrap'; // This import is required to make typescript happy when `skipLibCheck` is enabled
import type ts from 'esrap/languages/ts';

export type Options = {
	getLeadingComments?: NonNullable<Parameters<typeof ts>[0]>['getLeadingComments'] | undefined;
	getTrailingComments?: NonNullable<Parameters<typeof ts>[0]>['getTrailingComments'] | undefined;
};
