import { SvelteComponent } from './Component';

const dev$context = {
	block: null,
	component: null,
};
abstract class Dev$ {
	self;
	parent_block = dev$context.block;
	parent_component = dev$context.component;
	constructor(self) {
		this.self = self;
	}
	abstract add(type, payload): void;
	abstract subscribers: {}[];
	dispatch(type, payload: any) {
		this.add(type, payload);
		this.subscribers.forEach((subscriber) => {
			if (type in subscriber) subscriber[type](payload);
		});
	}
	subscribe(subscriber) {
		this.subscribers.push(subscriber);
		return () => {
			const index = this.subscribers.indexOf(subscriber);
			if (~index) this.subscribers.splice(index, 1);
		};
	}
}
class Dev$Component extends Dev$ {
	self: SvelteComponent;
	block;
	add(type, payload) {}
}
class Dev$Block extends Dev$ {
	self;
	parent_block;
	parent_component;
	elements: Dev$Element[] = [];
}
class Dev$Element extends Dev$ {
	component;
	node;
	parent;
	children = [];
	attributes: {};
	eventListeners: {};
	style: {};
	class: {};
	add(type, payload) {}
	subscribers: Dev$ElementSubscriber[] = [];
	dispatch(type, payload: any) {
		this.add(type, payload);
		this.subscribers.forEach((subscriber) => {
			if (type in subscriber) subscriber[type](payload);
		});
	}
	subscribe(subscriber) {
		this.subscribers.push(subscriber);
		return () => {
			const index = this.subscribers.indexOf(subscriber);
			if (~index) this.subscribers.splice(index, 1);
		};
	}
}
interface Dev$ElementSubscriber {
	onMount(payload): void;
	onUnmount(payload): void;
	setAttribute(payload): void;
	removeAttribute(payload): void;
	addEventListener(payload): void;
	removeEventListener(payload): void;
	addClass(payload): void;
	removeClass(payload): void;
	addStyle(payload): void;
	removeStyle(payload): void;
}

const dev$dispatch =
	__DEV__ &&
	!__TEST__ &&
	typeof window !== 'undefined' &&
	(function dev$create_hook() {
		const subscribers = [];
		const rootComponents = [];
		const hook = {
			version: __VERSION__,
			has_subscribers: false,
			subscribe(listener) {
				this.has_subscribers = true;
				subscribers.push(listener);
				if (rootComponents.length) rootComponents.forEach((component) => listener.addRootComponent(component));
				else listener.ping(`init-no-components`);
				return () => {
					const index = subscribers.indexOf(listener);
					if (~index) {
						subscribers.splice(index, 1);
						this.has_subscribers = !!subscribers.length;
						return true;
					}
					return false;
				};
			},
		};
		Object.defineProperty(window, `__SVELTE_DEVTOOLS_GLOBAL_HOOK__`, {
			enumerable: false,
			get() {
				return hook;
			},
		});
		return function update(target_type, event_type, ...values) {
			if (!hook.has_subscribers) return;
			subscribers.forEach((listener) => {
				if (target_type in listener && event_type in listener[target_type]) {
					listener[target_type][event_type](...values);
				}
			});
		};
	})();

export function dev$element(element: Element | Node | EventTarget, event: keyof ElementEventsMap, payload?: any) {
	if (__DEV__) {
		dev$dispatch(`element`, event, element, payload);
	}
}
export function dev$block(event: keyof BlockEventsMap, payload) {}
export function dev$tracing(type, value: any) {}
export function dev$assert(truthy: any, else_throw: string) {
	if (__DEV__ && !truthy) {
		throw new Error(else_throw);
	}
}

interface ElementEventsMap {
	onMount;
	onDestroy;
	setAttribute;
	removeAttribute;
	addEventListener;
	removeEventListener;
	addClass;
	removeClass;
}
interface BlockEventsMap {
	'create';
	'claim';
	'claim.failed';
}
