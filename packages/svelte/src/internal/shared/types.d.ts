export type Store<V> = {
	subscribe: (run: (value: V) => void) => () => void;
	set(value: V): void;
};

export type Getters<T> = {
	[K in keyof T]: () => T[K];
};

export type Snapshot<T> = ReturnType<typeof $state.snapshot<T>>;

export type MaybePromise<T> = T | Promise<T>;

export type Transport<T> = {
	stringify: (value: T) => string;
	parse: (value: string) => T;
};

export type Resource<T> = {
	then: Promise<T>['then'];
	catch: Promise<T>['catch'];
	finally: Promise<T>['finally'];
	refresh: () => Promise<void>;
	set: (value: T) => void;
	loading: boolean;
} & (
	| {
			ready: false;
			value: undefined;
			error: undefined;
	  }
	| {
			ready: true;
			value: T;
			error: any;
	  }
);

export type GetRequestInit = Omit<RequestInit, 'method' | 'body'> & { method?: 'GET' };
