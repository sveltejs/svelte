/** @import { Snapshot } from './types' */
import { DEV } from 'esm-env';
import { STATE_SYMBOL } from '../client/constants.js';
import * as w from './warnings.js';
import * as e from '../client/errors.js';
import {
	get_prototype_of,
	is_array,
	object_prototype,
	structured_clone,
	is_object
} from './utils.js';

/**
 * In dev, we keep track of which properties could not be cloned. In prod
 * we don't bother, but we keep a dummy array around so that the
 * signature stays the same
 * @type {string[]}
 */
const empty = [];

/**
 * @template T
 * @param {T} value
 * @param {boolean} [skip_warning]
 * @returns {Snapshot<T>}
 */
export function snapshot(value, skip_warning = false) {
	if (DEV && !skip_warning) {
		/** @type {string[]} */
		const paths = [];

		const copy = clone(value, new Map(), '', paths);
		if (paths.length === 1 && paths[0] === '') {
			// value could not be cloned
			w.state_snapshot_uncloneable();
		} else if (paths.length > 0) {
			// some properties could not be cloned
			const slice = paths.length > 10 ? paths.slice(0, 7) : paths.slice(0, 10);
			const excess = paths.length - slice.length;

			let uncloned = slice.map((path) => `- <value>${path}`).join('\n');
			if (excess > 0) uncloned += `\n- ...and ${excess} more`;

			w.state_snapshot_uncloneable(uncloned);
		}

		return copy;
	}

	return clone(value, new Map(), '', empty);
}

/**
 * @template T
 * @param {T} value
 * @param {Map<T, Snapshot<T>>} cloned
 * @param {string} path
 * @param {string[]} paths
 * @param {null | T} original The original value, if `value` was produced from a `toJSON` call
 * @returns {Snapshot<T>}
 */
function clone(value, cloned, path, paths, original = null) {
	if (typeof value === 'object' && value !== null) {
		var unwrapped = cloned.get(value);
		if (unwrapped !== undefined) return unwrapped;

		if (value instanceof Map) return /** @type {Snapshot<T>} */ (new Map(value));
		if (value instanceof Set) return /** @type {Snapshot<T>} */ (new Set(value));

		if (is_array(value)) {
			var copy = /** @type {Snapshot<any>} */ (Array(value.length));
			cloned.set(value, copy);

			if (original !== null) {
				cloned.set(original, copy);
			}

			for (var i = 0; i < value.length; i += 1) {
				var element = value[i];
				if (i in value) {
					copy[i] = clone(element, cloned, DEV ? `${path}[${i}]` : path, paths);
				}
			}

			return copy;
		}

		if (get_prototype_of(value) === object_prototype) {
			/** @type {Snapshot<any>} */
			copy = {};
			cloned.set(value, copy);

			if (original !== null) {
				cloned.set(original, copy);
			}

			for (var key in value) {
				// @ts-expect-error
				copy[key] = clone(value[key], cloned, DEV ? `${path}.${key}` : path, paths);
			}

			return copy;
		}

		if (value instanceof Date) {
			return /** @type {Snapshot<T>} */ (structured_clone(value));
		}

		if (typeof (/** @type {T & { toJSON?: any } } */ (value).toJSON) === 'function') {
			return clone(
				/** @type {T & { toJSON(): any } } */ (value).toJSON(),
				cloned,
				DEV ? `${path}.toJSON()` : path,
				paths,
				// Associate the instance with the toJSON clone
				value
			);
		}
	}

	if (value instanceof EventTarget) {
		// can't be cloned
		return /** @type {Snapshot<T>} */ (value);
	}

	try {
		return /** @type {Snapshot<T>} */ (structured_clone(value));
	} catch (e) {
		if (DEV) {
			paths.push(path);
		}

		return /** @type {Snapshot<T>} */ (value);
	}
}

// Patches `structuredClone` to error on `$state` proxies
if ('structuredClone' in globalThis) { // pretty sure this should be patched everywhere, correct this if i'm wrong
	/**
	 * Creates a deep clone of an object.
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/structuredClone)
	 * @template T
	 * @param {T} value
	 * @param {StructuredSerializeOptions} [options]
	 * @returns {T}
	 */
	//@ts-expect-error
	globalThis.structuredClone = function structuredClone(value, options) {
		//@ts-expect-error
		if (is_object(value) && STATE_SYMBOL in value) {
			e.structured_clone_state_proxy();
		}
		return structured_clone(value, options);
	};
}
// here's an alternative option, that has its own (somewhat spec-compliant) implementation of structuredClone
/**
 * @type {Map<any, any>}
 *
 * keeps a record of objects to prevent recursion caused by circular references
 * > Key: an object that might be a circular reference
 * Value: the value to replace the key with
 */
