<button>
    <div class="foo"/>
    <div class="bar">
        <div class="hello"/>
    </div>
</button>
<x>
    <foo>
        <x>
            <foo>
                <x>

                </x>
            </foo>
        </x>
    </foo>
</x>
<style>
button {
    color: red;
    &&& {
        color: blue;
    }
}

x {
    foo & foo & {
        color: green;
    }
}
</style>