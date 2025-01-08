import { BROWSER } from 'esm-env';
import { on } from '../../events/index.js';
import { ReactiveValue } from '../reactive-value.js';
import { get } from '../../internal/client/index.js';
import { set, source } from '../../internal/client/reactivity/sources.js';

/**
 * `scrollX.current` is a reactive view of `window.scrollX`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const scrollX = new ReactiveValue(
	BROWSER ? () => window.scrollX : () => undefined,
	(update) => on(window, 'scroll', update)
);

/**
 * `scrollY.current` is a reactive view of `window.scrollY`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const scrollY = new ReactiveValue(
	BROWSER ? () => window.scrollY : () => undefined,
	(update) => on(window, 'scroll', update)
);

/**
 * `innerWidth.current` is a reactive view of `window.innerWidth`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const innerWidth = new ReactiveValue(
	BROWSER ? () => window.innerWidth : () => undefined,
	(update) => on(window, 'resize', update)
);

/**
 * `innerHeight.current` is a reactive view of `window.innerHeight`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const innerHeight = new ReactiveValue(
	BROWSER ? () => window.innerHeight : () => undefined,
	(update) => on(window, 'resize', update)
);

/**
 * `outerWidth.current` is a reactive view of `window.outerWidth`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const outerWidth = new ReactiveValue(
	BROWSER ? () => window.outerWidth : () => undefined,
	(update) => on(window, 'resize', update)
);

/**
 * `outerHeight.current` is a reactive view of `window.outerHeight`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const outerHeight = new ReactiveValue(
	BROWSER ? () => window.outerHeight : () => undefined,
	(update) => on(window, 'resize', update)
);

/**
 * `screenLeft.current` is a reactive view of `window.screenLeft`. It is updated inside a `requestAnimationFrame` callback. On the server it is `undefined`.
 * @since 5.11.0
 */
export const screenLeft = new ReactiveValue(
	BROWSER ? () => window.screenLeft : () => undefined,
	(update) => {
		let value = window.screenLeft;

		let frame = requestAnimationFrame(function check() {
			frame = requestAnimationFrame(check);

			if (value !== (value = window.screenLeft)) {
				update();
			}
		});

		return () => {
			cancelAnimationFrame(frame);
		};
	}
);

/**
 * `screenTop.current` is a reactive view of `window.screenTop`. It is updated inside a `requestAnimationFrame` callback. On the server it is `undefined`.
 * @since 5.11.0
 */
export const screenTop = new ReactiveValue(
	BROWSER ? () => window.screenTop : () => undefined,
	(update) => {
		let value = window.screenTop;

		let frame = requestAnimationFrame(function check() {
			frame = requestAnimationFrame(check);

			if (value !== (value = window.screenTop)) {
				update();
			}
		});

		return () => {
			cancelAnimationFrame(frame);
		};
	}
);

/**
 * `online.current` is a reactive view of `navigator.onLine`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const online = new ReactiveValue(
	BROWSER ? () => navigator.onLine : () => undefined,
	(update) => {
		const unsub_online = on(window, 'online', update);
		const unsub_offline = on(window, 'offline', update);
		return () => {
			unsub_online();
			unsub_offline();
		};
	}
);

/**
 * `devicePixelRatio.current` is a reactive view of `window.devicePixelRatio`. On the server it is `undefined`.
 * Note that behaviour differs between browsers — on Chrome it will respond to the current zoom level,
 * on Firefox and Safari it won't.
 * @type {{ get current(): number | undefined }}
 * @since 5.11.0
 */
export const devicePixelRatio = /* @__PURE__ */ new (class DevicePixelRatio {
	#dpr = source(BROWSER ? window.devicePixelRatio : undefined);

	#update() {
		const off = on(
			window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`),
			'change',
			() => {
				set(this.#dpr, window.devicePixelRatio);

				off();
				this.#update();
			}
		);
	}

	constructor() {
		if (BROWSER) {
			this.#update();
		}
	}

	get current() {
		get(this.#dpr);
		return BROWSER ? window.devicePixelRatio : undefined;
	}
})();
