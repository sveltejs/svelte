<script lang="ts">
	let visible = $state(true);
</script>

<button onclick={() => (visible = false)}>hide</button>
{#if visible}
	<script>
		document.body.querySelector('.after').innerHTML = 'this should be executed';
	</script>
{/if}
<div class="after">after</div>
