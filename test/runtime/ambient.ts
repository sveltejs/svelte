type Test = {
	test({ assert, component, mod, target, window, raf, compileOptions }): void | Promise<void>;
	html: string;
	skip: boolean;
};
declare module 'samples/*/_config.js' {
	export default Test;
}
