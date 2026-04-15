import { isStateProxy } from 'svelte/reactivity';

const unknown_value: unknown = {};
const is_proxy: boolean = isStateProxy(unknown_value);

// Keep these values used so strict checks stay happy
is_proxy;

// @ts-expect-error requires exactly one argument
isStateProxy();
