<script>
	let animationEnded = $state(false);
	const obj = {};
</script>

<div
  {...obj}
  class="test"
  ontransitionend={(e) => {
     // doesnt matter
  }}
  onanimationend={(e) => {
    animationEnded = true;
  }}
>
</div>

{#if animationEnded}
	<span class="result">
		animation ended
	</span>
{/if}

<style>
	.test {
	  width: 10rem;
	  height: 10rem;
	  background-color: red;
	  animation: test-animation 10ms;
	}
	@keyframes test-animation {
	    from {
	      opacity: 0;
	    }
	    to {
	      opacity: 1;
	    }
	}
</style>