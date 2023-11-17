import { getContext, hasContext, setContext, type ContextKey } from 'svelte';

// non ContextKey still works
setContext('string', 0);
setContext(5, 0);
setContext(true, 0);
setContext({}, 0);
setContext([], 0);
setContext(Symbol(), 0);
let resGet: number;
resGet = getContext<number>('string');
resGet = getContext<number>(5);
resGet = getContext<number>(true);
resGet = getContext<number>({});
resGet = getContext<number>([]);

// because `Symbol` is structurally the same as `ContextKey`, it returns optional type
const resSymbol: number | undefined = getContext<number>(Symbol());

let resHas: boolean;
resHas = hasContext('string');
resHas = hasContext(5);
resHas = hasContext(true);
resHas = hasContext({});
resHas = hasContext([]);
resHas = hasContext(Symbol());

// ContextKey works
const stringKey: ContextKey<string> = Symbol();
setContext(stringKey, 'hello');
// @ts-expect-error: wrong type of context
setContext(stringKey, 1);
const res1: string | undefined = getContext(stringKey);
// @ts-expect-error: should be optional
const res2: string = getContext(stringKey);
if (hasContext(stringKey)) {
	const resChecked: string = getContext(stringKey);
}
// @ts-expect-error: wrong type of variable
const res3: number = getContext(stringKey);

// TODO: generic takes over the ContextKey and function signature is: `getContext<number>(key: {})`
// instead of`getContext<number>(key: ContextKey<string>)`
// // @ts-expect-error: wrong type of generic
// getContext<number>(stringKey);

// TODO: fix this
// // @ts-expect-error: wrong type of context generic
// const numberKey: ContextKey<number> = stringKey;
