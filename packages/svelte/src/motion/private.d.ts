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
