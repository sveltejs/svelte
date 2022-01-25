export const whitespace = /[ \t\r\n]/;
export const start_whitespace = /^[ \t\r\n]*/;
export const end_whitespace = /[ \t\r\n]*$/;

export const dimensions = /^(?:offset|client)(?:Width|Height)$/;

export const sizing_content_box = /^(?:contentRect|contentBoxSize)$/;
export const sizing_border_box = /^(?:borderBoxSize)$/;
export const sizing_device_pixel_content_box = /^(?:devicePixelContentBoxSize)$/;
