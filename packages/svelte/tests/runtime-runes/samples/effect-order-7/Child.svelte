<script module>
	let object = $state();

	export function open() {
		object = { nested: { boolean: true } };
	}

	export function close() {
		object = undefined;
	}
</script>

<script>
	let { children } = $props();
</script>

{#if object?.nested}
	<!-- error occurs here, this is executed when the if should already make it falsy -->
	{@render children(object.nested)}
{/if}
