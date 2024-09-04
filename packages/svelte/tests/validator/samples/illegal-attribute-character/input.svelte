<script>
    import C from './irrelevant';
</script>

<button on:click aria-label="Button"></button>
<button xml:click aria-label="Button"></button>
<button xmlns:click aria-label="Button"></button>
<button xlink:click aria-label="Button"></button>
<C on:click />
<C xml:click />
<C xmlns:click />
<C xlink:click />

<button foo:bar aria-label="Button"></button>
<C foo:bar />
