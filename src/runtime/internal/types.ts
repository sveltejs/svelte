/**
 * INTERNAL, DO NOT USE. Code may change at any time.
 */
export interface Fragment {
  key: string | null;
  first: null;
	/* create  */ c: () => void;
	/* claim   */ l: (nodes: any) => void;
	/* hydrate */ h: () => void;
	/* mount   */ m: (target: HTMLElement, anchor: any) => void;
	/* update  */ p: (ctx: T$$['ctx'], dirty: T$$['dirty']) => void;
	/* measure */ r: () => void;
	/* fix     */ f: () => void;
	/* animate */ a: () => void;
	/* intro   */ i: (local: any) => void;
	/* outro   */ o: (local: any) => void;
	/* destroy */ d: (detaching: 0 | 1) => void;
}

export type FragmentFactory = (ctx: any) => Fragment;

export interface T$$ {
	dirty: number[];
	ctx: any[];
	bound: any;
	update: () => void;
	callbacks: any;
	after_update: any[];
	props: Record<string, 0 | string>;
	fragment: null | false | Fragment;
	not_equal: any;
	before_update: any[];
	context: Map<any, any>;
	on_mount: any[];
	on_destroy: any[];
	skip_bound: boolean;
	on_disconnect: any[];
	root:Element | ShadowRoot
}
