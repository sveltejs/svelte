<button>
    <div class="foo"/>
    <div class="bar"/>
</button>
<style>
button {
    color: red;
    & > div {
        color: blue;
    }
    & .foo {
        color: yellow;
    }
    &:last-child {
        color: green;
    }
    color: black;
}
</style>