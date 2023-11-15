/**
 * Anything except a function
 */
export type NotFunction<T> = T extends Function ? never : T;
