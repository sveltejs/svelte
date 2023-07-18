import { CompileOptions } from '../../interfaces.js';

export interface RenderOptions extends CompileOptions {
	locate: (c: number) => { line: number; column: number };
	head_id?: string;
	has_added_svelte_hash?: boolean;
}
