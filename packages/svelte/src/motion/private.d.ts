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

export interface SpringOpts {
	stiffness?: number;
	damping?: number;
	precision?: number;
}

export interface SpringUpdateOpts {
	/**
	 * @deprecated Only use this for the spring store; does nothing when set on the Spring class
	 */
	hard?: any;
	/**
	 * @deprecated Only use this for the spring store; does nothing when set on the Spring class
	 */
	soft?: string | number | boolean;
	/**
	 * Only use this for the Spring class; does nothing when set on the spring store
	 */
	instant?: boolean;
	/**
	 * Only use this for the Spring class; does nothing when set on the spring store
	 */
	preserveMomentum?: number;
}

export type Updater<T> = (target_value: T, value: T) => T;

export interface TweenedOptions<T> {
	delay?: number;
	duration?: number | ((from: T, to: T) => number);
	easing?: (t: number) => number;
	interpolate?: (a: T, b: T) => (t: number) => T;
}
