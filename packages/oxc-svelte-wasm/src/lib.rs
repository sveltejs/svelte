use gloo_utils::format::JsValueSerdeExt;
use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
	#[wasm_bindgen(js_namespace = console)]
	fn log(s: &str);
}

macro_rules! console_log {
	// Note that this is using the `log` function imported above during
	// `bare_bones`
	($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn parse_expression_at(index: usize, typescript: bool) -> String {
	console_error_panic_hook::set_once();
	// We need to slice the JS string at the correct byte position given the weird utf-16 encoding javascript does
	// let mut byte_position = 0usize;
	// let mut i = 0usize;
	// while i < index {
	// 	let char = source.char_code_at(i as u32) as u16;
	// 	if char <= 0x7f {
	// 		byte_position += 1;
	// 	} else if char <= 0x7ff {
	// 		byte_position += 2;
	// 	} else if (0xD800..=0xDBFF).contains(&char) {
	// 		byte_position += 4;
	// 		i += 1;
	// 	} else {
	// 		byte_position += 3;
	// 	}
	// 	i += 1;
	// }

	// let source = source.as_string().expect("Invalid UTF-16 string");

	let source = "<script>\n\timport Nested from \'./irrelevant\';\n</script>\n\n<!-- allowed in custom elements -->\n<c-e>\n    <c-e-item slot=\"allowed\"></c-e-item>\n    <c-e-item slot=\"allowed\"></c-e-item>\n</c-e>\n\n<Nested>\n\t<p slot=\"foo\">{value}</p>\n\t<p slot=\"foo\">{value}</p>\n</Nested>";
	let byte_position = index;

	let allocator = Allocator::default();
	let source_type = if typescript {
		SourceType::ts()
	} else {
		SourceType::mjs()
	};
	let source_text = source[byte_position..].to_string();

	let ret = Parser::new(&allocator, &source_text, source_type)
		.svelte_parse_expression()
		.unwrap();
	serde_json::to_string(&ret.0).unwrap()
	// JsValue::from_serde(&ret.0).unwrap()
}
