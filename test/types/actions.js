const nullAsAny = /** @type {any} */(null);

// ---------------- Action

/**
 * @type {import ('$runtime/action').Action<HTMLAnchorElement>}
 */
const href = (node) => {
	node.href = '';
	// @ts-expect-error
	node.href = 1;
};
href;

/**
 * @type {import ('$runtime/action').Action<HTMLAnchorElement, boolean>}
 */
const required = (node, param) => {
	node;
	param;
};
required(nullAsAny, true);
// @ts-expect-error (only in strict mode) boolean missing
required(nullAsAny);
// @ts-expect-error no boolean
required(nullAsAny, 'string');

/**
 * @type {import ('$runtime/action').Action<HTMLAnchorElement, boolean>}
 */
const required1 = (node, param) => {
	node;
	param;
	return {
		update: (p) => p === true,
		destroy: () => { }
	};
};
required1;

/**
 * @type {import ('$runtime/action').Action<HTMLElement, boolean>}
 */
const required2 = (node) => {
	node;
};
required2;

/**
 * @type {import ('$runtime/action').Action<HTMLElement, boolean>}
 */
const required3 = (node, param) => {
	node;
	param;
	return {
		// @ts-expect-error comparison always resolves to false
		update: (p) => p === 'd',
		destroy: () => { }
	};
};
required3;

/**
 * @type {import ('$runtime/action').Action<HTMLElement, boolean | undefined>}
 */
const optional = (node, param) => {
	node;
	param;
};
optional(nullAsAny, true);
optional(nullAsAny);
// @ts-expect-error no boolean
optional(nullAsAny, 'string');

/**
 * @type {import ('$runtime/action').Action<HTMLElement, boolean | undefined>}
 */
const optional1 = (node, param) => {
	node;
	param;
	return {
		update: (p) => p === true,
		destroy: () => { }
	};
};
optional1;

/**
 * @type {import ('$runtime/action').Action<HTMLElement, boolean | undefined>}
 */
const optional2 = (node) => {
	node;
};
optional2;

/**
 * @type {import ('$runtime/action').Action<HTMLElement, boolean | undefined>}
 */
const optional3 = (node, param) => {
	node;
	param;
};
optional3;

/**
 * @type {import ('$runtime/action').Action<HTMLElement, boolean | undefined>}
 */
const optional4 = (node, param) => {
	node;
	param;
	return {
		// @ts-expect-error comparison always resolves to false
		update: (p) => p === 'd',
		destroy: () => { }
	};
};
optional4;

/**
 * @type {import ('$runtime/action').Action<HTMLElement, never>}
 */
const no = (node) => {
	node;
};
// @ts-expect-error second param
no(nullAsAny, true);
no(nullAsAny);
// @ts-expect-error second param
no(nullAsAny, 'string');

/**
 * @type {import ('$runtime/action').Action<HTMLElement, never>}
 */
const no1 = (node) => {
	node;
	return {
		destroy: () => { }
	};
};
no1;

/**
 * @type {import ('$runtime/action').Action<HTMLElement, never>}
 */
// @ts-expect-error param given
const no2 = (node, param) => { };
no2;

/**
 * @type {import ('$runtime/action').Action<HTMLElement, never>}
 */
// @ts-expect-error param given
const no3 = (node, param) => { };
no3;

/**
 * @type {import ('$runtime/action').Action<HTMLElement, never>}
 */
const no4 = (_node) => {
	return {
		// @ts-expect-error update method given
		update: () => { },
		destroy: () => { }
	};
};
no4;

// ---------------- ActionReturn

/**
 * @type {import ('$runtime/action').ActionReturn<string>}
 */
const requiredReturn = {
	update: (p) => p.toString()
};
requiredReturn;

/**
 * @type {import ('$runtime/action').ActionReturn<boolean | undefined>}
 */
const optionalReturn = {
	update: (p) => {
		p === true;
		// @ts-expect-error could be undefined
		p.toString();
	}
};
optionalReturn;

/**
 * @type {import ('$runtime/action').ActionReturn}
 */
const invalidProperty = {
	// @ts-expect-error invalid property
	invalid: () => { }
};
invalidProperty;

/**
 * @typedef {import ('$runtime/action').ActionReturn<never, { a: string; }>['$$_attributes']} Attributes
 */

/**
 * @type {Attributes}
 */
const attributes = { a: 'a' };
attributes;

/**
 * @type {Attributes}
 */
// @ts-expect-error wrong type
const invalidAttributes1 = { a: 1 };
invalidAttributes1;

/**
 * @type {Attributes}
 */
// @ts-expect-error missing prop
const invalidAttributes2 = {};
invalidAttributes2;
