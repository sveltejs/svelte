/** True if experimental.async=true */
export let async_mode_flag = false;
/** True if we're not certain that we only have Svelte 5 code in the compilation */
export let legacy_mode_flag = false;
/** True if $inspect.trace is used */
export let tracing_mode_flag = false;

export function enable_async_mode_flag() {
	async_mode_flag = true;
}

/** ONLY USE THIS DURING TESTING */
export function disable_async_mode_flag() {
	async_mode_flag = false;
}

export function enable_legacy_mode_flag() {
	legacy_mode_flag = true;
}

export function enable_tracing_mode_flag() {
	tracing_mode_flag = true;
}
