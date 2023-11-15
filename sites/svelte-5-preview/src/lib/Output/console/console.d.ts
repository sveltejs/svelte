export type Log = {
	level:
		| 'info'
		| 'warn'
		| 'error'
		| 'table'
		| 'group'
		| 'trace'
		| 'assert'
		| 'clear'
		| 'unclonable';
	action?: 'console';
	args?: any[];
	collapsed?: boolean;
	count?: number;
	logs?: Log[];
	stack?: string;
	label?: string;
};
