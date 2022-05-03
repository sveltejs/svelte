<script>
    import { onMount } from 'svelte';
    import Child from './Child.svelte';

    let updateCounter = 0;
    let promiseResolve;
    export const done = new Promise(resolve => {
        promiseResolve = resolve;
    });
    export const getCounter = () => {
        return updateCounter;
    };

    let vals = [1, 2, 3];
    let instances = [];
    let count = 3;

    let increment = () => {
		++updateCounter;
    };

    onMount(() => {
        console.log(instances);

        count = 2;

        setTimeout(() => {
            vals = vals.reverse();

            setTimeout(promiseResolve);
        });
    });
</script>

{#each vals as val, index (val)}
    <Child bind:this={instances[index]} id={val} {count} {increment} />
{/each}
