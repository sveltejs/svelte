import { getContext, setContext, type ContextKey } from 'svelte';

const context_key: ContextKey<boolean> = Symbol('foo');
// @ts-expect-error
const context_key_wrong: ContextKey<boolean> = true;

setContext(context_key, true);
// @ts-expect-error
setContext(context_key, '');

const ok_1: boolean | undefined = getContext(context_key);
const sadly_ok: string = getContext<string>(context_key); // making this an error at some point would be good; requires a breaking change
// @ts-expect-error
const not_ok_1: boolean = getContext(context_key);
// @ts-expect-error
const not_ok_2: string = getContext(context_key);

const any_key: any = {};

setContext(any_key, true);

const ok_2: boolean = getContext(any_key);
const ok_3: string = getContext(any_key);
const ok_4: string = getContext<string>(any_key);
// @ts-expect-error
const not_ok_3: string = getContext<boolean>(any_key);

const boolean_key = true;

setContext(boolean_key, true);
setContext<boolean>(boolean_key, true);
// @ts-expect-error
setContext<boolean>(boolean_key, '');

const ok_5: boolean = getContext(boolean_key);
const ok_6: string = getContext(boolean_key);
const ok_7: string = getContext<string>(boolean_key);
// @ts-expect-error
const not_ok_4: string = getContext<boolean>(boolean_key);