let clone_stack = new Map();
// I know it's not technically a stack, but "clone stack"/"stack initiator" sounds better than "clone record"/"record initiator"
/**@type {any} */
let stack_initiator = null;
/**
 * Creates a deep clone of an object.
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/structuredClone)
 * @template T
 * @param {T} value
 * @param {StructuredSerializeOptions} [options]
 * @returns {T}
 */
function other_structured_clone(value, options) {
	/**
	 * Current limitations
	 * - Cannot detect proxies (other than those created by `$state`)
	 * - Not all transferable objects are supported (https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects)
	 * - Custom class instances cannot currently be cloned
	 * 	- I'm confused because `structuredClone(globalThis)` throws, while `structuredClone(new (class{})())` works fine
	 * The following object types currently cannot be cloned, or at least synchronously cloned: (some may need more research to confirm this)
	 * - FileList
	 * - VideoFrame
	 * - AudioData
	 * - RTCEncodedAudio/VideoFrame
	 * - RTCCertificate
	 * - FencedFrameConfig
	 * - GPUCompilationMessage/Info
	 * - ImageData/Bitmap
	 * - FileSystemDirectory/FileHandle
	 * - FileSystemHandle
	 * - CryptoKey
	 * - all streams (WritableStream, ReadableStream, etc)
	 * - MIDIAccess
	 * - RTCDataChannel
	 * - MessageChannel/Port
	 * - MediaSourceHandle
	 * I don't think most people would be cloning most of these object types, but it's still a concern
	 * I also don't know what other objects would follow the spec
	 */
	/**
	 * @param {string} type
	 * @returns {never}
	 */
	function DataCloneError(type) {
		throw new DOMException(
			`Failed to execute 'structuredClone' on 'Window': ${type} could not be cloned.`,
			`DataCloneError`
		);
	}
	/**
	 * Run this before the function returns (if the function is returning an object)
	 */
	function clear_stack_initiator() {
		if (stack_initiator === value) {
			stack_initiator = null;
			clone_stack = new Map();
		}
	}
	if (typeof value === 'symbol') {
		DataCloneError(`Symbol(${value?.description})`);
	}
	if (typeof value === 'function') {
		DataCloneError(value.toString());
	}
	if (!is_object(value)) {
		return value;
	}
	if (stack_initiator === null) {
		stack_initiator = value;
		clone_stack = new Map();
	}
	// ArrayBuffer transferring (and some cloneable objects) aren't baseline/are baseline 2024, so it may not be available
	let supports = {
		transfer: 'transfer' in ArrayBuffer.prototype && 'byteLength' in ArrayBuffer.prototype,
		webTransportError: 'WebTransportError' in globalThis,
		gpuPipelineError: 'GPUPipelineError' in globalThis,
		encodedAudioChunk: 'EncodedAudioChunk' in globalThis,
		encodedVideoChunk: 'EncodedVideoChunk' in globalThis
	};
	let is_pojo = value?.constructor === Object;
	if (Array.isArray(value)) {
		/**@type {any[]} */
		let res = [];
		//@ts-ignore
		clone_stack.set(value, res);
		for (let index in value) {
			if (value[index] === value) {
				//@ts-ignore
				res.push(res);
			} else if (clone_stack.has(value[index])) {
				res.push(clone_stack.get(value[index]));
			} else {
				res.push(other_structured_clone(value[index], options));
			}
		}
		clear_stack_initiator();
		//@ts-expect-error
		return res;
	}
	if (is_pojo) {
		//@ts-ignore
		if (STATE_SYMBOL in value) {
			e.structured_clone_state_proxy();
		}
		/**@type {{[x:string]:any}} */
		let res = {};
		clone_stack.set(value, res);
		//@ts-ignore
		let entries = Object.entries(value);
		for (let [key, v] of entries) {
			if (value === v) {
				res[key] = res;
			} else if (clone_stack.has(v)) {
				res[key] = clone_stack.get(v);
			} else {
				res[key] = other_structured_clone(v, options);
			}
		}
		clear_stack_initiator();
		//@ts-expect-error
		return res;
	}
	let { transfer = [] } = options ?? {};
	let res;
	switch (value?.constructor) {
		case Set:
			res = new Set();
			clone_stack.set(value, res);
			//@ts-expect-error
			var arr = [...value];
			for (let item of arr) {
				if (item === value) {
					res.add(res);
				} else if (clone_stack.has(item)) {
					res.add(clone_stack.get(item));
				} else {
					res.add(other_structured_clone(item, options));
				}
			}
			clear_stack_initiator();
			//@ts-expect-error
			return res;
		case Map:
			res = new Map();
			clone_stack.set(value, res);
			//@ts-expect-error
			var entries = [...value.entries()];
			for (let [key, v] of entries) {
				if (key !== value) {
					if (clone_stack.has(key)) {
						key = clone_stack.get(key);
					} else {
						key = other_structured_clone(key, options);
					}
				} else {
					key = res;
				}
				if (v !== value) {
					if (clone_stack.has(v)) {
						v = clone_stack.get(v);
					} else {
						v = other_structured_clone(v, options);
					}
				} else {
					v = res;
				}
				res.set(key, v);
			}
			clear_stack_initiator();
			//@ts-expect-error
			return res;
		case Number:
		case String:
		case Date:
		case Boolean:
			res = value?.valueOf?.();
			clear_stack_initiator();
			//@ts-expect-error
			return new value.constructor(res);
		case RegExp:
			//@ts-expect-error
			var { source, flags } = value;
			res = new RegExp(source, flags);
			clear_stack_initiator();
			//@ts-ignore
			return res;
		case Error:
		case TypeError:
		case EvalError:
		case ReferenceError:
		case SyntaxError:
		case RangeError:
		case URIError:
		case DOMException:
			//@ts-expect-error
			var { name, message, stack, cause } = value; // not sure if error.cause should be cloned as well
			//@ts-ignore
			res = new value.constructor(message, name, cause !== undefined ? { cause } : undefined);
			res.stack = stack;
			clear_stack_initiator();
			return res;
		case ArrayBuffer:
			//@ts-ignore
			if (transfer.includes(value) && supports.transfer) {
				//@ts-expect-error
				res = value.transfer();
			} else {
				//@ts-expect-error
				res = value.slice(0);
			}
			clear_stack_initiator();
			return res;
		case DataView:
		case Int8Array:
		case Int16Array:
		case Int32Array:
		case Uint8Array:
		case Uint8ClampedArray:
		case Uint16Array:
		case Uint32Array:
		case BigUint64Array:
		case BigInt64Array:
		case Float32Array:
		case Float64Array:
			//@ts-expect-error
			var { /**@type {ArrayBuffer} */ buffer } = value;
			if (transfer.includes(buffer) && supports.transfer) {
				res = buffer.transfer();
			} else {
				res = buffer?.slice?.(0);
			}
			//@ts-ignore
			res = new value.constructor(res);
			clear_stack_initiator();
			return res;
		case Blob:
			//@ts-expect-error
			res = value.slice(0);
			clear_stack_initiator();
			return res;
		case File:
			//@ts-expect-error
			res = new File([value.slice(0)], value.name);
			clear_stack_initiator();
			//@ts-ignore
			return res;
		case DOMPoint:
		case DOMPointReadOnly:
			//@ts-expect-error
			var { x, y, z, w } = value;
			//@ts-expect-error
			res = new value.constructor(x, y, z, w);
			clear_stack_initiator();
			//@ts-ignore
			return res;
		case DOMMatrix:
		case DOMMatrixReadOnly:
			//@ts-expect-error
			var { m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 } =
				value;
			//@ts-expect-error
			res = new value.constructor([
				m11,
				m12,
				m13,
				m14,
				m21,
				m22,
				m23,
				m24,
				m31,
				m32,
				m33,
				m34,
				m41,
				m42,
				m43,
				m44
			]);
			clear_stack_initiator();
			return res;
		case DOMQuad:
			//@ts-expect-error
			var { p1, p2, p3, p4 } = value;
			p1 = other_structured_clone(p1);
			p2 = other_structured_clone(p2);
			p3 = other_structured_clone(p3);
			p4 = other_structured_clone(p4);
			//@ts-expect-error
			res = new value.constructor(p1, p2, p3, p4);
			clear_stack_initiator();
			return res;
		case DOMRect:
		case DOMRectReadOnly:
			//@ts-expect-error
			var { x: x1, y: y1, width, height } = value;
			//@ts-expect-error
			res = new value.constructor(x1, y1, width, height);
			clear_stack_initiator();
			return res;
		default:
			//@ts-ignore
			if (supports.webTransportError && value.constructor === WebTransportError) {
				let { streamErrorCode, message } = value;
				res = new WebTransportError(message, { streamErrorCode });
				clear_stack_initiator();
				//@ts-ignore
				return res;
				//@ts-ignore - typescript freaks out because GPUPipelineError isn't baseline
			} else if (supports.gpuPipelineError && value.constructor === GPUPipelineError) {
				//@ts-ignore
				let { reason, message } = value;
				//@ts-ignore
				res = new GPUPipelineError(message, { reason });
				clear_stack_initiator();
				return res;
			} else if (
				//@ts-ignore
				(supports.encodedAudioChunk && value.constructor === EncodedAudioChunk) ||
				//@ts-ignore
				(supports.encodedVideoChunk && value.constructor === EncodedVideoChunk)
			) {
				let { type, timestamp, duration, byteLength } = value;
				let buffer = new ArrayBuffer(byteLength);
				//@ts-ignore
				value.copyTo(buffer);
				//@ts-expect-error
				res = new value.constructor({
					type,
					timestamp,
					duration,
					data: buffer,
					transfer: [buffer]
				});
				clear_stack_initiator();
				//@ts-ignore
				return res;
			}
	}
	clear_stack_initiator();
	//@ts-expect-error
	return {};
}
