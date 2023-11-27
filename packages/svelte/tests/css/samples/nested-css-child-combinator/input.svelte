<button>
    <div class="abc"/>
    <div class="bar">
        <div class="abc"/>
    </div>
</button>
<style>
button {
    color: red;

    > .abc {
        color: purple;
    }

    color: black;
}
</style>