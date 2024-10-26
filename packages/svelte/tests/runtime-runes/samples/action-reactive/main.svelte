<script>
	import Child from "./Child.svelte";

    let action = $state();
    let value = $state(0);

    function action1(node, value) {
        node.innerText="action1 value=" + value;
        return {
            update(new_value) {
                node.innerText="action1 updated=" + new_value;
            },
            destroy() {
                node.innerText="action1 destroyed";
            }
        }
    }

    function action2(node, value) {
        node.innerText=value;
        return {
            update(new_value) {
                node.innerText=new_value;
            },
            destroy() {
                node.innerText="";
            }
        }
    }
</script>

<Child {action} {value}/>
<button onclick={()=>action=action1}>set_action1</button>
<button onclick={()=>action=action2}>set_action2</button>
<button onclick={()=>action=null}>set_null</button>
<button onclick={()=>value++}>increment</button>
