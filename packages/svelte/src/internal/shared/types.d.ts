export type Store<V> = {
	subscribe: (run: (value: V) => void) => () => void;
	set(value: V): void;
};

export type SourceLocation =
	| [line: number, column: number]
	| [line: number, column: number, SourceLocation[]];

type Primitive = string | number | boolean | null | undefined;

type TypedArray =
	| Int8Array
	| Uint8Array
	| Uint8ClampedArray
	| Int16Array
	| Uint16Array
	| Int32Array
	| Uint32Array
	| Float32Array
	| Float64Array
	| BigInt64Array
	| BigUint64Array;

/** The things that `structuredClone` can handle — https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm */
type Cloneable =
	| ArrayBuffer
	| DataView
	| Date
	| Error
	| Map<any, any>
	| RegExp
	| Set<any>
	| TypedArray
	// web APIs
	| Blob
	| CryptoKey
	| DOMException
	| DOMMatrix
	| DOMMatrixReadOnly
	| DOMPoint
	| DOMPointReadOnly
	| DOMQuad
	| DOMRect
	| DOMRectReadOnly
	| File
	| FileList
	| FileSystemDirectoryHandle
	| FileSystemFileHandle
	| FileSystemHandle
	| ImageBitmap
	| ImageData
	| RTCCertificate
	| VideoFrame;

/** Turn `SvelteDate`, `SvelteMap` and `SvelteSet` into their non-reactive counterparts. (`URL` is uncloneable.) */
type NonReactive<T> = T extends Date
	? Date
	: T extends Map<infer K, infer V>
		? Map<K, V>
		: T extends Set<infer K>
			? Set<K>
			: T;

export type Snapshot<T> = T extends Primitive
	? T
	: T extends Cloneable
		? NonReactive<T>
		: T extends { toJSON(): infer R }
			? R
			: T extends Array<infer U>
				? Array<Snapshot<U>>
				: T extends object
					? T extends { [key: string]: any }
						? { [K in keyof T]: Snapshot<T[K]> }
						: never
					: never;
