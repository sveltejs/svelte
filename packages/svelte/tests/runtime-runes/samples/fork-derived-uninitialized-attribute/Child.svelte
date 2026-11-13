<script>
	const props = $props();
	const klass = (value) => `box ${value}`;
</script>

<button class={klass(props.label)} disabled={props.disabled}>x</button>
