<script>
  import Div from './div.svelte';
</script>

<div>
	<a>
		<span>Hello</span>
	</a>
</div>

<div>
	{#snippet test()}
		<a>
			<span>Hello</span>
		</a>
	{/snippet}
	{@render test()}
</div>

<Div>
  <a>
    <span>Hello</span>
  </a>
</Div>
