export interface Component {
	/** parent */
	p: null | Component;
	/** context */
	c: null | Map<unknown, unknown>;
	/** ondestroy */
	d: null | Array<() => void>;
	/**
	 * dev mode only: the component function
	 */
	function?: any;
}

export interface Payload {
	out: string;
	css: Set<{ hash: string; code: string }>;
	head: {
		title: string;
		out: string;
		uid: () => string;
		css: Set<{ hash: string; code: string }>;
	};
	/** Function that generates a unique ID */
	uid: () => string;
}

export interface RenderOutput {
	/** HTML that goes into the `<head>` */
	head: string;
	/** @deprecated use `body` instead */
	html: string;
	/** HTML that goes somewhere into the `<body>` */
	body: string;
}
