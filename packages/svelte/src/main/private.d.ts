import type { Snippet } from './public';

/**
 * Anything except a function
 */
export type NotFunction<T> = T extends Function ? never : T;

// Utility type for ensuring backwards compatibility on a type level: If there's a default slot, add 'children' to the props if it doesn't exist there already
// if you're curious why this is here and not declared as an unexported type from `public.d.ts`, try putting it there
// and see what happens in the output `index.d.ts` -- it breaks, presumably because of a TypeScript compiler bug.
export type PropsWithChildren<Props, Slots> = Props &
	(Props extends { children?: any }
		? {}
		: Slots extends { default: any }
		? { children?: Snippet<[]> }
		: {});
