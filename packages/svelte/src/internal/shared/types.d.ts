export type Store<V> = {
	subscribe: (run: (value: V) => void) => () => void;
	set(value: V): void;
};

export type Getters<T> = {
	[K in keyof T]: () => T[K];
};

export type Snapshot<T> = ReturnType<typeof $state.snapshot<T>>;

export type MaybePromise<T> = T | Promise<T>;

export type Transport<T> =
	| {
			stringify: (value: T) => string;
			parse?: undefined;
	  }
	| {
			stringify?: undefined;
			parse: (value: string) => T;
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
