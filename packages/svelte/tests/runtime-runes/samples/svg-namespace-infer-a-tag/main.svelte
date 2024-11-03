<script>
  import Svg from './svg.svelte';
</script>

<svg>
	<a>
		<text>Hello</text>
	</a>
</svg>

<svg>
	{#snippet test()}
		<a>
			<text>Hello</text>
		</a>
	{/snippet}
	{@render test()}
</svg>

<Svg>
  <a>
    <text>Hello</text>
  </a>
</Svg>
