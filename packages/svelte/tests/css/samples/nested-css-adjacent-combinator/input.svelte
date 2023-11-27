<button>
    <div class="foo"/>
</button>
<div class="abc">

</div>
<style>
button {
    color: red;

    + .abc {
        color: purple;
    }

    color: black;
}
</style>