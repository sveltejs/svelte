import jsdom from 'jsdom';
export {};
declare global {
	namespace NodeJS {
		interface Global {
			document: Document;
			window: jsdom.DOMWindow;
			navigator: Navigator;
			getComputedStyle: jsdom.DOMWindow['getComputedStyle'];
			requestAnimationFrame: any;
		}
	}
}
