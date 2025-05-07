import type { Component } from 'svelte';

export * from './index.js';

export interface Tool {
	name: string;
	icon: string; // TODO: url or svg
	activate: () => void;
	deactivate: () => void;
	keyCombo?: string;
	disabled?: boolean;
	component?: Component;
}
type ToolFn = () => Tool;

export interface Config {
	position?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left';
	tools?: (Tool | ToolFn)[];
}

export interface ResolvedConfig extends Config {
	tools: Tool[];
}
