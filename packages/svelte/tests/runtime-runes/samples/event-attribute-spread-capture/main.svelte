<script>
	let captured = $state(false);

	const properties = {
		/** @param {MouseEvent} event */
		onclickcapture: (event) => {
			captured = event.eventPhase === event.CAPTURING_PHASE;
		}
	};
</script>

<div {...properties}>
	<button>click me</button>
	<p>captured: {captured}</p>
</div>
