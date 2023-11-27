<button>
    <div class="foo"/>
    <div class="bar">
        <div class="hello"/>
    </div>
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

    & .bar {
        & .hello {
            color: orange;
        }
    }

    color: black;
}
</style>