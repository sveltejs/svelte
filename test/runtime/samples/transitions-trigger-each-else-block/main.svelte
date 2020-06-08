<script>
   export let arr = ['a'];
   function foo(node, params){
        return { tick(t){ node.foo = t; }, duration: 100 }
   }
</script>
{#each arr as v}
    {v}
{:else}
    <div transition:foo>empty</div>
{/each}