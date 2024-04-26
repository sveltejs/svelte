import type { CompileOptions, File } from '../types';

export type CompileMessageData = {
	id: number;
	type: 'compile' | 'init';
	source: string;
	options: CompileOptions;
	is_entry: boolean;
	return_ast: boolean;
	svelte_url?: string;
	result: {
		js: string;
		css: string;
		ast?: import('svelte/types/compiler/interfaces').Ast;
	};
	metadata?: {
		runes: boolean;
	};
};

export type BundleMessageData = {
	uid: number;
	type: 'init' | 'bundle' | 'status';
	message: string;
	packages_url: string;
	svelte_url: string;
	files: File[];
};

export type MigrateMessageData = {
	id: number;
	result: { code: string };
	error?: string;
};
