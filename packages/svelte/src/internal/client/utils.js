// Store the references to globals in case someone tries to monkey patch these, causing the below
// to de-opt (this occurs often when using popular extensions).
export const object_ref = Object;
export const array_ref = Array;

export const is_array = array_ref.isArray;
export const array_from = array_ref.from;
export const define_property = object_ref.defineProperty;
export const get_descriptor = object_ref.getOwnPropertyDescriptor;
export const get_descriptors = object_ref.getOwnPropertyDescriptors;
