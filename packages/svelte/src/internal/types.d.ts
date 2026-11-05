/** Anything except a function */
export type NotFunction<T> = T extends Function ? never : T;

declare global {
	// devalue references this type, but it isn't included in our runtime's ES2021 lib.
	// Use an interface so it merges with the built-in declaration when checking with newer libs.
	interface Float16Array {}
}
