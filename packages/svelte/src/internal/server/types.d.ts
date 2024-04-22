export interface Component {
	/** parent */
	p: null | Component;
	/** context */
	c: null | Map<unknown, unknown>;
	/** ondestroy */
	d: null | Array<() => void>;
}
