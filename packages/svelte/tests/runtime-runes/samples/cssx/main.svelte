<script>
	import Child1 from "./child1.svelte";
    import Child2 from "./child2.svelte";

    // font-size:2em; color:red; --my-var: 0
    let style1 = {'font-size': '2em', 'background': null, 'color': 'red', '--my-var': 0};
    // font-size:2em; color:red; --MY-VAR: 0
    let style2 = {'FONT-SIZE': '2em', 'COLOR': 'red', '--MY-VAR': 0};
    // font-size:2em; color:red; --MyVar: 0
    let style3 = {fontSize: '2em', Color: 'red', '--MyVar': 0};
    // font-size:2em; color:red; --my-var: 0
    let style4 = {font_size: '2em', color: 'red', __my_var: 0};
    // font-weight: bold; border-width: 3px; border-color: blue;COLOR: red
    let style5 = ['', 'font-weight: bold', null, 'border-width: 3px; border-color: blue', undefined, 'COLOR: red'];
    // font-size:2em; color:red; --my-var: 0; font-weight: bold; border-width: 3px; border-color: blue; COLOR: red; opacity: 0
    let style6 = [ style4, [style5, 'opacity: 0']];
    // font-size:2em; color:red; --my-var: 0; font-weight: bold; border-width: 3px; border-color: blue; COLOR: red; opacity: 0
    let spread = {style: style6};

    let __bg_color = $state('red');
    let display = $state();
    let opacity = $state(0.5);
    let font_size = $state('1em');
</script>

<div style={style1}>style1</div>
<div style={style2}>style2</div>
<div style={style3}>style3</div>
<div style={style4}>style4</div>
<div style={style5}>style5</div>
<div style={style6}>style6</div>
<div {...spread}>spread</div>
<div style={{__bg_color,display,opacity,font_size}}></div>

<Child1 style={style1}>style1</Child1>
<Child1 style={style2}>style2</Child1>
<Child1 style={style3}>style3</Child1>
<Child1 style={style4}>style4</Child1>
<Child1 style={style5}>style5</Child1>
<Child1 style={style6}>style6</Child1>
<Child1 {...spread}>spread</Child1>
<Child1 style={{__bg_color,display,opacity,font_size}}></Child1>

<Child2 style={style1}>style1</Child2>
<Child2 style={style2}>style2</Child2>
<Child2 style={style3}>style3</Child2>
<Child2 style={style4}>style4</Child2>
<Child2 style={style5}>style5</Child2>
<Child2 style={style6}>style6</Child2>
<Child2 {...spread}>spread</Child2>
<Child2 style={{__bg_color,display,opacity,font_size}}></Child2>

<applied-to-custom-element style={style1}>style1</applied-to-custom-element>
<applied-to-custom-element style={style2}>style2</applied-to-custom-element>
<applied-to-custom-element style={style3}>style3</applied-to-custom-element>
<applied-to-custom-element style={style4}>style4</applied-to-custom-element>
<applied-to-custom-element style={style5}>style5</applied-to-custom-element>
<applied-to-custom-element style={style6}>style6</applied-to-custom-element>
<applied-to-custom-element {...spread}>spread</applied-to-custom-element>
<applied-to-custom-element style={{__bg_color,display,opacity,font_size}}></applied-to-custom-element>

<button onclick={() => {
    __bg_color = 'blue';
    display = 'inline-block';
    opacity = 0.75;
    font_size = null;
}}>update</button>


