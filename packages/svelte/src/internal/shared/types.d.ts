export type Store<V> = {
	subscribe: (run: (value: V) => void) => () => void;
	set(value: V): void;
};

export type Getters<T> = {
	[K in keyof T]: () => T[K];
};

export type Snapshot<T> = ReturnType<typeof $state.snapshot<T>>;

export type MaybePromise<T> = T | Promise<T>;

/** Decode a value. The value will be whatever the evaluated JavaScript emitted by the corresponding {@link Encode} function evaluates to. */
export type Decode<T> = (value: any) => T;

/** Encode a value as a string. The string should be _valid JavaScript code_ -- for example, the output of `devalue`'s `uneval` function. */
export type Encode<T> = (value: T) => string;

/**
 * Custom encode and decode options. This must be used in combination with an environment variable to enable treeshaking, eg:
 * ```ts
 * import { BROWSER } from 'esm-env';
 * const transport: Transport<MyType> = BROWSER ? { decode: myDecodeFunction } : { encode: myEncodeFunction };
 * ```
 */
export type Transport<T> =
	| {
			encode: Encode<T>;
			decode?: undefined;
	  }
	| {
			encode?: undefined;
			decode: Decode<T>;
	  };
