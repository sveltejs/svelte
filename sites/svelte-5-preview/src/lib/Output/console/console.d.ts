export type Log = {
	command: 'info' | 'warn' | 'error' | 'table' | 'group' | 'clear' | 'unclonable';
	action?: 'console';
	args?: any[];
	collapsed?: boolean;
	expanded?: boolean;
	count?: number;
	logs?: Log[];
	stack?: string;
	data?: any;
	columns?: string[];
};
