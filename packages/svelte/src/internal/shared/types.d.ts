export type Store<V> = {
	subscribe: (run: (value: V) => void) => () => void;
	set(value: V): void;
};

export type Getters<T> = {
	[K in keyof T]: () => T[K];
};

export type Snapshot<T> = ReturnType<typeof $state.snapshot<T>>;

export type MaybePromise<T> = T | Promise<T>;

export type Parse<T> = (value: string) => T;

export type Stringify<T> = (value: T) => string;

export type Transport<T> =
	| {
			stringify: Stringify<T>;
			parse?: undefined;
	  }
	| {
			stringify?: undefined;
			parse: Parse<T>;
	  };

export type Resource<T> = {
	then: Promise<T>['then'];
	catch: Promise<T>['catch'];
	finally: Promise<T>['finally'];
	refresh: () => Promise<void>;
	set: (value: T) => void;
	loading: boolean;
	error: any;
} & (
	| {
			ready: false;
			current: undefined;
	  }
	| {
			ready: true;
			current: T;
	  }
);

export type GetRequestInit = Omit<RequestInit, 'method' | 'body'> & { method?: 'GET' };

export type CacheEntry = { count: number; item: any };
