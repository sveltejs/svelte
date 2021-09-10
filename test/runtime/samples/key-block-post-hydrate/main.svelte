<script>
  export let sortById = true;
  let items = [
    { id: 1, name: "item 1", value: 3 },
    { id: 2, name: "item 2", value: 2 },
    { id: 3, name: "item 3", value: 1 },
  ];

  $: items = items.sort((a, b) => { return sortById ? a.id - b.id : a.value - b.value; });
</script>

<div>
  {#each items as item (item.id)}
  <div>
    {#if item.name}
      <span class="name">
        {item.name}
      </span>
    {/if}
    <span>something</span>
  </div>
  {/each}
</div>
