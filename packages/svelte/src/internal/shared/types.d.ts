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

/** Make the result of a function hydratable. This means it will be serialized on the server and available synchronously during hydration on the client. */
export type Hydratable = {
	<T>(
		/**
		 * A key to identify this hydratable value. Each hydratable value must have a unique key.
		 * If writing a library that utilizes `hydratable`, prefix your keys with your library name to prevent naming collisions.
		 */
		key: string,
		/**
		 * A function that returns the value to be hydrated. On the server, this value will be stashed and serialized.
		 * On the client during hydration, the value will be used synchronously instead of invoking the function.
		 */
		fn: () => T,
		options?: { transport?: Transport<T> }
	): T;
	/** Get a hydratable value from the server-rendered store. If used after hydration, will always return `undefined`. Only works on the client. */
	get: <T>(key: string, options?: { decode?: Decode<T> }) => T | undefined;
	/** Check if a hydratable value exists in the server-rendered store. */
	has: (key: string) => boolean;
	/** Set a hydratable value. Only works on the server during `render`. */
	set: <T>(key: string, value: T, options?: { encode?: Encode<T> }) => void;
};
