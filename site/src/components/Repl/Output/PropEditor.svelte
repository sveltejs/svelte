<script>
	import { createEventDispatcher } from 'svelte';
	import * as fleece from 'golden-fleece';
	import CodeMirror from '../CodeMirror.svelte';

	const dispatch = createEventDispatcher();

	export let value;

	let error;
	let code;

	if (value === undefined) {
		code = 'undefined';
	} else {
		code = fleece.stringify(value);
		console.log({ value, code });
	}

	$: try {
		value = fleece.evaluate(code);
	} catch (e) {
		error = e;
	}

	let previous_code;

	function handleChange(event) {
		try {
			const value = fleece.evaluate(event.detail.value);
			code = previous_code = event.detail.value;
			error = null;
			dispatch('change', { value });
		} catch (e) {
			error = e;
		}
	}

	function stringify(value) {
		if (value === undefined) return '<undefined>';

		const code = previous_code
			? fleece.patch(previous_code, value)
			: fleece.stringify(value);

		previous_code = code;
		return code;
	}
</script>

<style>
	.prop-editor {
		border: 1px solid #eee;
	}

	.error {
		background-color: rgba(218, 16, 96, 0.1);
		border: 1px solid #da106e;
	}
</style>

<div class="prop-editor" class:error title="{error && error.message || ''}">
	<CodeMirror
		mode="json"
		code={stringify(value)}
		lineNumbers={false}
		on:change={handleChange}
		tab={false}
		flex
	/>
</div>