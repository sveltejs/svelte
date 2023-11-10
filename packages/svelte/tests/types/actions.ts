import type { Action, ActionReturn } from 'svelte/action';

// ---------------- Action

const href: Action<HTMLAnchorElement> = (node) => {
	node.href = '';
	// @ts-expect-error
	node.href = 1;
};
href;

const required: Action<HTMLElement, boolean> = (_node, _param) => {};
required(null as any, true);
// @ts-expect-error (only in strict mode) boolean missing
required(null as any);
// @ts-expect-error no boolean
required(null as any, 'string');

const required1: Action<HTMLElement, boolean> = (_node, _param) => {
	return {
		update: (p) => p === true,
		destroy: () => {}
	};
};
required1;

const required2: Action<HTMLElement, boolean> = (_node) => {};
required2;

const required3: Action<HTMLElement, boolean> = (_node, _param) => {
	return {
		// @ts-expect-error comparison always resolves to false
		update: (p) => p === 'd',
		destroy: () => {}
	};
};
required3;

const optional: Action<HTMLElement, boolean | undefined> = (_node, _param?) => {};
optional(null as any, true);
optional(null as any);
// @ts-expect-error no boolean
optional(null as any, 'string');

const optional1: Action<HTMLElement, boolean | undefined> = (_node, _param?) => {
	return {
		update: (p) => p === true,
		destroy: () => {}
	};
};
optional1;

const optional2: Action<HTMLElement, boolean | undefined> = (_node) => {};
optional2;

const optional3: Action<HTMLElement, boolean | undefined> = (_node, _param) => {};
optional3;

const optional4: Action<HTMLElement, boolean | undefined> = (_node, _param?) => {
	return {
		// @ts-expect-error comparison always resolves to false
		update: (p) => p === 'd',
		destroy: () => {}
	};
};
optional4;

const no: Action<HTMLElement, undefined> = (_node) => {};
// @ts-expect-error second param
no(null as any, true);
no(null as any);
// @ts-expect-error second param
no(null as any, 'string');

const no1: Action<HTMLElement, undefined> = (_node) => {
	return {
		destroy: () => {}
	};
};
no1;

const no2: Action<HTMLElement, undefined> = (_node, _param?) => {};
no2(null as any);

const no3: Action<HTMLElement, undefined> = (_node, _param) => {};
no3;

const no4: Action<HTMLElement, undefined> = (_node) => {
	return {
		update: () => {},
		destroy: () => {}
	};
};
no4;

// ---------------- ActionReturn

const requiredReturn: ActionReturn<string> = {
	update: (p) => p.toString()
};
requiredReturn;

const optionalReturn: ActionReturn<boolean | undefined> = {
	update: (p) => {
		p === true;
		// @ts-expect-error (only in strict mode) could be undefined
		p.toString();
	}
};
optionalReturn;

const invalidProperty: ActionReturn = {
	// @ts-expect-error invalid property
	invalid: () => {}
};
invalidProperty;

type Attributes = ActionReturn<undefined, { a: string }>['$$_attributes'];
const attributes: Attributes = { a: 'a' };
attributes;
// @ts-expect-error wrong type
const invalidAttributes1: Attributes = { a: 1 };
invalidAttributes1;
// @ts-expect-error missing prop
const invalidAttributes2: Attributes = {};
invalidAttributes2;

function generic_action<T extends boolean>(_node: HTMLElement, param: T): ActionReturn<T> {
	return {
		update: (p) => p === param,
		destroy: () => {}
	};
}
generic_action;
