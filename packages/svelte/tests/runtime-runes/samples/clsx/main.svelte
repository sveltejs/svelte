<script>
	import Child from "./child.svelte";

    let foo = $state('foo');
    let bar = $state(null);
    let spread = { class: { foo: true, bar: false } };
</script>

<div class={{ foo: true, bar: false }}></div>
<div class={['foo', false && 'bar']}></div>
<div class={{ foo, bar }}></div>
<div class={[ foo, bar ]}></div>
<div {...spread}></div>

<Child class={{ foo: true, bar: false }} />
<Child class={['foo', false && 'bar']} />
<Child class={{ foo, bar }} />
<Child class={[ foo, bar ]} />
<Child {...spread} />

<applied-to-custom-element class={{ foo, bar }}></applied-to-custom-element>

<button onclick={() => {
    foo = null;
    bar = 'bar';
}}>update</button>

<style>
    .foo {
        color: red;
    }
    .bar {
        color: blue;
    }
</style>
