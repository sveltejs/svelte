<c/>
<c class="bar"/>
<style>
c {
    color: red;

    &.bar {
        color: yellow;
    }

    &:last-child {
        color: black;
    }

    &::before {
        color: green;
    }
}

</style>