{let count = $state(0)}
{let doubled = $derived(count * 2)}
<button onclick={() => (count += 1)}>{count} | {doubled}</button>
