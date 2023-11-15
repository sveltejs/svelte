<script>
    import { state, effect } from './store.js';

    let foo = $state(0); // foo = 1
    $effect(() => { throw new Error('Shouldnt be called')});

    function bar($derived, $effect) {
        const x = $derived(foo + 1); // x = 3
        $effect(() => { throw new Error('Shouldnt be called')});
        return {
            get x() { return x + $derived(0) /* == 4 */ },
            get y() { return $effect(() => { throw new Error('Shouldnt be called')}); /* == 0 */ }
        }
    }

    const baz = bar($state, $effect);
</script>

<p>{foo} {baz.x} {baz.y}</p>
<button on:click={() => foo = 5}>Shouldnt be reactive</button>
