<script>
	const { text } = $props();

	let boundParagraph = $state();

	export function changeBackgroundToRed() {
		boundParagraph.style.backgroundColor = 'red';
	}
</script>

<p bind:this={boundParagraph}>
	{text}
</p>
