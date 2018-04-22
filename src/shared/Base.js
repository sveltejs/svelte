import { _differsImmutable } from './utils.js';

export function blankObject() {
	return Object.create(null);
}

export class Base {
	constructor() {
		this._handlers = blankObject();
	}

	fire(eventName, data) {
		const handlers = eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (let i = 0; i < handlers.length; i += 1) {
			const handler = handlers[i];

			if (!handler.__calling) {
				handler.__calling = true;
				handler.call(this, data);
				handler.__calling = false;
			}
		}
	}

	get() {
		return this._state;
	}

	on(eventName, handler) {
		const handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function() {
				const index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
			}
		};
	}

	_differs(a, b) {
		return _differsImmutable(a, b) || ((a && typeof a === 'object') || typeof a === 'function');
	}
}