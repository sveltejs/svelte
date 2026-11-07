export interface TickContext {
	inv_mass: number;
	recovery_rate: number;
	dt: number;
	opts: {
		stiffness: number;
		damping: number;
		precision: number;
	};
	settled: boolean;
}

export interface SpringState<T> {
	last: T;
	current: T;
	target: T;
	time: number;
	pending_recovery_rate?: number;
}
