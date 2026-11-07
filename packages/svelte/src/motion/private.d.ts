export interface TickContext {
	inv_mass: number;
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
}
