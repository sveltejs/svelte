export * from './index.js';

export interface Tool {
	name: string;
	icon: string; // url or svg
	activate();
	deactivate();
	keyCombo?: string;
	disabled?: boolean;
}
export interface Config {
	position?: 'top' | 'bottom';
	tools?: Tool[];
}
