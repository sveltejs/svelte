/** Anything except a function */
export type NotFunction<T> = T extends Function ? never : T;

/** Helper function to detect `any` */
export type IsAny<T> = 0 extends 1 & T ? true : false;
