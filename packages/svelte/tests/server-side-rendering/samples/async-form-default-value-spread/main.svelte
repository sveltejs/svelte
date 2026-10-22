<script>
	async function props() {
		return { defaultValue: '\n<hello & goodbye>' };
	}
</script>

<textarea {...await props()}></textarea>
<svelte:element this={await Promise.resolve('textarea')} {...await props()} />
<svelte:element this={await Promise.resolve('input')} {...await Promise.resolve({ type: 'checkbox', defaultChecked: true })} />
