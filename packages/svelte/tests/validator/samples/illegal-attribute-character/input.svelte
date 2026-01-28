<script>
    import C from './irrelevant';
</script>

<button on:click>click me</button>
<button xml:click>click me</button>
<button xmlns:click>click me</button>
<button xlink:click>click me</button>
<C on:click />
<C xml:click />
<C xmlns:click />
<C xlink:click />

<button foo:bar>click me</button>
<C foo:bar />
