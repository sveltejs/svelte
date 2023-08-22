/// <reference lib="dom" />
// This file is deliberately not exposed through the exports map.
// It's meant to be loaded directly by the Svelte language server
/* eslint-disable @typescript-eslint/no-empty-interface */

import * as svelteElements from './elements.js';

/**
 * @internal do not use
 */
type HTMLProps<Property extends string, Override> = Omit<
	import('./elements.js').SvelteHTMLElements[Property],
	keyof Override
> &
	Override;

declare global {
	/**
	 * This namespace does not exist in the runtime, it is only used for typings
	 */
	namespace svelteHTML {
		// Every namespace eligible for use needs to implement the following two functions
		/**
		 * @internal do not use
		 */
		function mapElementTag<K extends keyof ElementTagNameMap>(tag: K): ElementTagNameMap[K];
		function mapElementTag<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K];
		function mapElementTag(tag: any): any; // needs to be any because used in context of <svelte:element>

		/**
		 * @internal do not use
		 */
		function createElement<Elements extends IntrinsicElements, Key extends keyof Elements>(
			// "undefined | null" because of <svelte:element>
			element: Key | undefined | null,
			attrs: string extends Key ? svelteElements.HTMLAttributes<any> : Elements[Key]
		): Key extends keyof ElementTagNameMap
			? ElementTagNameMap[Key]
			: Key extends keyof SVGElementTagNameMap
			? SVGElementTagNameMap[Key]
			: any;
		function createElement<Elements extends IntrinsicElements, Key extends keyof Elements, T>(
			// "undefined | null" because of <svelte:element>
			element: Key | undefined | null,
			attrsEnhancers: T,
			attrs: (string extends Key ? svelteElements.HTMLAttributes<any> : Elements[Key]) & T
		): Key extends keyof ElementTagNameMap
			? ElementTagNameMap[Key]
			: Key extends keyof SVGElementTagNameMap
			? SVGElementTagNameMap[Key]
			: any;

		// For backwards-compatibility and ease-of-use, in case someone enhanced the typings from import('svelte/elements').HTMLAttributes/SVGAttributes
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		interface HTMLAttributes<T extends EventTarget = any> {}
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		interface SVGAttributes<T extends EventTarget = any> {}

		/**
		 * Avoid using this interface directly. Instead use the `SvelteHTMLElements` interface exported by `svelte/elements`
		 * This should only be used if you need to extend the interface with custom elements
		 */
		interface IntrinsicElements extends svelteElements.SvelteHTMLElements {
			a: HTMLProps<'a', HTMLAttributes>;
			abbr: HTMLProps<'abbr', HTMLAttributes>;
			address: HTMLProps<'address', HTMLAttributes>;
			area: HTMLProps<'area', HTMLAttributes>;
			article: HTMLProps<'article', HTMLAttributes>;
			aside: HTMLProps<'aside', HTMLAttributes>;
			audio: HTMLProps<'audio', HTMLAttributes>;
			b: HTMLProps<'b', HTMLAttributes>;
			base: HTMLProps<'base', HTMLAttributes>;
			bdi: HTMLProps<'bdi', HTMLAttributes>;
			bdo: HTMLProps<'bdo', HTMLAttributes>;
			big: HTMLProps<'big', HTMLAttributes>;
			blockquote: HTMLProps<'blockquote', HTMLAttributes>;
			body: HTMLProps<'body', HTMLAttributes>;
			br: HTMLProps<'br', HTMLAttributes>;
			button: HTMLProps<'button', HTMLAttributes>;
			canvas: HTMLProps<'canvas', HTMLAttributes>;
			caption: HTMLProps<'caption', HTMLAttributes>;
			cite: HTMLProps<'cite', HTMLAttributes>;
			code: HTMLProps<'code', HTMLAttributes>;
			col: HTMLProps<'col', HTMLAttributes>;
			colgroup: HTMLProps<'colgroup', HTMLAttributes>;
			data: HTMLProps<'data', HTMLAttributes>;
			datalist: HTMLProps<'datalist', HTMLAttributes>;
			dd: HTMLProps<'dd', HTMLAttributes>;
			del: HTMLProps<'del', HTMLAttributes>;
			details: HTMLProps<'details', HTMLAttributes>;
			dfn: HTMLProps<'dfn', HTMLAttributes>;
			dialog: HTMLProps<'dialog', HTMLAttributes>;
			div: HTMLProps<'div', HTMLAttributes>;
			dl: HTMLProps<'dl', HTMLAttributes>;
			dt: HTMLProps<'dt', HTMLAttributes>;
			em: HTMLProps<'em', HTMLAttributes>;
			embed: HTMLProps<'embed', HTMLAttributes>;
			fieldset: HTMLProps<'fieldset', HTMLAttributes>;
			figcaption: HTMLProps<'figcaption', HTMLAttributes>;
			figure: HTMLProps<'figure', HTMLAttributes>;
			footer: HTMLProps<'footer', HTMLAttributes>;
			form: HTMLProps<'form', HTMLAttributes>;
			h1: HTMLProps<'h1', HTMLAttributes>;
			h2: HTMLProps<'h2', HTMLAttributes>;
			h3: HTMLProps<'h3', HTMLAttributes>;
			h4: HTMLProps<'h4', HTMLAttributes>;
			h5: HTMLProps<'h5', HTMLAttributes>;
			h6: HTMLProps<'h6', HTMLAttributes>;
			head: HTMLProps<'head', HTMLAttributes>;
			header: HTMLProps<'header', HTMLAttributes>;
			hgroup: HTMLProps<'hgroup', HTMLAttributes>;
			hr: HTMLProps<'hr', HTMLAttributes>;
			html: HTMLProps<'html', HTMLAttributes>;
			i: HTMLProps<'i', HTMLAttributes>;
			iframe: HTMLProps<'iframe', HTMLAttributes>;
			img: HTMLProps<'img', HTMLAttributes>;
			input: HTMLProps<'input', HTMLAttributes>;
			ins: HTMLProps<'ins', HTMLAttributes>;
			kbd: HTMLProps<'kbd', HTMLAttributes>;
			keygen: HTMLProps<'keygen', HTMLAttributes>;
			label: HTMLProps<'label', HTMLAttributes>;
			legend: HTMLProps<'legend', HTMLAttributes>;
			li: HTMLProps<'li', HTMLAttributes>;
			link: HTMLProps<'link', HTMLAttributes>;
			main: HTMLProps<'main', HTMLAttributes>;
			map: HTMLProps<'map', HTMLAttributes>;
			mark: HTMLProps<'mark', HTMLAttributes>;
			menu: HTMLProps<'menu', HTMLAttributes>;
			menuitem: HTMLProps<'menuitem', HTMLAttributes>;
			meta: HTMLProps<'meta', HTMLAttributes>;
			meter: HTMLProps<'meter', HTMLAttributes>;
			nav: HTMLProps<'nav', HTMLAttributes>;
			noscript: HTMLProps<'noscript', HTMLAttributes>;
			object: HTMLProps<'object', HTMLAttributes>;
			ol: HTMLProps<'ol', HTMLAttributes>;
			optgroup: HTMLProps<'optgroup', HTMLAttributes>;
			option: HTMLProps<'option', HTMLAttributes>;
			output: HTMLProps<'output', HTMLAttributes>;
			p: HTMLProps<'p', HTMLAttributes>;
			param: HTMLProps<'param', HTMLAttributes>;
			picture: HTMLProps<'picture', HTMLAttributes>;
			pre: HTMLProps<'pre', HTMLAttributes>;
			progress: HTMLProps<'progress', HTMLAttributes>;
			q: HTMLProps<'q', HTMLAttributes>;
			rp: HTMLProps<'rp', HTMLAttributes>;
			rt: HTMLProps<'rt', HTMLAttributes>;
			ruby: HTMLProps<'ruby', HTMLAttributes>;
			s: HTMLProps<'s', HTMLAttributes>;
			samp: HTMLProps<'samp', HTMLAttributes>;
			slot: HTMLProps<'slot', HTMLAttributes>;
			script: HTMLProps<'script', HTMLAttributes>;
			section: HTMLProps<'section', HTMLAttributes>;
			select: HTMLProps<'select', HTMLAttributes>;
			small: HTMLProps<'small', HTMLAttributes>;
			source: HTMLProps<'source', HTMLAttributes>;
			span: HTMLProps<'span', HTMLAttributes>;
			strong: HTMLProps<'strong', HTMLAttributes>;
			style: HTMLProps<'style', HTMLAttributes>;
			sub: HTMLProps<'sub', HTMLAttributes>;
			summary: HTMLProps<'summary', HTMLAttributes>;
			sup: HTMLProps<'sup', HTMLAttributes>;
			table: HTMLProps<'table', HTMLAttributes>;
			template: HTMLProps<'template', HTMLAttributes>;
			tbody: HTMLProps<'tbody', HTMLAttributes>;
			td: HTMLProps<'td', HTMLAttributes>;
			textarea: HTMLProps<'textarea', HTMLAttributes>;
			tfoot: HTMLProps<'tfoot', HTMLAttributes>;
			th: HTMLProps<'th', HTMLAttributes>;
			thead: HTMLProps<'thead', HTMLAttributes>;
			time: HTMLProps<'time', HTMLAttributes>;
			title: HTMLProps<'title', HTMLAttributes>;
			tr: HTMLProps<'tr', HTMLAttributes>;
			track: HTMLProps<'track', HTMLAttributes>;
			u: HTMLProps<'u', HTMLAttributes>;
			ul: HTMLProps<'ul', HTMLAttributes>;
			var: HTMLProps<'var', HTMLAttributes>;
			video: HTMLProps<'video', HTMLAttributes>;
			wbr: HTMLProps<'wbr', HTMLAttributes>;
			webview: HTMLProps<'webview', HTMLAttributes>;
			// SVG
			svg: HTMLProps<'svg', SVGAttributes>;

			animate: HTMLProps<'animate', SVGAttributes>;
			animateMotion: HTMLProps<'animateMotion', SVGAttributes>;
			animateTransform: HTMLProps<'animateTransform', SVGAttributes>;
			circle: HTMLProps<'circle', SVGAttributes>;
			clipPath: HTMLProps<'clipPath', SVGAttributes>;
			defs: HTMLProps<'defs', SVGAttributes>;
			desc: HTMLProps<'desc', SVGAttributes>;
			ellipse: HTMLProps<'ellipse', SVGAttributes>;
			feBlend: HTMLProps<'feBlend', SVGAttributes>;
			feColorMatrix: HTMLProps<'feColorMatrix', SVGAttributes>;
			feComponentTransfer: HTMLProps<'feComponentTransfer', SVGAttributes>;
			feComposite: HTMLProps<'feComposite', SVGAttributes>;
			feConvolveMatrix: HTMLProps<'feConvolveMatrix', SVGAttributes>;
			feDiffuseLighting: HTMLProps<'feDiffuseLighting', SVGAttributes>;
			feDisplacementMap: HTMLProps<'feDisplacementMap', SVGAttributes>;
			feDistantLight: HTMLProps<'feDistantLight', SVGAttributes>;
			feDropShadow: HTMLProps<'feDropShadow', SVGAttributes>;
			feFlood: HTMLProps<'feFlood', SVGAttributes>;
			feFuncA: HTMLProps<'feFuncA', SVGAttributes>;
			feFuncB: HTMLProps<'feFuncB', SVGAttributes>;
			feFuncG: HTMLProps<'feFuncG', SVGAttributes>;
			feFuncR: HTMLProps<'feFuncR', SVGAttributes>;
			feGaussianBlur: HTMLProps<'feGaussianBlur', SVGAttributes>;
			feImage: HTMLProps<'feImage', SVGAttributes>;
			feMerge: HTMLProps<'feMerge', SVGAttributes>;
			feMergeNode: HTMLProps<'feMergeNode', SVGAttributes>;
			feMorphology: HTMLProps<'feMorphology', SVGAttributes>;
			feOffset: HTMLProps<'feOffset', SVGAttributes>;
			fePointLight: HTMLProps<'fePointLight', SVGAttributes>;
			feSpecularLighting: HTMLProps<'feSpecularLighting', SVGAttributes>;
			feSpotLight: HTMLProps<'feSpotLight', SVGAttributes>;
			feTile: HTMLProps<'feTile', SVGAttributes>;
			feTurbulence: HTMLProps<'feTurbulence', SVGAttributes>;
			filter: HTMLProps<'filter', SVGAttributes>;
			foreignObject: HTMLProps<'foreignObject', SVGAttributes>;
			g: HTMLProps<'g', SVGAttributes>;
			image: HTMLProps<'image', SVGAttributes>;
			line: HTMLProps<'line', SVGAttributes>;
			linearGradient: HTMLProps<'linearGradient', SVGAttributes>;
			marker: HTMLProps<'marker', SVGAttributes>;
			mask: HTMLProps<'mask', SVGAttributes>;
			metadata: HTMLProps<'metadata', SVGAttributes>;
			mpath: HTMLProps<'mpath', SVGAttributes>;
			path: HTMLProps<'path', SVGAttributes>;
			pattern: HTMLProps<'pattern', SVGAttributes>;
			polygon: HTMLProps<'polygon', SVGAttributes>;
			polyline: HTMLProps<'polyline', SVGAttributes>;
			radialGradient: HTMLProps<'radialGradient', SVGAttributes>;
			rect: HTMLProps<'rect', SVGAttributes>;
			stop: HTMLProps<'stop', SVGAttributes>;
			switch: HTMLProps<'switch', SVGAttributes>;
			symbol: HTMLProps<'symbol', SVGAttributes>;
			text: HTMLProps<'text', SVGAttributes>;
			textPath: HTMLProps<'textPath', SVGAttributes>;
			tspan: HTMLProps<'tspan', SVGAttributes>;
			use: HTMLProps<'use', SVGAttributes>;
			view: HTMLProps<'view', SVGAttributes>;

			// Svelte specific
			'svelte:window': HTMLProps<'svelte:window', HTMLAttributes>;
			'svelte:body': HTMLProps<'svelte:body', HTMLAttributes>;
			'svelte:document': HTMLProps<'svelte:document', HTMLAttributes>;
			'svelte:fragment': { slot?: string };
			'svelte:options': HTMLProps<'svelte:options', HTMLAttributes>;
			'svelte:head': { [name: string]: any };

			[name: string]: { [name: string]: any };
		}
	}
}
