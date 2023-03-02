<style>
  :global(input) + div { color: red; }
  :global(input) ~ div { color: red; }
  :global(input) + h1 { color: red; }
  :global(input) ~ h1 { color: red; }
  :global(input) + p { color: red; }
  :global(input) ~ p { color: red; }

  :global(input) + span { color: red; }
  :global(input) ~ span { color: red; }
</style>

<h1>Hello!</h1>

<div>
  <span>World!</span>
</div>

{#each [] as _}
  <p />
{/each}