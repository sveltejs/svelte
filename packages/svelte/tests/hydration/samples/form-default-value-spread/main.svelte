<script>
	const text = Object.freeze({ defaultValue: '\n<hello & goodbye>' });
	const box = Object.freeze({ type: 'checkbox', defaultChecked: true });
	let value;
</script>

<textarea {...text}></textarea>
<textarea {...{ value: text.defaultValue }}></textarea>
<textarea {...text} bind:value></textarea>
<svelte:element this="textarea" {...text} />
<svelte:element this="textarea" value={'\n<hello & goodbye>'} />
<svelte:element this="input" {...box} />
<svelte:element this="input" type="checkbox" defaultChecked />
<svelte:element this="input" {...box} checked={false} />
