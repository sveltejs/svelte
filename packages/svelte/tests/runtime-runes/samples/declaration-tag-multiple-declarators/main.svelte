<!-- a later declarator can reference an earlier one within the same tag... -->
{let count = $state(0), doubled = $derived(count * 2)}

<!-- ...and leading whitespace is tolerated -->
{ let quadrupled = $derived(doubled * 2) }

<button onclick={() => (count += 1)}>increment</button>
<p>count: {count}</p>
<p>doubled: {doubled}</p>
<p>quadrupled: {quadrupled}</p>
