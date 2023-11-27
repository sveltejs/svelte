<button>
    Text
    <div class="xyz">
        Some text
    </div>
</button>
<style>
button {
    color: red;

    @media (max-width: 500px) {
        color: blue;
        .xyz {
            color: yellow;
        }
    }

    color: black;
}
</style>