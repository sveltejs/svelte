<script>
	let animationEnded = $state(false);
	const obj = {};
</script>

<div
  {...obj}
  ontransitionend={(e) => {
     // doesnt matter
  }}
  onanimationend={(e) => {
    animationEnded = true;
  }}
>
</div>

{#if animationEnded}
	<span>
		animation ended
	</span>
{/if}
