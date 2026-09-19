/** Anything except a function */
export type NotFunction<T> = T extends Function ? never : T;

declare global {
	// @ts-ignore devalue has it in its types, but it's not part of the standard lib at the version our runtime is.
	// We're not actually doing anything with it so we silence the error this ay
	type Float16Array = any;
}
