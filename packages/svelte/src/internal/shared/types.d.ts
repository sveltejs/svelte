export type Store<V> = {
	subscribe: (run: (value: V) => void) => () => void;
	set(value: V): void;
};

export type Getters<T> = {
	[K in keyof T]: () => T[K];
};

export type Snapshot<T> = ReturnType<typeof $state.snapshot<T>>;

export type MaybePromise<T> = T | Promise<T>;

export type Decode<T> = (value: any) => T;

export type Encode<T> = (value: T) => unknown;

export type Transport<T> =
	| {
			encode: Encode<T>;
			decode?: undefined;
	  }
	| {
			encode?: undefined;
			decode: Decode<T>;
	  };

export type Hydratable = {
	<T>(key: string, fn: () => T, options?: Transport<T>): T;
	get: <T>(key: string) => T | undefined;
	has: (key: string) => boolean;
	set: <T>(key: string, value: T, options?: Transport<T>) => void;
};

export type Resource<T> = {
	then: Promise<Awaited<T>>['then'];
	catch: Promise<Awaited<T>>['catch'];
	finally: Promise<Awaited<T>>['finally'];
	refresh: () => Promise<void>;
	set: (value: Awaited<T>) => void;
	loading: boolean;
	error: any;
} & (
	| {
			ready: false;
			current: undefined;
	  }
	| {
			ready: true;
			current: Awaited<T>;
	  }
);

export type GetRequestInit = Omit<RequestInit, 'method' | 'body'> & { method?: 'GET' };

export type CacheEntry = { count: number; item: any };
