const win = typeof window !== 'undefined' ? window : global;

const {
	// ecmascript
	Error,
	JSON,
	Map,
	Object,
	console,
	isNaN,

	// dom
	cancelAnimationFrame,
	clearTimeout,
	customElements,
	document,
	getComputedStyle,
	navigator,
	requestAnimationFrame,
	setTimeout: export_setTimeout // TODO: remove when upgrading typescript, bug
} = win as unknown as typeof globalThis;

export {
	// ecmascript
	Error,
	JSON,
	Map,
	Object,
	console,
	isNaN,

	// dom
	cancelAnimationFrame,
	clearTimeout,
	customElements,
	document,
	getComputedStyle,
	navigator,
	requestAnimationFrame,
	export_setTimeout as setTimeout,
	win as window,
};
