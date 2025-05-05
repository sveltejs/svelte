export * from './index.js';

export interface Tool {
	name: string;
	icon: string; // url or svg
	activate:()=>void;
	deactivate:()=>void;
	keyCombo?: string;
	disabled?: boolean;
}
type ToolFn = ()=>Tool

export interface Config {
	position?: 'top' | 'bottom';
	tools?: (Tool | ToolFn)[];
}
