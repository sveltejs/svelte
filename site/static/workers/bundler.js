(function () {
	'use strict';

	/*
	  @license
		Rollup.js v1.12.4
		Mon, 27 May 2019 05:38:54 GMT - commit d4ce5065adbd0381ac81856197394198993c5775


		https://github.com/rollup/rollup

		Released under the MIT License.
	*/
	var e,t="1.12.4",n=r;function r(e,t){if(!e)throw new Error(t||"Assertion failed")}function i(e,t){return 55296==(64512&e.charCodeAt(t))&&(!(t<0||t+1>=e.length)&&56320==(64512&e.charCodeAt(t+1)))}function s(e){return (e>>>24|e>>>8&65280|e<<8&16711680|(255&e)<<24)>>>0}function o(e){return 1===e.length?"0"+e:e}function a(e){return 7===e.length?"0"+e:6===e.length?"00"+e:5===e.length?"000"+e:4===e.length?"0000"+e:3===e.length?"00000"+e:2===e.length?"000000"+e:1===e.length?"0000000"+e:e}r.equal=function(e,t,n){if(e!=t)throw new Error(n||"Assertion failed: "+e+" != "+t)};var h={inherits:(function(e){"function"==typeof Object.create?e.exports=function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}});}:e.exports=function(e,t){e.super_=t;var n=function(){};n.prototype=t.prototype,e.prototype=new n,e.prototype.constructor=e;};}(e={exports:{}},e.exports),e.exports),toArray:function(e,t){if(Array.isArray(e))return e.slice();if(!e)return [];var n=[];if("string"==typeof e)if(t){if("hex"===t)for((e=e.replace(/[^a-z0-9]+/gi,"")).length%2!=0&&(e="0"+e),s=0;s<e.length;s+=2)n.push(parseInt(e[s]+e[s+1],16));}else for(var r=0,s=0;s<e.length;s++){var o=e.charCodeAt(s);o<128?n[r++]=o:o<2048?(n[r++]=o>>6|192,n[r++]=63&o|128):i(e,s)?(o=65536+((1023&o)<<10)+(1023&e.charCodeAt(++s)),n[r++]=o>>18|240,n[r++]=o>>12&63|128,n[r++]=o>>6&63|128,n[r++]=63&o|128):(n[r++]=o>>12|224,n[r++]=o>>6&63|128,n[r++]=63&o|128);}else for(s=0;s<e.length;s++)n[s]=0|e[s];return n},toHex:function(e){for(var t="",n=0;n<e.length;n++)t+=o(e[n].toString(16));return t},htonl:s,toHex32:function(e,t){for(var n="",r=0;r<e.length;r++){var i=e[r];"little"===t&&(i=s(i)),n+=a(i.toString(16));}return n},zero2:o,zero8:a,join32:function(e,t,r,i){var s=r-t;n(s%4==0);for(var o=new Array(s/4),a=0,h=t;a<o.length;a++,h+=4){var u;u="big"===i?e[h]<<24|e[h+1]<<16|e[h+2]<<8|e[h+3]:e[h+3]<<24|e[h+2]<<16|e[h+1]<<8|e[h],o[a]=u>>>0;}return o},split32:function(e,t){for(var n=new Array(4*e.length),r=0,i=0;r<e.length;r++,i+=4){var s=e[r];"big"===t?(n[i]=s>>>24,n[i+1]=s>>>16&255,n[i+2]=s>>>8&255,n[i+3]=255&s):(n[i+3]=s>>>24,n[i+2]=s>>>16&255,n[i+1]=s>>>8&255,n[i]=255&s);}return n},rotr32:function(e,t){return e>>>t|e<<32-t},rotl32:function(e,t){return e<<t|e>>>32-t},sum32:function(e,t){return e+t>>>0},sum32_3:function(e,t,n){return e+t+n>>>0},sum32_4:function(e,t,n,r){return e+t+n+r>>>0},sum32_5:function(e,t,n,r,i){return e+t+n+r+i>>>0},sum64:function(e,t,n,r){var i=e[t],s=r+e[t+1]>>>0,o=(s<r?1:0)+n+i;e[t]=o>>>0,e[t+1]=s;},sum64_hi:function(e,t,n,r){return (t+r>>>0<t?1:0)+e+n>>>0},sum64_lo:function(e,t,n,r){return t+r>>>0},sum64_4_hi:function(e,t,n,r,i,s,o,a){var h=0,u=t;return h+=(u=u+r>>>0)<t?1:0,h+=(u=u+s>>>0)<s?1:0,e+n+i+o+(h+=(u=u+a>>>0)<a?1:0)>>>0},sum64_4_lo:function(e,t,n,r,i,s,o,a){return t+r+s+a>>>0},sum64_5_hi:function(e,t,n,r,i,s,o,a,h,u){var c=0,l=t;return c+=(l=l+r>>>0)<t?1:0,c+=(l=l+s>>>0)<s?1:0,c+=(l=l+a>>>0)<a?1:0,e+n+i+o+h+(c+=(l=l+u>>>0)<u?1:0)>>>0},sum64_5_lo:function(e,t,n,r,i,s,o,a,h,u){return t+r+s+a+u>>>0},rotr64_hi:function(e,t,n){return (t<<32-n|e>>>n)>>>0},rotr64_lo:function(e,t,n){return (e<<32-n|t>>>n)>>>0},shr64_hi:function(e,t,n){return e>>>n},shr64_lo:function(e,t,n){return (e<<32-n|t>>>n)>>>0}};function u(){this.pending=null,this.pendingTotal=0,this.blockSize=this.constructor.blockSize,this.outSize=this.constructor.outSize,this.hmacStrength=this.constructor.hmacStrength,this.padLength=this.constructor.padLength/8,this.endian="big",this._delta8=this.blockSize/8,this._delta32=this.blockSize/32;}var c=u;u.prototype.update=function(e,t){if(e=h.toArray(e,t),this.pending?this.pending=this.pending.concat(e):this.pending=e,this.pendingTotal+=e.length,this.pending.length>=this._delta8){var n=(e=this.pending).length%this._delta8;this.pending=e.slice(e.length-n,e.length),0===this.pending.length&&(this.pending=null),e=h.join32(e,0,e.length-n,this.endian);for(var r=0;r<e.length;r+=this._delta32)this._update(e,r,r+this._delta32);}return this},u.prototype.digest=function(e){return this.update(this._pad()),n(null===this.pending),this._digest(e)},u.prototype._pad=function(){var e=this.pendingTotal,t=this._delta8,n=t-(e+this.padLength)%t,r=new Array(n+this.padLength);r[0]=128;for(var i=1;i<n;i++)r[i]=0;if(e<<=3,"big"===this.endian){for(var s=8;s<this.padLength;s++)r[i++]=0;r[i++]=0,r[i++]=0,r[i++]=0,r[i++]=0,r[i++]=e>>>24&255,r[i++]=e>>>16&255,r[i++]=e>>>8&255,r[i++]=255&e;}else for(r[i++]=255&e,r[i++]=e>>>8&255,r[i++]=e>>>16&255,r[i++]=e>>>24&255,r[i++]=0,r[i++]=0,r[i++]=0,r[i++]=0,s=8;s<this.padLength;s++)r[i++]=0;return r};var l={BlockHash:c},p=h.rotr32;function d(e,t,n){return e&t^~e&n}function f(e,t,n){return e&t^e&n^t&n}function m(e,t,n){return e^t^n}var g={ft_1:function(e,t,n,r){return 0===e?d(t,n,r):1===e||3===e?m(t,n,r):2===e?f(t,n,r):void 0},ch32:d,maj32:f,p32:m,s0_256:function(e){return p(e,2)^p(e,13)^p(e,22)},s1_256:function(e){return p(e,6)^p(e,11)^p(e,25)},g0_256:function(e){return p(e,7)^p(e,18)^e>>>3},g1_256:function(e){return p(e,17)^p(e,19)^e>>>10}},y=h.sum32,x=h.sum32_4,v=h.sum32_5,E=g.ch32,_=g.maj32,b=g.s0_256,A=g.s1_256,S=g.g0_256,I=g.g1_256,w=l.BlockHash,P=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];function k(){if(!(this instanceof k))return new k;w.call(this),this.h=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],this.k=P,this.W=new Array(64);}h.inherits(k,w);var C=k;k.blockSize=512,k.outSize=256,k.hmacStrength=192,k.padLength=64,k.prototype._update=function(e,t){for(var r=this.W,i=0;i<16;i++)r[i]=e[t+i];for(;i<r.length;i++)r[i]=x(I(r[i-2]),r[i-7],S(r[i-15]),r[i-16]);var s=this.h[0],o=this.h[1],a=this.h[2],h=this.h[3],u=this.h[4],c=this.h[5],l=this.h[6],p=this.h[7];for(n(this.k.length===r.length),i=0;i<r.length;i++){var d=v(p,A(u),E(u,c,l),this.k[i],r[i]),f=y(b(s),_(s,o,a));p=l,l=c,c=u,u=y(h,d),h=a,a=o,o=s,s=y(d,f);}this.h[0]=y(this.h[0],s),this.h[1]=y(this.h[1],o),this.h[2]=y(this.h[2],a),this.h[3]=y(this.h[3],h),this.h[4]=y(this.h[4],u),this.h[5]=y(this.h[5],c),this.h[6]=y(this.h[6],l),this.h[7]=y(this.h[7],p);},k.prototype._digest=function(e){return "hex"===e?h.toHex32(this.h,"big"):h.split32(this.h,"big")};for(var N={},$="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",R=0;R<$.length;R++)N[$.charCodeAt(R)]=R;function O(e){for(var t=0,n=0,r=0,i=0,s=0,o=[],a=[],h=[],u=0,c=0,l=0,p=0,d=e.length;u<d;u++){var f=e.charCodeAt(u);if(44===f)h.length&&a.push(new Int32Array(h)),h=[],c=0;else if(59===f)h.length&&a.push(new Int32Array(h)),h=[],c=0,o.push(a),a=[],t=0;else{var m=N[f];if(void 0===m)throw new Error("Invalid character ("+String.fromCharCode(f)+")");var g=32&m;if(p+=(m&=31)<<l,g)l+=5;else{var y=1&p;p>>=1;var x=y?-p:p;0==c?(t+=x,h.push(t)):1===c?(n+=x,h.push(n)):2===c?(r+=x,h.push(r)):3===c?(i+=x,h.push(i)):4===c&&(s+=x,h.push(s)),c++,p=l=0;}}}return h.length&&a.push(new Int32Array(h)),o.push(a),o}function M(e){var t="";e=e<0?-e<<1|1:e<<1;do{var n=31&e;(e>>=5)>0&&(n|=32),t+=$[n];}while(e>0);return t}var T=function(e,t,n){this.start=e,this.end=t,this.original=n,this.intro="",this.outro="",this.content=n,this.storeName=!1,this.edited=!1,Object.defineProperties(this,{previous:{writable:!0,value:null},next:{writable:!0,value:null}});};T.prototype.appendLeft=function(e){this.outro+=e;},T.prototype.appendRight=function(e){this.intro=this.intro+e;},T.prototype.clone=function(){var e=new T(this.start,this.end,this.original);return e.intro=this.intro,e.outro=this.outro,e.content=this.content,e.storeName=this.storeName,e.edited=this.edited,e},T.prototype.contains=function(e){return this.start<e&&e<this.end},T.prototype.eachNext=function(e){for(var t=this;t;)e(t),t=t.next;},T.prototype.eachPrevious=function(e){for(var t=this;t;)e(t),t=t.previous;},T.prototype.edit=function(e,t,n){return this.content=e,n||(this.intro="",this.outro=""),this.storeName=t,this.edited=!0,this},T.prototype.prependLeft=function(e){this.outro=e+this.outro;},T.prototype.prependRight=function(e){this.intro=e+this.intro;},T.prototype.split=function(e){var t=e-this.start,n=this.original.slice(0,t),r=this.original.slice(t);this.original=n;var i=new T(e,this.end,r);return i.outro=this.outro,this.outro="",this.end=e,this.edited?(i.edit("",!1),this.content=""):this.content=n,i.next=this.next,i.next&&(i.next.previous=i),i.previous=this,this.next=i,i},T.prototype.toString=function(){return this.intro+this.content+this.outro},T.prototype.trimEnd=function(e){if(this.outro=this.outro.replace(e,""),this.outro.length)return !0;var t=this.content.replace(e,"");return t.length?(t!==this.content&&this.split(this.start+t.length).edit("",void 0,!0),!0):(this.edit("",void 0,!0),this.intro=this.intro.replace(e,""),!!this.intro.length||void 0)},T.prototype.trimStart=function(e){if(this.intro=this.intro.replace(e,""),this.intro.length)return !0;var t=this.content.replace(e,"");return t.length?(t!==this.content&&(this.split(this.end-t.length),this.edit("",void 0,!0)),!0):(this.edit("",void 0,!0),this.outro=this.outro.replace(e,""),!!this.outro.length||void 0)};var D=function(){throw new Error("Unsupported environment: `window.btoa` or `Buffer` should be supported.")};"undefined"!=typeof window&&"function"==typeof window.btoa?D=function(e){return window.btoa(unescape(encodeURIComponent(e)))}:"function"==typeof Buffer&&(D=function(e){return Buffer.from(e,"utf-8").toString("base64")});var L=function(e){this.version=3,this.file=e.file,this.sources=e.sources,this.sourcesContent=e.sourcesContent,this.names=e.names,this.mappings=function(e){for(var t=0,n=0,r=0,i=0,s="",o=0;o<e.length;o++){var a=e[o];if(o>0&&(s+=";"),0!==a.length){for(var h=0,u=[],c=0,l=a;c<l.length;c++){var p=l[c],d=M(p[0]-h);h=p[0],p.length>1&&(d+=M(p[1]-t)+M(p[2]-n)+M(p[3]-r),t=p[1],n=p[2],r=p[3]),5===p.length&&(d+=M(p[4]-i),i=p[4]),u.push(d);}s+=u.join(",");}}return s}(e.mappings);};function V(e){var t=e.split("\n"),n=t.filter(function(e){return /^\t+/.test(e)}),r=t.filter(function(e){return /^ {2,}/.test(e)});if(0===n.length&&0===r.length)return null;if(n.length>=r.length)return "\t";var i=r.reduce(function(e,t){var n=/^ +/.exec(t)[0].length;return Math.min(n,e)},1/0);return new Array(i+1).join(" ")}function B(e,t){var n=e.split(/[\/\\]/),r=t.split(/[\/\\]/);for(n.pop();n[0]===r[0];)n.shift(),r.shift();if(n.length)for(var i=n.length;i--;)n[i]="..";return n.concat(r).join("/")}L.prototype.toString=function(){return JSON.stringify(this)},L.prototype.toUrl=function(){return "data:application/json;charset=utf-8;base64,"+D(this.toString())};var z=Object.prototype.toString;function j(e){return "[object Object]"===z.call(e)}function W(e){for(var t=e.split("\n"),n=[],r=0,i=0;r<t.length;r++)n.push(i),i+=t[r].length+1;return function(e){for(var t=0,r=n.length;t<r;){var i=t+r>>1;e<n[i]?r=i:t=i+1;}var s=t-1;return {line:s,column:e-n[s]}}}var U=function(e){this.hires=e,this.generatedCodeLine=0,this.generatedCodeColumn=0,this.raw=[],this.rawSegments=this.raw[this.generatedCodeLine]=[],this.pending=null;};U.prototype.addEdit=function(e,t,n,r){if(t.length){var i=[this.generatedCodeColumn,e,n.line,n.column];r>=0&&i.push(r),this.rawSegments.push(i);}else this.pending&&this.rawSegments.push(this.pending);this.advance(t),this.pending=null;},U.prototype.addUneditedChunk=function(e,t,n,r,i){for(var s=t.start,o=!0;s<t.end;)(this.hires||o||i[s])&&this.rawSegments.push([this.generatedCodeColumn,e,r.line,r.column]),"\n"===n[s]?(r.line+=1,r.column=0,this.generatedCodeLine+=1,this.raw[this.generatedCodeLine]=this.rawSegments=[],this.generatedCodeColumn=0):(r.column+=1,this.generatedCodeColumn+=1),s+=1,o=!1;this.pending=[this.generatedCodeColumn,e,r.line,r.column];},U.prototype.advance=function(e){if(e){var t=e.split("\n");if(t.length>1){for(var n=0;n<t.length-1;n++)this.generatedCodeLine++,this.raw[this.generatedCodeLine]=this.rawSegments=[];this.generatedCodeColumn=0;}this.generatedCodeColumn+=t[t.length-1].length;}};var F="\n",q={insertLeft:!1,insertRight:!1,storeName:!1},G=function(e,t){void 0===t&&(t={});var n=new T(0,e.length,e);Object.defineProperties(this,{original:{writable:!0,value:e},outro:{writable:!0,value:""},intro:{writable:!0,value:""},firstChunk:{writable:!0,value:n},lastChunk:{writable:!0,value:n},lastSearchedChunk:{writable:!0,value:n},byStart:{writable:!0,value:{}},byEnd:{writable:!0,value:{}},filename:{writable:!0,value:t.filename},indentExclusionRanges:{writable:!0,value:t.indentExclusionRanges},sourcemapLocations:{writable:!0,value:{}},storedNames:{writable:!0,value:{}},indentStr:{writable:!0,value:V(e)}}),this.byStart[0]=n,this.byEnd[e.length]=n;};G.prototype.addSourcemapLocation=function(e){this.sourcemapLocations[e]=!0;},G.prototype.append=function(e){if("string"!=typeof e)throw new TypeError("outro content must be a string");return this.outro+=e,this},G.prototype.appendLeft=function(e,t){if("string"!=typeof t)throw new TypeError("inserted content must be a string");this._split(e);var n=this.byEnd[e];return n?n.appendLeft(t):this.intro+=t,this},G.prototype.appendRight=function(e,t){if("string"!=typeof t)throw new TypeError("inserted content must be a string");this._split(e);var n=this.byStart[e];return n?n.appendRight(t):this.outro+=t,this},G.prototype.clone=function(){for(var e=new G(this.original,{filename:this.filename}),t=this.firstChunk,n=e.firstChunk=e.lastSearchedChunk=t.clone();t;){e.byStart[n.start]=n,e.byEnd[n.end]=n;var r=t.next,i=r&&r.clone();i&&(n.next=i,i.previous=n,n=i),t=r;}return e.lastChunk=n,this.indentExclusionRanges&&(e.indentExclusionRanges=this.indentExclusionRanges.slice()),Object.keys(this.sourcemapLocations).forEach(function(t){e.sourcemapLocations[t]=!0;}),e},G.prototype.generateDecodedMap=function(e){var t=this;e=e||{};var n=Object.keys(this.storedNames),r=new U(e.hires),i=W(this.original);return this.intro&&r.advance(this.intro),this.firstChunk.eachNext(function(e){var s=i(e.start);e.intro.length&&r.advance(e.intro),e.edited?r.addEdit(0,e.content,s,e.storeName?n.indexOf(e.original):-1):r.addUneditedChunk(0,e,t.original,s,t.sourcemapLocations),e.outro.length&&r.advance(e.outro);}),{file:e.file?e.file.split(/[\/\\]/).pop():null,sources:[e.source?B(e.file||"",e.source):null],sourcesContent:e.includeContent?[this.original]:[null],names:n,mappings:r.raw}},G.prototype.generateMap=function(e){return new L(this.generateDecodedMap(e))},G.prototype.getIndentString=function(){return null===this.indentStr?"\t":this.indentStr},G.prototype.indent=function(e,t){var n=/^[^\r\n]/gm;if(j(e)&&(t=e,e=void 0),""===(e=void 0!==e?e:this.indentStr||"\t"))return this;var r={};(t=t||{}).exclude&&("number"==typeof t.exclude[0]?[t.exclude]:t.exclude).forEach(function(e){for(var t=e[0];t<e[1];t+=1)r[t]=!0;});var i=!1!==t.indentStart,s=function(t){return i?""+e+t:(i=!0,t)};this.intro=this.intro.replace(n,s);for(var o=0,a=this.firstChunk;a;){var h=a.end;if(a.edited)r[o]||(a.content=a.content.replace(n,s),a.content.length&&(i="\n"===a.content[a.content.length-1]));else for(o=a.start;o<h;){if(!r[o]){var u=this.original[o];"\n"===u?i=!0:"\r"!==u&&i&&(i=!1,o===a.start?a.prependRight(e):(this._splitChunk(a,o),(a=a.next).prependRight(e)));}o+=1;}o=a.end,a=a.next;}return this.outro=this.outro.replace(n,s),this},G.prototype.insert=function(){throw new Error("magicString.insert(...) is deprecated. Use prependRight(...) or appendLeft(...)")},G.prototype.insertLeft=function(e,t){return q.insertLeft||(console.warn("magicString.insertLeft(...) is deprecated. Use magicString.appendLeft(...) instead"),q.insertLeft=!0),this.appendLeft(e,t)},G.prototype.insertRight=function(e,t){return q.insertRight||(console.warn("magicString.insertRight(...) is deprecated. Use magicString.prependRight(...) instead"),q.insertRight=!0),this.prependRight(e,t)},G.prototype.move=function(e,t,n){if(n>=e&&n<=t)throw new Error("Cannot move a selection inside itself");this._split(e),this._split(t),this._split(n);var r=this.byStart[e],i=this.byEnd[t],s=r.previous,o=i.next,a=this.byStart[n];if(!a&&i===this.lastChunk)return this;var h=a?a.previous:this.lastChunk;return s&&(s.next=o),o&&(o.previous=s),h&&(h.next=r),a&&(a.previous=i),r.previous||(this.firstChunk=i.next),i.next||(this.lastChunk=r.previous,this.lastChunk.next=null),r.previous=h,i.next=a||null,h||(this.firstChunk=r),a||(this.lastChunk=i),this},G.prototype.overwrite=function(e,t,n,r){if("string"!=typeof n)throw new TypeError("replacement content must be a string");for(;e<0;)e+=this.original.length;for(;t<0;)t+=this.original.length;if(t>this.original.length)throw new Error("end is out of bounds");if(e===t)throw new Error("Cannot overwrite a zero-length range – use appendLeft or prependRight instead");this._split(e),this._split(t),!0===r&&(q.storeName||(console.warn("The final argument to magicString.overwrite(...) should be an options object. See https://github.com/rich-harris/magic-string"),q.storeName=!0),r={storeName:!0});var i=void 0!==r&&r.storeName,s=void 0!==r&&r.contentOnly;if(i){var o=this.original.slice(e,t);this.storedNames[o]=!0;}var a=this.byStart[e],h=this.byEnd[t];if(a){if(t>a.end&&a.next!==this.byStart[a.end])throw new Error("Cannot overwrite across a split point");if(a.edit(n,i,s),a!==h){for(var u=a.next;u!==h;)u.edit("",!1),u=u.next;u.edit("",!1);}}else{var c=new T(e,t,"").edit(n,i);h.next=c,c.previous=h;}return this},G.prototype.prepend=function(e){if("string"!=typeof e)throw new TypeError("outro content must be a string");return this.intro=e+this.intro,this},G.prototype.prependLeft=function(e,t){if("string"!=typeof t)throw new TypeError("inserted content must be a string");this._split(e);var n=this.byEnd[e];return n?n.prependLeft(t):this.intro=t+this.intro,this},G.prototype.prependRight=function(e,t){if("string"!=typeof t)throw new TypeError("inserted content must be a string");this._split(e);var n=this.byStart[e];return n?n.prependRight(t):this.outro=t+this.outro,this},G.prototype.remove=function(e,t){for(;e<0;)e+=this.original.length;for(;t<0;)t+=this.original.length;if(e===t)return this;if(e<0||t>this.original.length)throw new Error("Character is out of bounds");if(e>t)throw new Error("end must be greater than start");this._split(e),this._split(t);for(var n=this.byStart[e];n;)n.intro="",n.outro="",n.edit(""),n=t>n.end?this.byStart[n.end]:null;return this},G.prototype.lastChar=function(){if(this.outro.length)return this.outro[this.outro.length-1];var e=this.lastChunk;do{if(e.outro.length)return e.outro[e.outro.length-1];if(e.content.length)return e.content[e.content.length-1];if(e.intro.length)return e.intro[e.intro.length-1]}while(e=e.previous);return this.intro.length?this.intro[this.intro.length-1]:""},G.prototype.lastLine=function(){var e=this.outro.lastIndexOf(F);if(-1!==e)return this.outro.substr(e+1);var t=this.outro,n=this.lastChunk;do{if(n.outro.length>0){if(-1!==(e=n.outro.lastIndexOf(F)))return n.outro.substr(e+1)+t;t=n.outro+t;}if(n.content.length>0){if(-1!==(e=n.content.lastIndexOf(F)))return n.content.substr(e+1)+t;t=n.content+t;}if(n.intro.length>0){if(-1!==(e=n.intro.lastIndexOf(F)))return n.intro.substr(e+1)+t;t=n.intro+t;}}while(n=n.previous);return -1!==(e=this.intro.lastIndexOf(F))?this.intro.substr(e+1)+t:this.intro+t},G.prototype.slice=function(e,t){for(void 0===e&&(e=0),void 0===t&&(t=this.original.length);e<0;)e+=this.original.length;for(;t<0;)t+=this.original.length;for(var n="",r=this.firstChunk;r&&(r.start>e||r.end<=e);){if(r.start<t&&r.end>=t)return n;r=r.next;}if(r&&r.edited&&r.start!==e)throw new Error("Cannot use replaced character "+e+" as slice start anchor.");for(var i=r;r;){!r.intro||i===r&&r.start!==e||(n+=r.intro);var s=r.start<t&&r.end>=t;if(s&&r.edited&&r.end!==t)throw new Error("Cannot use replaced character "+t+" as slice end anchor.");var o=i===r?e-r.start:0,a=s?r.content.length+t-r.end:r.content.length;if(n+=r.content.slice(o,a),!r.outro||s&&r.end!==t||(n+=r.outro),s)break;r=r.next;}return n},G.prototype.snip=function(e,t){var n=this.clone();return n.remove(0,e),n.remove(t,n.original.length),n},G.prototype._split=function(e){if(!this.byStart[e]&&!this.byEnd[e])for(var t=this.lastSearchedChunk,n=e>t.end;t;){if(t.contains(e))return this._splitChunk(t,e);t=n?this.byStart[t.end]:this.byEnd[t.start];}},G.prototype._splitChunk=function(e,t){if(e.edited&&e.content.length){var n=W(this.original)(t);throw new Error("Cannot split a chunk that has already been edited ("+n.line+":"+n.column+' – "'+e.original+'")')}var r=e.split(t);return this.byEnd[t]=e,this.byStart[t]=r,this.byEnd[r.end]=r,e===this.lastChunk&&(this.lastChunk=r),this.lastSearchedChunk=e,!0},G.prototype.toString=function(){for(var e=this.intro,t=this.firstChunk;t;)e+=t.toString(),t=t.next;return e+this.outro},G.prototype.isEmpty=function(){var e=this.firstChunk;do{if(e.intro.length&&e.intro.trim()||e.content.length&&e.content.trim()||e.outro.length&&e.outro.trim())return !1}while(e=e.next);return !0},G.prototype.length=function(){var e=this.firstChunk,t=0;do{t+=e.intro.length+e.content.length+e.outro.length;}while(e=e.next);return t},G.prototype.trimLines=function(){return this.trim("[\\r\\n]")},G.prototype.trim=function(e){return this.trimStart(e).trimEnd(e)},G.prototype.trimEndAborted=function(e){var t=new RegExp((e||"\\s")+"+$");if(this.outro=this.outro.replace(t,""),this.outro.length)return !0;var n=this.lastChunk;do{var r=n.end,i=n.trimEnd(t);if(n.end!==r&&(this.lastChunk===n&&(this.lastChunk=n.next),this.byEnd[n.end]=n,this.byStart[n.next.start]=n.next,this.byEnd[n.next.end]=n.next),i)return !0;n=n.previous;}while(n);return !1},G.prototype.trimEnd=function(e){return this.trimEndAborted(e),this},G.prototype.trimStartAborted=function(e){var t=new RegExp("^"+(e||"\\s")+"+");if(this.intro=this.intro.replace(t,""),this.intro.length)return !0;var n=this.firstChunk;do{var r=n.end,i=n.trimStart(t);if(n.end!==r&&(n===this.lastChunk&&(this.lastChunk=n.next),this.byEnd[n.end]=n,this.byStart[n.next.start]=n.next,this.byEnd[n.next.end]=n.next),i)return !0;n=n.next;}while(n);return !1},G.prototype.trimStart=function(e){return this.trimStartAborted(e),this};var H=Object.prototype.hasOwnProperty,K=function(e){void 0===e&&(e={}),this.intro=e.intro||"",this.separator=void 0!==e.separator?e.separator:"\n",this.sources=[],this.uniqueSources=[],this.uniqueSourceIndexByFilename={};};K.prototype.addSource=function(e){if(e instanceof G)return this.addSource({content:e,filename:e.filename,separator:this.separator});if(!j(e)||!e.content)throw new Error("bundle.addSource() takes an object with a `content` property, which should be an instance of MagicString, and an optional `filename`");if(["filename","indentExclusionRanges","separator"].forEach(function(t){H.call(e,t)||(e[t]=e.content[t]);}),void 0===e.separator&&(e.separator=this.separator),e.filename)if(H.call(this.uniqueSourceIndexByFilename,e.filename)){var t=this.uniqueSources[this.uniqueSourceIndexByFilename[e.filename]];if(e.content.original!==t.content)throw new Error("Illegal source: same filename ("+e.filename+"), different contents")}else this.uniqueSourceIndexByFilename[e.filename]=this.uniqueSources.length,this.uniqueSources.push({filename:e.filename,content:e.content.original});return this.sources.push(e),this},K.prototype.append=function(e,t){return this.addSource({content:new G(e),separator:t&&t.separator||""}),this},K.prototype.clone=function(){var e=new K({intro:this.intro,separator:this.separator});return this.sources.forEach(function(t){e.addSource({filename:t.filename,content:t.content.clone(),separator:t.separator});}),e},K.prototype.generateDecodedMap=function(e){var t=this;void 0===e&&(e={});var n=[];this.sources.forEach(function(e){Object.keys(e.content.storedNames).forEach(function(e){~n.indexOf(e)||n.push(e);});});var r=new U(e.hires);return this.intro&&r.advance(this.intro),this.sources.forEach(function(e,i){i>0&&r.advance(t.separator);var s=e.filename?t.uniqueSourceIndexByFilename[e.filename]:-1,o=e.content,a=W(o.original);o.intro&&r.advance(o.intro),o.firstChunk.eachNext(function(t){var i=a(t.start);t.intro.length&&r.advance(t.intro),e.filename?t.edited?r.addEdit(s,t.content,i,t.storeName?n.indexOf(t.original):-1):r.addUneditedChunk(s,t,o.original,i,o.sourcemapLocations):r.advance(t.content),t.outro.length&&r.advance(t.outro);}),o.outro&&r.advance(o.outro);}),{file:e.file?e.file.split(/[\/\\]/).pop():null,sources:this.uniqueSources.map(function(t){return e.file?B(e.file,t.filename):t.filename}),sourcesContent:this.uniqueSources.map(function(t){return e.includeContent?t.content:null}),names:n,mappings:r.raw}},K.prototype.generateMap=function(e){return new L(this.generateDecodedMap(e))},K.prototype.getIndentString=function(){var e={};return this.sources.forEach(function(t){var n=t.content.indentStr;null!==n&&(e[n]||(e[n]=0),e[n]+=1);}),Object.keys(e).sort(function(t,n){return e[t]-e[n]})[0]||"\t"},K.prototype.indent=function(e){var t=this;if(arguments.length||(e=this.getIndentString()),""===e)return this;var n=!this.intro||"\n"===this.intro.slice(-1);return this.sources.forEach(function(r,i){var s=void 0!==r.separator?r.separator:t.separator,o=n||i>0&&/\r?\n$/.test(s);r.content.indent(e,{exclude:r.indentExclusionRanges,indentStart:o}),n="\n"===r.content.lastChar();}),this.intro&&(this.intro=e+this.intro.replace(/^[^\n]/gm,function(t,n){return n>0?e+t:t})),this},K.prototype.prepend=function(e){return this.intro=e+this.intro,this},K.prototype.toString=function(){var e=this,t=this.sources.map(function(t,n){var r=void 0!==t.separator?t.separator:e.separator;return (n>0?r:"")+t.content.toString()}).join("");return this.intro+t},K.prototype.isEmpty=function(){return (!this.intro.length||!this.intro.trim())&&!this.sources.some(function(e){return !e.content.isEmpty()})},K.prototype.length=function(){return this.sources.reduce(function(e,t){return e+t.content.length()},this.intro.length)},K.prototype.trimLines=function(){return this.trim("[\\r\\n]")},K.prototype.trim=function(e){return this.trimStart(e).trimEnd(e)},K.prototype.trimStart=function(e){var t=new RegExp("^"+(e||"\\s")+"+");if(this.intro=this.intro.replace(t,""),!this.intro){var n,r=0;do{if(!(n=this.sources[r++]))break}while(!n.content.trimStartAborted(e))}return this},K.prototype.trimEnd=function(e){var t,n=new RegExp((e||"\\s")+"+$"),r=this.sources.length-1;do{if(!(t=this.sources[r--])){this.intro=this.intro.replace(n,"");break}}while(!t.content.trimEndAborted(e));return this};const Y=Object.create(null),X="BlockStatement",Q="CallExpression",J="ExportAllDeclaration",Z="ExpressionStatement",ee="FunctionExpression",te="Identifier",ne="ImportDefaultSpecifier",re="ImportNamespaceSpecifier",ie="Program",se="Property",oe="ReturnStatement",ae="VariableDeclaration";function he(e,t,n,r){if(t.remove(n,r),e.annotations)for(const r of e.annotations){if(!(r.start<n))return;t.remove(r.start,r.end);}}function ue(e,t){if(e.annotations||e.parent.type!==Z||(e=e.parent),e.annotations)for(const n of e.annotations)t.remove(n.start,n.end);}const ce={isNoStatement:!0};function le(e,t,n=0){let r,i;for(r=e.indexOf(t,n);;){if(-1===(n=e.indexOf("/",n))||n>r)return r;if(i=e.charCodeAt(++n),++n,47===i){if(0===(n=e.indexOf("\n",n)+1))return -1;n>r&&(r=e.indexOf(t,n));}else 42===i&&(n=e.indexOf("*/",n)+2)>r&&(r=e.indexOf(t,n));}}function pe(e,t=0){let n,r;for(n=e.indexOf("\n",t);;){if(-1===(t=e.indexOf("/",t))||t>n)return n;if(47===(r=e.charCodeAt(++t)))return n;++t,42===r&&(t=e.indexOf("*/",t)+2)>n&&(n=e.indexOf("\n",t));}}function de(e,t,n,r,i){if(0===e.length)return;let s,o,a,h,u=e[0],c=!u.included||u.needsBoundaries;c&&(h=n+pe(t.original.slice(n,u.start))+1);for(let n=1;n<=e.length;n++)s=u,o=h,a=c,c=void 0!==(u=e[n])&&(!u.included||u.needsBoundaries),a||c?(h=s.end+pe(t.original.slice(s.end,void 0===u?r:u.start))+1,s.included?a?s.render(t,i,{end:h,start:o}):s.render(t,i):he(s,t,o,h)):s.render(t,i);}function fe(e,t,n,r){const i=[];let s,o,a,h,u,c=n-1;for(let r=0;r<e.length;r++){for(o=e[r],void 0!==s&&(c=s.end+le(t.original.slice(s.end,o.start),",")),a=h=c+2+pe(t.original.slice(c+1,o.start));32===(u=t.original.charCodeAt(a))||9===u||10===u||13===u;)a++;void 0!==s&&i.push({contentEnd:h,end:a,node:s,separator:c,start:n}),s=o,n=a;}return i.push({contentEnd:r,end:r,node:s,separator:null,start:n}),i}const me="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$",ge=64;function ye(e){let t="";do{const n=e%ge;e=Math.floor(e/ge),t=me[n]+t;}while(0!==e);return t}function xe(e,t){let n=e,r=1;for(;t[n];)n=`${e}$${ye(r++)}`;return t[n]=!0,n}class ve{static create(e){return new this(e)}constructor({withNew:e=!1,args:t=[],callIdentifier:n}={}){this.withNew=e,this.args=t,this.callIdentifier=n;}equals(e){return e&&this.callIdentifier===e.callIdentifier}}const Ee={UNKNOWN_KEY:!0},_e=[],be=[Ee];function Ae(e,t=null){return Object.create(t,e)}const Se={UNKNOWN_VALUE:!0},Ie={deoptimizePath:()=>{},getLiteralValueAtPath:()=>Se,getReturnExpressionWhenCalledAtPath:()=>Ie,hasEffectsWhenAccessedAtPath:e=>e.length>0,hasEffectsWhenAssignedAtPath:e=>e.length>0,hasEffectsWhenCalledAtPath:()=>!0,include:()=>{},included:!0,toString:()=>"[[UNKNOWN]]"},we={deoptimizePath:()=>{},getLiteralValueAtPath:()=>void 0,getReturnExpressionWhenCalledAtPath:()=>Ie,hasEffectsWhenAccessedAtPath:e=>e.length>0,hasEffectsWhenAssignedAtPath:e=>e.length>0,hasEffectsWhenCalledAtPath:()=>!0,include:()=>{},included:!0,toString:()=>"undefined"},Pe={value:{returns:null,returnsPrimitive:Ie,callsArgs:null,mutatesSelf:!0}},ke={value:{returns:null,returnsPrimitive:Ie,callsArgs:[0],mutatesSelf:!1}};class Ce{constructor(){this.included=!1;}deoptimizePath(){}getLiteralValueAtPath(){return Se}getReturnExpressionWhenCalledAtPath(e){return 1===e.length?Xe(qe,e[0]):Ie}hasEffectsWhenAccessedAtPath(e){return e.length>1}hasEffectsWhenAssignedAtPath(e){return e.length>1}hasEffectsWhenCalledAtPath(e,t,n){return 1!==e.length||Ye(qe,e[0],this.included,t,n)}include(){this.included=!0;}toString(){return "[[UNKNOWN ARRAY]]"}}const Ne={value:{callsArgs:null,mutatesSelf:!1,returns:Ce,returnsPrimitive:null}},$e={value:{callsArgs:null,mutatesSelf:!0,returns:Ce,returnsPrimitive:null}},Re={value:{callsArgs:[0],mutatesSelf:!1,returns:Ce,returnsPrimitive:null}},Oe={value:{callsArgs:[0],mutatesSelf:!0,returns:Ce,returnsPrimitive:null}},Me={deoptimizePath:()=>{},getLiteralValueAtPath:()=>Se,getReturnExpressionWhenCalledAtPath:e=>1===e.length?Xe(Ge,e[0]):Ie,hasEffectsWhenAccessedAtPath:e=>e.length>1,hasEffectsWhenAssignedAtPath:e=>e.length>0,hasEffectsWhenCalledAtPath:e=>{if(1===e.length){const t=e[0];return "string"!=typeof t||!Ge[t]}return !0},include:()=>{},included:!0,toString:()=>"[[UNKNOWN BOOLEAN]]"},Te={value:{callsArgs:null,mutatesSelf:!1,returns:null,returnsPrimitive:Me}},De={value:{callsArgs:[0],mutatesSelf:!1,returns:null,returnsPrimitive:Me}},Le={deoptimizePath:()=>{},getLiteralValueAtPath:()=>Se,getReturnExpressionWhenCalledAtPath:e=>1===e.length?Xe(He,e[0]):Ie,hasEffectsWhenAccessedAtPath:e=>e.length>1,hasEffectsWhenAssignedAtPath:e=>e.length>0,hasEffectsWhenCalledAtPath:e=>{if(1===e.length){const t=e[0];return "string"!=typeof t||!He[t]}return !0},include:()=>{},included:!0,toString:()=>"[[UNKNOWN NUMBER]]"},Ve={value:{callsArgs:null,mutatesSelf:!1,returns:null,returnsPrimitive:Le}},Be={value:{callsArgs:null,mutatesSelf:!0,returns:null,returnsPrimitive:Le}},ze={value:{callsArgs:[0],mutatesSelf:!1,returns:null,returnsPrimitive:Le}},je={deoptimizePath:()=>{},getLiteralValueAtPath:()=>Se,getReturnExpressionWhenCalledAtPath:e=>1===e.length?Xe(Ke,e[0]):Ie,hasEffectsWhenAccessedAtPath:e=>e.length>1,hasEffectsWhenAssignedAtPath:e=>e.length>0,hasEffectsWhenCalledAtPath:(e,t,n)=>1!==e.length||Ye(Ke,e[0],!0,t,n),include:()=>{},included:!0,toString:()=>"[[UNKNOWN STRING]]"},We={value:{callsArgs:null,mutatesSelf:!1,returns:null,returnsPrimitive:je}};class Ue{constructor(){this.included=!1;}deoptimizePath(){}getLiteralValueAtPath(){return Se}getReturnExpressionWhenCalledAtPath(e){return 1===e.length?Xe(Fe,e[0]):Ie}hasEffectsWhenAccessedAtPath(e){return e.length>1}hasEffectsWhenAssignedAtPath(e){return e.length>1}hasEffectsWhenCalledAtPath(e,t,n){return 1!==e.length||Ye(Fe,e[0],this.included,t,n)}include(){this.included=!0;}toString(){return "[[UNKNOWN OBJECT]]"}}const Fe=Ae({hasOwnProperty:Te,isPrototypeOf:Te,propertyIsEnumerable:Te,toLocaleString:We,toString:We,valueOf:{value:{callsArgs:null,mutatesSelf:!1,returns:null,returnsPrimitive:Ie}}}),qe=Ae({concat:Ne,copyWithin:$e,every:De,fill:$e,filter:Re,find:ke,findIndex:ze,forEach:ke,includes:Te,indexOf:Ve,join:We,lastIndexOf:Ve,map:Re,pop:Pe,push:Be,reduce:ke,reduceRight:ke,reverse:$e,shift:Pe,slice:Ne,some:De,sort:Oe,splice:$e,unshift:Be},Fe),Ge=Ae({valueOf:Te},Fe),He=Ae({toExponential:We,toFixed:We,toLocaleString:We,toPrecision:We,valueOf:Ve},Fe),Ke=Ae({charAt:We,charCodeAt:Ve,codePointAt:Ve,concat:We,endsWith:Te,includes:Te,indexOf:Ve,lastIndexOf:Ve,localeCompare:Ve,match:Te,normalize:We,padEnd:We,padStart:We,repeat:We,replace:{value:{callsArgs:[1],mutatesSelf:!1,returns:null,returnsPrimitive:je}},search:Ve,slice:We,split:Ne,startsWith:Te,substr:We,substring:We,toLocaleLowerCase:We,toLocaleUpperCase:We,toLowerCase:We,toUpperCase:We,trim:We,valueOf:We},Fe);function Ye(e,t,n,r,i){if("string"!=typeof t||!e[t])return !0;if(e[t].mutatesSelf&&n)return !0;if(!e[t].callsArgs)return !1;for(const n of e[t].callsArgs)if(r.args[n]&&r.args[n].hasEffectsWhenCalledAtPath(_e,ve.create({args:[],callIdentifier:{},withNew:!1}),i.getHasEffectsWhenCalledOptions()))return !0;return !1}function Xe(e,t){return "string"==typeof t&&e[t]?null!==e[t].returnsPrimitive?e[t].returnsPrimitive:new e[t].returns:Ie}class Qe{constructor(e){this.exportName=null,this.included=!1,this.isId=!1,this.isReassigned=!1,this.reexported=!1,this.renderBaseName=null,this.renderName=null,this.safeExportName=null,this.name=e;}addReference(e){}deoptimizePath(e){}getBaseVariableName(){return this.renderBaseName||this.renderName||this.name}getLiteralValueAtPath(e,t,n){return Se}getName(){const e=this.renderName||this.name;return this.renderBaseName?`${this.renderBaseName}.${e}`:e}getReturnExpressionWhenCalledAtPath(e,t,n){return Ie}hasEffectsWhenAccessedAtPath(e,t){return e.length>0}hasEffectsWhenAssignedAtPath(e,t){return !0}hasEffectsWhenCalledAtPath(e,t,n){return !0}include(){this.included=!0;}setRenderNames(e,t){this.renderBaseName=e,this.renderName=t;}setSafeName(e){this.renderName=e;}toString(){return this.name}}class Je extends Qe{constructor(e,t){super(t),this.module=e,this.isNamespace="*"===t,this.referenced=!1;}addReference(e){this.referenced=!0,"default"!==this.name&&"*"!==this.name||this.module.suggestName(e.name);}include(){this.included||(this.included=!0,this.module.used=!0);}}Je.prototype.isExternal=!0;const Ze="break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public".split(" "),et="Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl".split(" "),tt=Object.create(null);Ze.concat(et).forEach(e=>tt[e]=!0);const nt=/[^$_a-zA-Z0-9]/g,rt=e=>/\d/.test(e[0]);function it(e){return e=e.replace(/-(\w)/g,(e,t)=>t.toUpperCase()).replace(nt,"_"),(rt(e)||tt[e])&&(e=`_${e}`),e}const st=/^(?:\/|(?:[A-Za-z]:)?[\\|\/])/,ot=/^\.?\.\//;function at(e){return st.test(e)}function ht(e){return ot.test(e)}function ut(e){return e.replace(/\\/g,"/")}function ct(e){return e.split(/(\/|\\)/).pop()}function lt(e){const t=/(\/|\\)[^\/\\]*$/.exec(e);if(!t)return ".";const n=e.slice(0,-t[0].length);return n||"/"}function pt(e){const t=/\.[^.]+$/.exec(ct(e));return t?t[0]:""}function dt(e,t){const n=e.split(/[\/\\]/).filter(Boolean),r=t.split(/[\/\\]/).filter(Boolean);for(;n[0]&&r[0]&&n[0]===r[0];)n.shift(),r.shift();for(;"."===r[0]||".."===r[0];){".."===r.shift()&&n.pop();}for(;n.pop();)r.unshift("..");return r.join("/")}function ft(...e){let t=e.shift().split(/[\/\\]/);return e.forEach(e=>{if(at(e))t=e.split(/[\/\\]/);else{const n=e.split(/[\/\\]/);for(;"."===n[0]||".."===n[0];){".."===n.shift()&&t.pop();}t.push.apply(t,n);}}),t.join("/")}class mt{constructor(e,t,n){this.exportsNames=!1,this.exportsNamespace=!1,this.isExternal=!0,this.mostCommonSuggestion=0,this.reexported=!1,this.renderPath=void 0,this.renormalizeRenderPath=!1,this.used=!1,this.graph=e,this.id=t,this.execIndex=1/0,this.moduleSideEffects=n;const r=t.split(/[\\\/]/);this.variableName=it(r.pop()),this.nameSuggestions=Object.create(null),this.declarations=Object.create(null),this.exportedVariables=new Map;}getVariableForExportName(e,t){"default"!==e&&"*"!==e&&(this.exportsNames=!0),"*"===e&&(this.exportsNamespace=!0);let n=this.declarations[e];return n||(this.declarations[e]=n=new Je(this,e),this.exportedVariables.set(n,e),n)}setRenderPath(e,t){return this.renderPath="",e.paths&&(this.renderPath="function"==typeof e.paths?e.paths(this.id):e.paths[this.id]),this.renderPath||(at(this.id)?(this.renderPath=ut(dt(t,this.id)),this.renormalizeRenderPath=!0):this.renderPath=this.id),this.renderPath}suggestName(e){this.nameSuggestions[e]||(this.nameSuggestions[e]=0),this.nameSuggestions[e]+=1,this.nameSuggestions[e]>this.mostCommonSuggestion&&(this.mostCommonSuggestion=this.nameSuggestions[e],this.variableName=e);}warnUnusedImports(){const e=Object.keys(this.declarations).filter(e=>{if("*"===e)return !1;const t=this.declarations[e];return !t.included&&!this.reexported&&!t.referenced});if(0===e.length)return;const t=1===e.length?`'${e[0]}' is`:`${e.slice(0,-1).map(e=>`'${e}'`).join(", ")} and '${e.slice(-1)}' are`;this.graph.warn({code:"UNUSED_EXTERNAL_IMPORT",message:`${t} imported from external module '${this.id}' but never used`,names:e,source:this.id});}}function gt(e){e.isExecuted=!0;const t=[e],n={};for(const e of t)for(const r of e.dependencies)r instanceof mt||r.isExecuted||!r.moduleSideEffects||n[r.id]||(r.isExecuted=!0,n[r.id]=!0,t.push(r));}const yt=7;class xt extends Qe{constructor(e,t,n,r){super(e),this.additionalInitializers=null,this.expressionsToBeDeoptimized=[],this.declarations=t?[t]:[],this.init=n,this.deoptimizationTracker=r.deoptimizationTracker,this.module=r.module;}addDeclaration(e,t){this.declarations.push(e),null===this.additionalInitializers&&(this.additionalInitializers=null===this.init?[]:[this.init],this.init=Ie,this.isReassigned=!0),null!==t&&this.additionalInitializers.push(t);}consolidateInitializers(){if(null!==this.additionalInitializers){for(const e of this.additionalInitializers)e.deoptimizePath(be);this.additionalInitializers=null;}}deoptimizePath(e){if(!(e.length>yt||this.isReassigned||this.deoptimizationTracker.track(this,e)))if(0===e.length){if(!this.isReassigned){this.isReassigned=!0;for(const e of this.expressionsToBeDeoptimized)e.deoptimizeCache();this.init&&this.init.deoptimizePath(be);}}else this.init&&this.init.deoptimizePath(e);}getLiteralValueAtPath(e,t,n){return this.isReassigned||!this.init||e.length>yt||t.isTracked(this.init,e)?Se:(this.expressionsToBeDeoptimized.push(n),this.init.getLiteralValueAtPath(e,t.track(this.init,e),n))}getReturnExpressionWhenCalledAtPath(e,t,n){return this.isReassigned||!this.init||e.length>yt||t.isTracked(this.init,e)?Ie:(this.expressionsToBeDeoptimized.push(n),this.init.getReturnExpressionWhenCalledAtPath(e,t.track(this.init,e),n))}hasEffectsWhenAccessedAtPath(e,t){return 0!==e.length&&(this.isReassigned||e.length>yt||this.init&&!t.hasNodeBeenAccessedAtPath(e,this.init)&&this.init.hasEffectsWhenAccessedAtPath(e,t.addAccessedNodeAtPath(e,this.init)))}hasEffectsWhenAssignedAtPath(e,t){return !!(this.included||e.length>yt)||0!==e.length&&(this.isReassigned||this.init&&!t.hasNodeBeenAssignedAtPath(e,this.init)&&this.init.hasEffectsWhenAssignedAtPath(e,t.addAssignedNodeAtPath(e,this.init)))}hasEffectsWhenCalledAtPath(e,t,n){return e.length>yt||(this.isReassigned||this.init&&!n.hasNodeBeenCalledAtPathWithOptions(e,this.init,t)&&this.init.hasEffectsWhenCalledAtPath(e,t,n.addCalledNodeAtPathWithOptions(e,this.init,t)))}include(){if(!this.included){this.included=!0,this.module.isExecuted||gt(this.module);for(const e of this.declarations){e.included||e.include(!1);let t=e.parent;for(;!t.included&&(t.included=!0,t.type!==ie);)t=t.parent;}}}}xt.prototype.isLocal=!0;class vt{constructor(){this.children=[],this.variables=Object.create(null);}addDeclaration(e,t,n=null,r){const i=e.name;return this.variables[i]?this.variables[i].addDeclaration(e,n):this.variables[i]=new xt(e.name,e,n||we,t),this.variables[i]}contains(e){return e in this.variables}findVariable(e){throw new Error("Internal Error: findVariable needs to be implemented by a subclass")}}class Et extends vt{constructor(e){super(),this.accessedOutsideVariables=Object.create(null),this.parent=e,e.children.push(this);}addNamespaceMemberAccess(e,t){this.accessedOutsideVariables[e]=t,this.parent instanceof Et&&this.parent.addNamespaceMemberAccess(e,t);}addReturnExpression(e){this.parent instanceof Et&&this.parent.addReturnExpression(e);}contains(e){return e in this.variables||this.parent.contains(e)}deconflict(e){const t=Object.assign(Object.create(null),e);for(const e of Object.keys(this.accessedOutsideVariables)){const n=this.accessedOutsideVariables[e];n.included&&(t[n.getBaseVariableName()]=!0);}for(const e of Object.keys(this.variables)){const n=this.variables[e];n.included&&n.setSafeName(xe(e,t));}for(const t of this.children)t.deconflict(e);}findLexicalBoundary(){return this.parent instanceof Et?this.parent.findLexicalBoundary():this}findVariable(e){const t=this.variables[e]||this.accessedOutsideVariables[e];return t||(this.accessedOutsideVariables[e]=this.parent.findVariable(e))}}function _t(e,t,n){if("number"==typeof n)throw new Error("locate takes a { startIndex, offsetLine, offsetColumn } object as the third argument");return function(e,t){void 0===t&&(t={});var n=t.offsetLine||0,r=t.offsetColumn||0,i=e.split("\n"),s=0,o=i.map(function(e,t){var n=s+e.length+1,r={start:s,end:n,line:t};return s=n,r}),a=0;function h(e,t){return e.start<=t&&t<e.end}function u(e,t){return {line:n+e.line,column:r+t-e.start,character:t}}return function(t,n){"string"==typeof t&&(t=e.indexOf(t,n||0));for(var r=o[a],i=t>=r.end?1:-1;r;){if(h(r,t))return u(r,t);r=o[a+=i];}}}(e,n)(t,n&&n.startIndex)}var bt=5,At=1<<bt,St=At-1,It={};function wt(e){e&&(e.value=!0);}function Pt(){}function kt(e){return void 0===e.size&&(e.size=e.__iterate(Nt)),e.size}function Ct(e,t){if("number"!=typeof t){var n=t>>>0;if(""+n!==t||4294967295===n)return NaN;t=n;}return t<0?kt(e)+t:t}function Nt(){return !0}function $t(e,t,n){return (0===e&&!Tt(e)||void 0!==n&&e<=-n)&&(void 0===t||void 0!==n&&t>=n)}function Rt(e,t){return Mt(e,t,0)}function Ot(e,t){return Mt(e,t,t)}function Mt(e,t,n){return void 0===e?n:Tt(e)?t===1/0?t:0|Math.max(0,t+e):void 0===t||t===e?e:0|Math.min(t,e)}function Tt(e){return e<0||0===e&&1/e==-1/0}var Dt="@@__IMMUTABLE_ITERABLE__@@";function Lt(e){return Boolean(e&&e[Dt])}var Vt="@@__IMMUTABLE_KEYED__@@";function Bt(e){return Boolean(e&&e[Vt])}var zt="@@__IMMUTABLE_INDEXED__@@";function jt(e){return Boolean(e&&e[zt])}function Wt(e){return Bt(e)||jt(e)}var Ut=function(e){return Lt(e)?e:gn(e)},Ft=function(e){function t(e){return Bt(e)?e:yn(e)}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t}(Ut),qt=function(e){function t(e){return jt(e)?e:xn(e)}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t}(Ut),Gt=function(e){function t(e){return Lt(e)&&!Wt(e)?e:vn(e)}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t}(Ut);Ut.Keyed=Ft,Ut.Indexed=qt,Ut.Set=Gt;var Ht="@@__IMMUTABLE_SEQ__@@";function Kt(e){return Boolean(e&&e[Ht])}var Yt="@@__IMMUTABLE_RECORD__@@";function Xt(e){return Boolean(e&&e[Yt])}function Qt(e){return Lt(e)||Xt(e)}var Jt="@@__IMMUTABLE_ORDERED__@@";function Zt(e){return Boolean(e&&e[Jt])}var en=0,tn=1,nn=2,rn="function"==typeof Symbol&&Symbol.iterator,sn="@@iterator",on=rn||sn,an=function(e){this.next=e;};function hn(e,t,n,r){var i=0===e?t:1===e?n:[t,n];return r?r.value=i:r={value:i,done:!1},r}function un(){return {value:void 0,done:!0}}function cn(e){return !!dn(e)}function ln(e){return e&&"function"==typeof e.next}function pn(e){var t=dn(e);return t&&t.call(e)}function dn(e){var t=e&&(rn&&e[rn]||e[sn]);if("function"==typeof t)return t}an.prototype.toString=function(){return "[Iterator]"},an.KEYS=en,an.VALUES=tn,an.ENTRIES=nn,an.prototype.inspect=an.prototype.toSource=function(){return this.toString()},an.prototype[on]=function(){return this};var fn=Object.prototype.hasOwnProperty;function mn(e){return !(!Array.isArray(e)&&"string"!=typeof e)||e&&"object"==typeof e&&Number.isInteger(e.length)&&e.length>=0&&(0===e.length?1===Object.keys(e).length:e.hasOwnProperty(e.length-1))}var gn=function(e){function t(e){return null==e?Sn():Qt(e)?e.toSeq():function(e){var t=Pn(e);if(t)return t;if("object"==typeof e)return new _n(e);throw new TypeError("Expected Array or collection object of values, or keyed object: "+e)}(e)}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.toSeq=function(){return this},t.prototype.toString=function(){return this.__toString("Seq {","}")},t.prototype.cacheResult=function(){return !this._cache&&this.__iterateUncached&&(this._cache=this.entrySeq().toArray(),this.size=this._cache.length),this},t.prototype.__iterate=function(e,t){var n=this._cache;if(n){for(var r=n.length,i=0;i!==r;){var s=n[t?r-++i:i++];if(!1===e(s[1],s[0],this))break}return i}return this.__iterateUncached(e,t)},t.prototype.__iterator=function(e,t){var n=this._cache;if(n){var r=n.length,i=0;return new an(function(){if(i===r)return {value:void 0,done:!0};var s=n[t?r-++i:i++];return hn(e,s[0],s[1])})}return this.__iteratorUncached(e,t)},t}(Ut),yn=function(e){function t(e){return null==e?Sn().toKeyedSeq():Lt(e)?Bt(e)?e.toSeq():e.fromEntrySeq():Xt(e)?e.toSeq():In(e)}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.toKeyedSeq=function(){return this},t}(gn),xn=function(e){function t(e){return null==e?Sn():Lt(e)?Bt(e)?e.entrySeq():e.toIndexedSeq():Xt(e)?e.toSeq().entrySeq():wn(e)}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.of=function(){return t(arguments)},t.prototype.toIndexedSeq=function(){return this},t.prototype.toString=function(){return this.__toString("Seq [","]")},t}(gn),vn=function(e){function t(e){return (Lt(e)&&!Wt(e)?e:xn(e)).toSetSeq()}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.of=function(){return t(arguments)},t.prototype.toSetSeq=function(){return this},t}(gn);gn.isSeq=Kt,gn.Keyed=yn,gn.Set=vn,gn.Indexed=xn,gn.prototype[Ht]=!0;var En=function(e){function t(e){this._array=e,this.size=e.length;}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.get=function(e,t){return this.has(e)?this._array[Ct(this,e)]:t},t.prototype.__iterate=function(e,t){for(var n=this._array,r=n.length,i=0;i!==r;){var s=t?r-++i:i++;if(!1===e(n[s],s,this))break}return i},t.prototype.__iterator=function(e,t){var n=this._array,r=n.length,i=0;return new an(function(){if(i===r)return {value:void 0,done:!0};var s=t?r-++i:i++;return hn(e,s,n[s])})},t}(xn),_n=function(e){function t(e){var t=Object.keys(e);this._object=e,this._keys=t,this.size=t.length;}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.get=function(e,t){return void 0===t||this.has(e)?this._object[e]:t},t.prototype.has=function(e){return fn.call(this._object,e)},t.prototype.__iterate=function(e,t){for(var n=this._object,r=this._keys,i=r.length,s=0;s!==i;){var o=r[t?i-++s:s++];if(!1===e(n[o],o,this))break}return s},t.prototype.__iterator=function(e,t){var n=this._object,r=this._keys,i=r.length,s=0;return new an(function(){if(s===i)return {value:void 0,done:!0};var o=r[t?i-++s:s++];return hn(e,o,n[o])})},t}(yn);_n.prototype[Jt]=!0;var bn,An=function(e){function t(e){this._collection=e,this.size=e.length||e.size;}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.__iterateUncached=function(e,t){if(t)return this.cacheResult().__iterate(e,t);var n=pn(this._collection),r=0;if(ln(n))for(var i;!(i=n.next()).done&&!1!==e(i.value,r++,this););return r},t.prototype.__iteratorUncached=function(e,t){if(t)return this.cacheResult().__iterator(e,t);var n=pn(this._collection);if(!ln(n))return new an(un);var r=0;return new an(function(){var t=n.next();return t.done?t:hn(e,r++,t.value)})},t}(xn);function Sn(){return bn||(bn=new En([]))}function In(e){var t=Array.isArray(e)?new En(e):cn(e)?new An(e):void 0;if(t)return t.fromEntrySeq();if("object"==typeof e)return new _n(e);throw new TypeError("Expected Array or collection object of [k, v] entries, or keyed object: "+e)}function wn(e){var t=Pn(e);if(t)return t;throw new TypeError("Expected Array or collection object of values: "+e)}function Pn(e){return mn(e)?new En(e):cn(e)?new An(e):void 0}var kn="@@__IMMUTABLE_MAP__@@";function Cn(e){return Boolean(e&&e[kn])}function Nn(e){return Cn(e)&&Zt(e)}function $n(e){return Boolean(e&&"function"==typeof e.equals&&"function"==typeof e.hashCode)}function Rn(e,t){if(e===t||e!=e&&t!=t)return !0;if(!e||!t)return !1;if("function"==typeof e.valueOf&&"function"==typeof t.valueOf){if((e=e.valueOf())===(t=t.valueOf())||e!=e&&t!=t)return !0;if(!e||!t)return !1}return !!($n(e)&&$n(t)&&e.equals(t))}var On="function"==typeof Math.imul&&-2===Math.imul(4294967295,2)?Math.imul:function(e,t){var n=65535&(e|=0),r=65535&(t|=0);return n*r+((e>>>16)*r+n*(t>>>16)<<16>>>0)|0};function Mn(e){return e>>>1&1073741824|3221225471&e}var Tn=Object.prototype.valueOf;function Dn(e){switch(typeof e){case"boolean":return e?1108378657:1108378656;case"number":return function(e){if(e!=e||e===1/0)return 0;var t=0|e;t!==e&&(t^=4294967295*e);for(;e>4294967295;)t^=e/=4294967295;return Mn(t)}(e);case"string":return e.length>Fn?function(e){var t=Hn[e];void 0===t&&(t=Ln(e),Gn===qn&&(Gn=0,Hn={}),Gn++,Hn[e]=t);return t}(e):Ln(e);case"object":case"function":return null===e?1108378658:"function"==typeof e.hashCode?Mn(e.hashCode(e)):(e.valueOf!==Tn&&"function"==typeof e.valueOf&&(e=e.valueOf(e)),function(e){var t;if(jn&&void 0!==(t=zn.get(e)))return t;if(void 0!==(t=e[Un]))return t;if(!Bn){if(void 0!==(t=e.propertyIsEnumerable&&e.propertyIsEnumerable[Un]))return t;if(void 0!==(t=function(e){if(e&&e.nodeType>0)switch(e.nodeType){case 1:return e.uniqueID;case 9:return e.documentElement&&e.documentElement.uniqueID}}(e)))return t}t=++Wn,1073741824&Wn&&(Wn=0);if(jn)zn.set(e,t);else{if(void 0!==Vn&&!1===Vn(e))throw new Error("Non-extensible objects are not allowed as keys.");if(Bn)Object.defineProperty(e,Un,{enumerable:!1,configurable:!1,writable:!1,value:t});else if(void 0!==e.propertyIsEnumerable&&e.propertyIsEnumerable===e.constructor.prototype.propertyIsEnumerable)e.propertyIsEnumerable=function(){return this.constructor.prototype.propertyIsEnumerable.apply(this,arguments)},e.propertyIsEnumerable[Un]=t;else{if(void 0===e.nodeType)throw new Error("Unable to set a non-enumerable property on object.");e[Un]=t;}}return t}(e));case"undefined":return 1108378659;default:if("function"==typeof e.toString)return Ln(e.toString());throw new Error("Value type "+typeof e+" cannot be hashed.")}}function Ln(e){for(var t=0,n=0;n<e.length;n++)t=31*t+e.charCodeAt(n)|0;return Mn(t)}var Vn=Object.isExtensible,Bn=function(){try{return Object.defineProperty({},"@",{}),!0}catch(e){return !1}}();var zn,jn="function"==typeof WeakMap;jn&&(zn=new WeakMap);var Wn=0,Un="__immutablehash__";"function"==typeof Symbol&&(Un=Symbol(Un));var Fn=16,qn=255,Gn=0,Hn={},Kn=function(e){function t(e,t){this._iter=e,this._useKeys=t,this.size=e.size;}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.get=function(e,t){return this._iter.get(e,t)},t.prototype.has=function(e){return this._iter.has(e)},t.prototype.valueSeq=function(){return this._iter.valueSeq()},t.prototype.reverse=function(){var e=this,t=er(this,!0);return this._useKeys||(t.valueSeq=function(){return e._iter.toSeq().reverse()}),t},t.prototype.map=function(e,t){var n=this,r=Zn(this,e,t);return this._useKeys||(r.valueSeq=function(){return n._iter.toSeq().map(e,t)}),r},t.prototype.__iterate=function(e,t){var n=this;return this._iter.__iterate(function(t,r){return e(t,r,n)},t)},t.prototype.__iterator=function(e,t){return this._iter.__iterator(e,t)},t}(yn);Kn.prototype[Jt]=!0;var Yn=function(e){function t(e){this._iter=e,this.size=e.size;}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.includes=function(e){return this._iter.includes(e)},t.prototype.__iterate=function(e,t){var n=this,r=0;return t&&kt(this),this._iter.__iterate(function(i){return e(i,t?n.size-++r:r++,n)},t)},t.prototype.__iterator=function(e,t){var n=this,r=this._iter.__iterator(tn,t),i=0;return t&&kt(this),new an(function(){var s=r.next();return s.done?s:hn(e,t?n.size-++i:i++,s.value,s)})},t}(xn),Xn=function(e){function t(e){this._iter=e,this.size=e.size;}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.has=function(e){return this._iter.includes(e)},t.prototype.__iterate=function(e,t){var n=this;return this._iter.__iterate(function(t){return e(t,t,n)},t)},t.prototype.__iterator=function(e,t){var n=this._iter.__iterator(tn,t);return new an(function(){var t=n.next();return t.done?t:hn(e,t.value,t.value,t)})},t}(vn),Qn=function(e){function t(e){this._iter=e,this.size=e.size;}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.entrySeq=function(){return this._iter.toSeq()},t.prototype.__iterate=function(e,t){var n=this;return this._iter.__iterate(function(t){if(t){cr(t);var r=Lt(t);return e(r?t.get(1):t[1],r?t.get(0):t[0],n)}},t)},t.prototype.__iterator=function(e,t){var n=this._iter.__iterator(tn,t);return new an(function(){for(;;){var t=n.next();if(t.done)return t;var r=t.value;if(r){cr(r);var i=Lt(r);return hn(e,i?r.get(0):r[0],i?r.get(1):r[1],t)}}})},t}(yn);function Jn(e){var t=pr(e);return t._iter=e,t.size=e.size,t.flip=function(){return e},t.reverse=function(){var t=e.reverse.apply(this);return t.flip=function(){return e.reverse()},t},t.has=function(t){return e.includes(t)},t.includes=function(t){return e.has(t)},t.cacheResult=dr,t.__iterateUncached=function(t,n){var r=this;return e.__iterate(function(e,n){return !1!==t(n,e,r)},n)},t.__iteratorUncached=function(t,n){if(t===nn){var r=e.__iterator(t,n);return new an(function(){var e=r.next();if(!e.done){var t=e.value[0];e.value[0]=e.value[1],e.value[1]=t;}return e})}return e.__iterator(t===tn?en:tn,n)},t}function Zn(e,t,n){var r=pr(e);return r.size=e.size,r.has=function(t){return e.has(t)},r.get=function(r,i){var s=e.get(r,It);return s===It?i:t.call(n,s,r,e)},r.__iterateUncached=function(r,i){var s=this;return e.__iterate(function(e,i,o){return !1!==r(t.call(n,e,i,o),i,s)},i)},r.__iteratorUncached=function(r,i){var s=e.__iterator(nn,i);return new an(function(){var i=s.next();if(i.done)return i;var o=i.value,a=o[0];return hn(r,a,t.call(n,o[1],a,e),i)})},r}function er(e,t){var n=this,r=pr(e);return r._iter=e,r.size=e.size,r.reverse=function(){return e},e.flip&&(r.flip=function(){var t=Jn(e);return t.reverse=function(){return e.flip()},t}),r.get=function(n,r){return e.get(t?n:-1-n,r)},r.has=function(n){return e.has(t?n:-1-n)},r.includes=function(t){return e.includes(t)},r.cacheResult=dr,r.__iterate=function(n,r){var i=this,s=0;return r&&kt(e),e.__iterate(function(e,o){return n(e,t?o:r?i.size-++s:s++,i)},!r)},r.__iterator=function(r,i){var s=0;i&&kt(e);var o=e.__iterator(nn,!i);return new an(function(){var e=o.next();if(e.done)return e;var a=e.value;return hn(r,t?a[0]:i?n.size-++s:s++,a[1],e)})},r}function tr(e,t,n,r){var i=pr(e);return r&&(i.has=function(r){var i=e.get(r,It);return i!==It&&!!t.call(n,i,r,e)},i.get=function(r,i){var s=e.get(r,It);return s!==It&&t.call(n,s,r,e)?s:i}),i.__iterateUncached=function(i,s){var o=this,a=0;return e.__iterate(function(e,s,h){if(t.call(n,e,s,h))return a++,i(e,r?s:a-1,o)},s),a},i.__iteratorUncached=function(i,s){var o=e.__iterator(nn,s),a=0;return new an(function(){for(;;){var s=o.next();if(s.done)return s;var h=s.value,u=h[0],c=h[1];if(t.call(n,c,u,e))return hn(i,r?u:a++,c,s)}})},i}function nr(e,t,n,r){var i=e.size;if($t(t,n,i))return e;var s=Rt(t,i),o=Ot(n,i);if(s!=s||o!=o)return nr(e.toSeq().cacheResult(),t,n,r);var a,h=o-s;h==h&&(a=h<0?0:h);var u=pr(e);return u.size=0===a?a:e.size&&a||void 0,!r&&Kt(e)&&a>=0&&(u.get=function(t,n){return (t=Ct(this,t))>=0&&t<a?e.get(t+s,n):n}),u.__iterateUncached=function(t,n){var i=this;if(0===a)return 0;if(n)return this.cacheResult().__iterate(t,n);var o=0,h=!0,u=0;return e.__iterate(function(e,n){if(!h||!(h=o++<s))return u++,!1!==t(e,r?n:u-1,i)&&u!==a}),u},u.__iteratorUncached=function(t,n){if(0!==a&&n)return this.cacheResult().__iterator(t,n);if(0===a)return new an(un);var i=e.__iterator(t,n),o=0,h=0;return new an(function(){for(;o++<s;)i.next();if(++h>a)return {value:void 0,done:!0};var e=i.next();return r||t===tn||e.done?e:hn(t,h-1,t===en?void 0:e.value[1],e)})},u}function rr(e,t,n,r){var i=pr(e);return i.__iterateUncached=function(i,s){var o=this;if(s)return this.cacheResult().__iterate(i,s);var a=!0,h=0;return e.__iterate(function(e,s,u){if(!a||!(a=t.call(n,e,s,u)))return h++,i(e,r?s:h-1,o)}),h},i.__iteratorUncached=function(i,s){var o=this;if(s)return this.cacheResult().__iterator(i,s);var a=e.__iterator(nn,s),h=!0,u=0;return new an(function(){var e,s,c;do{if((e=a.next()).done)return r||i===tn?e:hn(i,u++,i===en?void 0:e.value[1],e);var l=e.value;s=l[0],c=l[1],h&&(h=t.call(n,c,s,o));}while(h);return i===nn?e:hn(i,s,c,e)})},i}function ir(e,t,n){var r=pr(e);return r.__iterateUncached=function(i,s){if(s)return this.cacheResult().__iterate(i,s);var o=0,a=!1;return function e(h,u){h.__iterate(function(s,h){return (!t||u<t)&&Lt(s)?e(s,u+1):(o++,!1===i(s,n?h:o-1,r)&&(a=!0)),!a},s);}(e,0),o},r.__iteratorUncached=function(r,i){if(i)return this.cacheResult().__iterator(r,i);var s=e.__iterator(r,i),o=[],a=0;return new an(function(){for(;s;){var e=s.next();if(!1===e.done){var h=e.value;if(r===nn&&(h=h[1]),t&&!(o.length<t)||!Lt(h))return n?e:hn(r,a++,h,e);o.push(s),s=h.__iterator(r,i);}else s=o.pop();}return {value:void 0,done:!0}})},r}function sr(e,t,n){t||(t=fr);var r=Bt(e),i=0,s=e.toSeq().map(function(t,r){return [r,t,i++,n?n(t,r,e):t]}).valueSeq().toArray();return s.sort(function(e,n){return t(e[3],n[3])||e[2]-n[2]}).forEach(r?function(e,t){s[t].length=2;}:function(e,t){s[t]=e[1];}),r?yn(s):jt(e)?xn(s):vn(s)}function or(e,t,n){if(t||(t=fr),n){var r=e.toSeq().map(function(t,r){return [t,n(t,r,e)]}).reduce(function(e,n){return ar(t,e[1],n[1])?n:e});return r&&r[0]}return e.reduce(function(e,n){return ar(t,e,n)?n:e})}function ar(e,t,n){var r=e(n,t);return 0===r&&n!==t&&(null==n||n!=n)||r>0}function hr(e,t,n,r){var i=pr(e),s=new En(n).map(function(e){return e.size});return i.size=r?s.max():s.min(),i.__iterate=function(e,t){for(var n,r=this.__iterator(tn,t),i=0;!(n=r.next()).done&&!1!==e(n.value,i++,this););return i},i.__iteratorUncached=function(e,i){var s=n.map(function(e){return e=Ut(e),pn(i?e.reverse():e)}),o=0,a=!1;return new an(function(){var n;return a||(n=s.map(function(e){return e.next()}),a=r?n.every(function(e){return e.done}):n.some(function(e){return e.done})),a?{value:void 0,done:!0}:hn(e,o++,t.apply(null,n.map(function(e){return e.value})))})},i}function ur(e,t){return e===t?e:Kt(e)?t:e.constructor(t)}function cr(e){if(e!==Object(e))throw new TypeError("Expected [K, V] tuple: "+e)}function lr(e){return Bt(e)?Ft:jt(e)?qt:Gt}function pr(e){return Object.create((Bt(e)?yn:jt(e)?xn:vn).prototype)}function dr(){return this._iter.cacheResult?(this._iter.cacheResult(),this.size=this._iter.size,this):gn.prototype.cacheResult.call(this)}function fr(e,t){return void 0===e&&void 0===t?0:void 0===e?1:void 0===t?-1:e>t?1:e<t?-1:0}function mr(e,t){t=t||0;for(var n=Math.max(0,e.length-t),r=new Array(n),i=0;i<n;i++)r[i]=e[i+t];return r}function gr(e,t){if(!e)throw new Error(t)}function yr(e){gr(e!==1/0,"Cannot perform this action with an infinite size.");}function xr(e){if(mn(e)&&"string"!=typeof e)return e;if(Zt(e))return e.toArray();throw new TypeError("Invalid keyPath: expected Ordered Collection or Array: "+e)}function vr(e){return e&&("function"!=typeof e.constructor||"Object"===e.constructor.name)}function Er(e){return "object"==typeof e&&(Qt(e)||Array.isArray(e)||vr(e))}function _r(e){try{return "string"==typeof e?JSON.stringify(e):String(e)}catch(t){return JSON.stringify(e)}}function br(e,t){return Qt(e)?e.has(t):Er(e)&&fn.call(e,t)}function Ar(e,t,n){return Qt(e)?e.get(t,n):br(e,t)?"function"==typeof e.get?e.get(t):e[t]:n}function Sr(e){if(Array.isArray(e))return mr(e);var t={};for(var n in e)fn.call(e,n)&&(t[n]=e[n]);return t}function Ir(e,t){if(!Er(e))throw new TypeError("Cannot update non-data-structure value: "+e);if(Qt(e)){if(!e.remove)throw new TypeError("Cannot update immutable value without .remove() method: "+e);return e.remove(t)}if(!fn.call(e,t))return e;var n=Sr(e);return Array.isArray(n)?n.splice(t,1):delete n[t],n}function wr(e,t,n){if(!Er(e))throw new TypeError("Cannot update non-data-structure value: "+e);if(Qt(e)){if(!e.set)throw new TypeError("Cannot update immutable value without .set() method: "+e);return e.set(t,n)}if(fn.call(e,t)&&n===e[t])return e;var r=Sr(e);return r[t]=n,r}function Pr(e,t,n,r){r||(r=n,n=void 0);var i=function e(t,n,r,i,s,o){var a=n===It;if(i===r.length){var h=a?s:n,u=o(h);return u===h?n:u}if(!a&&!Er(n))throw new TypeError("Cannot update within non-data-structure value in path ["+r.slice(0,i).map(_r)+"]: "+n);var c=r[i];var l=a?It:Ar(n,c,It);var p=e(l===It?t:Qt(l),l,r,i+1,s,o);return p===l?n:p===It?Ir(n,c):wr(a?t?oi():{}:n,c,p)}(Qt(e),e,xr(t),0,n,r);return i===It?n:i}function kr(e,t,n){return Pr(e,t,It,function(){return n})}function Cr(e,t){return kr(this,e,t)}function Nr(e,t){return Pr(e,t,function(){return It})}function $r(e){return Nr(this,e)}function Rr(e,t,n,r){return Pr(e,[t],n,r)}function Or(e,t,n){return 1===arguments.length?e(this):Rr(this,e,t,n)}function Mr(e,t,n){return Pr(this,e,t,n)}function Tr(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return Lr(this,e)}function Dr(e){for(var t=[],n=arguments.length-1;n-- >0;)t[n]=arguments[n+1];if("function"!=typeof e)throw new TypeError("Invalid merger function: "+e);return Lr(this,t,e)}function Lr(e,t,n){for(var r=[],i=0;i<t.length;i++){var s=Ft(t[i]);0!==s.size&&r.push(s);}return 0===r.length?e:0!==e.toSeq().size||e.__ownerID||1!==r.length?e.withMutations(function(e){for(var t=n?function(t,r){Rr(e,r,It,function(e){return e===It?t:n(e,t,r)});}:function(t,n){e.set(n,t);},i=0;i<r.length;i++)r[i].forEach(t);}):e.constructor(r[0])}function Vr(e,t,n){return Br(e,t,function(e){return function t(n,r,i){return Er(n)&&Er(r)?Br(n,[r],t):e?e(n,r,i):r}}(n))}function Br(e,t,n){if(!Er(e))throw new TypeError("Cannot merge into non-data-structure value: "+e);if(Qt(e))return "function"==typeof n&&e.mergeWith?e.mergeWith.apply(e,[n].concat(t)):e.merge?e.merge.apply(e,t):e.concat.apply(e,t);for(var r=Array.isArray(e),i=e,s=r?qt:Ft,o=r?function(t){i===e&&(i=Sr(i)),i.push(t);}:function(t,r){var s=fn.call(i,r),o=s&&n?n(i[r],t,r):t;s&&o===i[r]||(i===e&&(i=Sr(i)),i[r]=o);},a=0;a<t.length;a++)s(t[a]).forEach(o);return i}function zr(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return Vr(this,e)}function jr(e){for(var t=[],n=arguments.length-1;n-- >0;)t[n]=arguments[n+1];return Vr(this,t,e)}function Wr(e){for(var t=[],n=arguments.length-1;n-- >0;)t[n]=arguments[n+1];return Pr(this,e,oi(),function(e){return Br(e,t)})}function Ur(e){for(var t=[],n=arguments.length-1;n-- >0;)t[n]=arguments[n+1];return Pr(this,e,oi(),function(e){return Vr(e,t)})}function Fr(e){var t=this.asMutable();return e(t),t.wasAltered()?t.__ensureOwner(this.__ownerID):this}function qr(){return this.__ownerID?this:this.__ensureOwner(new Pt)}function Gr(){return this.__ensureOwner()}function Hr(){return this.__altered}Yn.prototype.cacheResult=Kn.prototype.cacheResult=Xn.prototype.cacheResult=Qn.prototype.cacheResult=dr;var Kr=function(e){function t(t){return null==t?oi():Cn(t)&&!Zt(t)?t:oi().withMutations(function(n){var r=e(t);yr(r.size),r.forEach(function(e,t){return n.set(t,e)});})}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.of=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return oi().withMutations(function(t){for(var n=0;n<e.length;n+=2){if(n+1>=e.length)throw new Error("Missing value for key: "+e[n]);t.set(e[n],e[n+1]);}})},t.prototype.toString=function(){return this.__toString("Map {","}")},t.prototype.get=function(e,t){return this._root?this._root.get(0,void 0,e,t):t},t.prototype.set=function(e,t){return ai(this,e,t)},t.prototype.remove=function(e){return ai(this,e,It)},t.prototype.deleteAll=function(e){var t=Ut(e);return 0===t.size?this:this.withMutations(function(e){t.forEach(function(t){return e.remove(t)});})},t.prototype.clear=function(){return 0===this.size?this:this.__ownerID?(this.size=0,this._root=null,this.__hash=void 0,this.__altered=!0,this):oi()},t.prototype.sort=function(e){return Ri(sr(this,e))},t.prototype.sortBy=function(e,t){return Ri(sr(this,t,e))},t.prototype.map=function(e,t){return this.withMutations(function(n){n.forEach(function(r,i){n.set(i,e.call(t,r,i,n));});})},t.prototype.__iterator=function(e,t){return new ni(this,e,t)},t.prototype.__iterate=function(e,t){var n=this,r=0;return this._root&&this._root.iterate(function(t){return r++,e(t[1],t[0],n)},t),r},t.prototype.__ensureOwner=function(e){return e===this.__ownerID?this:e?si(this.size,this._root,e,this.__hash):0===this.size?oi():(this.__ownerID=e,this.__altered=!1,this)},t}(Ft);Kr.isMap=Cn;var Yr=Kr.prototype;Yr[kn]=!0,Yr.delete=Yr.remove,Yr.removeAll=Yr.deleteAll,Yr.setIn=Cr,Yr.removeIn=Yr.deleteIn=$r,Yr.update=Or,Yr.updateIn=Mr,Yr.merge=Yr.concat=Tr,Yr.mergeWith=Dr,Yr.mergeDeep=zr,Yr.mergeDeepWith=jr,Yr.mergeIn=Wr,Yr.mergeDeepIn=Ur,Yr.withMutations=Fr,Yr.wasAltered=Hr,Yr.asImmutable=Gr,Yr["@@transducer/init"]=Yr.asMutable=qr,Yr["@@transducer/step"]=function(e,t){return e.set(t[0],t[1])},Yr["@@transducer/result"]=function(e){return e.asImmutable()};var Xr=function(e,t){this.ownerID=e,this.entries=t;};Xr.prototype.get=function(e,t,n,r){for(var i=this.entries,s=0,o=i.length;s<o;s++)if(Rn(n,i[s][0]))return i[s][1];return r},Xr.prototype.update=function(e,t,n,r,i,s,o){for(var a=i===It,h=this.entries,u=0,c=h.length;u<c&&!Rn(r,h[u][0]);u++);var l=u<c;if(l?h[u][1]===i:a)return this;if(wt(o),(a||!l)&&wt(s),!a||1!==h.length){if(!l&&!a&&h.length>=di)return function(e,t,n,r){e||(e=new Pt);for(var i=new ei(e,Dn(n),[n,r]),s=0;s<t.length;s++){var o=t[s];i=i.update(e,0,void 0,o[0],o[1]);}return i}(e,h,r,i);var p=e&&e===this.ownerID,d=p?h:mr(h);return l?a?u===c-1?d.pop():d[u]=d.pop():d[u]=[r,i]:d.push([r,i]),p?(this.entries=d,this):new Xr(e,d)}};var Qr=function(e,t,n){this.ownerID=e,this.bitmap=t,this.nodes=n;};Qr.prototype.get=function(e,t,n,r){void 0===t&&(t=Dn(n));var i=1<<((0===e?t:t>>>e)&St),s=this.bitmap;return 0==(s&i)?r:this.nodes[li(s&i-1)].get(e+bt,t,n,r)},Qr.prototype.update=function(e,t,n,r,i,s,o){void 0===n&&(n=Dn(r));var a=(0===t?n:n>>>t)&St,h=1<<a,u=this.bitmap,c=0!=(u&h);if(!c&&i===It)return this;var l=li(u&h-1),p=this.nodes,d=c?p[l]:void 0,f=hi(d,e,t+bt,n,r,i,s,o);if(f===d)return this;if(!c&&f&&p.length>=fi)return function(e,t,n,r,i){for(var s=0,o=new Array(At),a=0;0!==n;a++,n>>>=1)o[a]=1&n?t[s++]:void 0;return o[r]=i,new Jr(e,s+1,o)}(e,p,u,a,f);if(c&&!f&&2===p.length&&ui(p[1^l]))return p[1^l];if(c&&f&&1===p.length&&ui(f))return f;var m=e&&e===this.ownerID,g=c?f?u:u^h:u|h,y=c?f?pi(p,l,f,m):function(e,t,n){var r=e.length-1;if(n&&t===r)return e.pop(),e;for(var i=new Array(r),s=0,o=0;o<r;o++)o===t&&(s=1),i[o]=e[o+s];return i}(p,l,m):function(e,t,n,r){var i=e.length+1;if(r&&t+1===i)return e[t]=n,e;for(var s=new Array(i),o=0,a=0;a<i;a++)a===t?(s[a]=n,o=-1):s[a]=e[a+o];return s}(p,l,f,m);return m?(this.bitmap=g,this.nodes=y,this):new Qr(e,g,y)};var Jr=function(e,t,n){this.ownerID=e,this.count=t,this.nodes=n;};Jr.prototype.get=function(e,t,n,r){void 0===t&&(t=Dn(n));var i=(0===e?t:t>>>e)&St,s=this.nodes[i];return s?s.get(e+bt,t,n,r):r},Jr.prototype.update=function(e,t,n,r,i,s,o){void 0===n&&(n=Dn(r));var a=(0===t?n:n>>>t)&St,h=i===It,u=this.nodes,c=u[a];if(h&&!c)return this;var l=hi(c,e,t+bt,n,r,i,s,o);if(l===c)return this;var p=this.count;if(c){if(!l&&--p<mi)return function(e,t,n,r){for(var i=0,s=0,o=new Array(n),a=0,h=1,u=t.length;a<u;a++,h<<=1){var c=t[a];void 0!==c&&a!==r&&(i|=h,o[s++]=c);}return new Qr(e,i,o)}(e,u,p,a)}else p++;var d=e&&e===this.ownerID,f=pi(u,a,l,d);return d?(this.count=p,this.nodes=f,this):new Jr(e,p,f)};var Zr=function(e,t,n){this.ownerID=e,this.keyHash=t,this.entries=n;};Zr.prototype.get=function(e,t,n,r){for(var i=this.entries,s=0,o=i.length;s<o;s++)if(Rn(n,i[s][0]))return i[s][1];return r},Zr.prototype.update=function(e,t,n,r,i,s,o){void 0===n&&(n=Dn(r));var a=i===It;if(n!==this.keyHash)return a?this:(wt(o),wt(s),ci(this,e,t,n,[r,i]));for(var h=this.entries,u=0,c=h.length;u<c&&!Rn(r,h[u][0]);u++);var l=u<c;if(l?h[u][1]===i:a)return this;if(wt(o),(a||!l)&&wt(s),a&&2===c)return new ei(e,this.keyHash,h[1^u]);var p=e&&e===this.ownerID,d=p?h:mr(h);return l?a?u===c-1?d.pop():d[u]=d.pop():d[u]=[r,i]:d.push([r,i]),p?(this.entries=d,this):new Zr(e,this.keyHash,d)};var ei=function(e,t,n){this.ownerID=e,this.keyHash=t,this.entry=n;};ei.prototype.get=function(e,t,n,r){return Rn(n,this.entry[0])?this.entry[1]:r},ei.prototype.update=function(e,t,n,r,i,s,o){var a=i===It,h=Rn(r,this.entry[0]);return (h?i===this.entry[1]:a)?this:(wt(o),a?void wt(s):h?e&&e===this.ownerID?(this.entry[1]=i,this):new ei(e,this.keyHash,[r,i]):(wt(s),ci(this,e,t,Dn(r),[r,i])))},Xr.prototype.iterate=Zr.prototype.iterate=function(e,t){for(var n=this.entries,r=0,i=n.length-1;r<=i;r++)if(!1===e(n[t?i-r:r]))return !1},Qr.prototype.iterate=Jr.prototype.iterate=function(e,t){for(var n=this.nodes,r=0,i=n.length-1;r<=i;r++){var s=n[t?i-r:r];if(s&&!1===s.iterate(e,t))return !1}},ei.prototype.iterate=function(e,t){return e(this.entry)};var ti,ni=function(e){function t(e,t,n){this._type=t,this._reverse=n,this._stack=e._root&&ii(e._root);}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.next=function(){for(var e=this._type,t=this._stack;t;){var n=t.node,r=t.index++,i=void 0;if(n.entry){if(0===r)return ri(e,n.entry)}else if(n.entries){if(r<=(i=n.entries.length-1))return ri(e,n.entries[this._reverse?i-r:r])}else if(r<=(i=n.nodes.length-1)){var s=n.nodes[this._reverse?i-r:r];if(s){if(s.entry)return ri(e,s.entry);t=this._stack=ii(s,t);}continue}t=this._stack=this._stack.__prev;}return {value:void 0,done:!0}},t}(an);function ri(e,t){return hn(e,t[0],t[1])}function ii(e,t){return {node:e,index:0,__prev:t}}function si(e,t,n,r){var i=Object.create(Yr);return i.size=e,i._root=t,i.__ownerID=n,i.__hash=r,i.__altered=!1,i}function oi(){return ti||(ti=si(0))}function ai(e,t,n){var r,i;if(e._root){var s={value:!1},o={value:!1};if(r=hi(e._root,e.__ownerID,0,void 0,t,n,s,o),!o.value)return e;i=e.size+(s.value?n===It?-1:1:0);}else{if(n===It)return e;i=1,r=new Xr(e.__ownerID,[[t,n]]);}return e.__ownerID?(e.size=i,e._root=r,e.__hash=void 0,e.__altered=!0,e):r?si(i,r):oi()}function hi(e,t,n,r,i,s,o,a){return e?e.update(t,n,r,i,s,o,a):s===It?e:(wt(a),wt(o),new ei(t,r,[i,s]))}function ui(e){return e.constructor===ei||e.constructor===Zr}function ci(e,t,n,r,i){if(e.keyHash===r)return new Zr(t,r,[e.entry,i]);var s,o=(0===n?e.keyHash:e.keyHash>>>n)&St,a=(0===n?r:r>>>n)&St,h=o===a?[ci(e,t,n+bt,r,i)]:(s=new ei(t,r,i),o<a?[e,s]:[s,e]);return new Qr(t,1<<o|1<<a,h)}function li(e){return e=(e=(858993459&(e-=e>>1&1431655765))+(e>>2&858993459))+(e>>4)&252645135,e+=e>>8,127&(e+=e>>16)}function pi(e,t,n,r){var i=r?e:mr(e);return i[t]=n,i}var di=At/4,fi=At/2,mi=At/4,gi="@@__IMMUTABLE_LIST__@@";function yi(e){return Boolean(e&&e[gi])}var xi=function(e){function t(t){var n=Ii();if(null==t)return n;if(yi(t))return t;var r=e(t),i=r.size;return 0===i?n:(yr(i),i>0&&i<At?Si(0,i,bt,null,new Ei(r.toArray())):n.withMutations(function(e){e.setSize(i),r.forEach(function(t,n){return e.set(n,t)});}))}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.of=function(){return this(arguments)},t.prototype.toString=function(){return this.__toString("List [","]")},t.prototype.get=function(e,t){if((e=Ct(this,e))>=0&&e<this.size){var n=ki(this,e+=this._origin);return n&&n.array[e&St]}return t},t.prototype.set=function(e,t){return function(e,t,n){if((t=Ct(e,t))!=t)return e;if(t>=e.size||t<0)return e.withMutations(function(e){t<0?Ci(e,t).set(0,n):Ci(e,0,t+1).set(t,n);});t+=e._origin;var r=e._tail,i=e._root,s={value:!1};t>=Ni(e._capacity)?r=wi(r,e.__ownerID,0,t,n,s):i=wi(i,e.__ownerID,e._level,t,n,s);if(!s.value)return e;if(e.__ownerID)return e._root=i,e._tail=r,e.__hash=void 0,e.__altered=!0,e;return Si(e._origin,e._capacity,e._level,i,r)}(this,e,t)},t.prototype.remove=function(e){return this.has(e)?0===e?this.shift():e===this.size-1?this.pop():this.splice(e,1):this},t.prototype.insert=function(e,t){return this.splice(e,0,t)},t.prototype.clear=function(){return 0===this.size?this:this.__ownerID?(this.size=this._origin=this._capacity=0,this._level=bt,this._root=this._tail=null,this.__hash=void 0,this.__altered=!0,this):Ii()},t.prototype.push=function(){var e=arguments,t=this.size;return this.withMutations(function(n){Ci(n,0,t+e.length);for(var r=0;r<e.length;r++)n.set(t+r,e[r]);})},t.prototype.pop=function(){return Ci(this,0,-1)},t.prototype.unshift=function(){var e=arguments;return this.withMutations(function(t){Ci(t,-e.length);for(var n=0;n<e.length;n++)t.set(n,e[n]);})},t.prototype.shift=function(){return Ci(this,1)},t.prototype.concat=function(){for(var t=arguments,n=[],r=0;r<arguments.length;r++){var i=t[r],s=e("string"!=typeof i&&cn(i)?i:[i]);0!==s.size&&n.push(s);}return 0===n.length?this:0!==this.size||this.__ownerID||1!==n.length?this.withMutations(function(e){n.forEach(function(t){return t.forEach(function(t){return e.push(t)})});}):this.constructor(n[0])},t.prototype.setSize=function(e){return Ci(this,0,e)},t.prototype.map=function(e,t){var n=this;return this.withMutations(function(r){for(var i=0;i<n.size;i++)r.set(i,e.call(t,r.get(i),i,r));})},t.prototype.slice=function(e,t){var n=this.size;return $t(e,t,n)?this:Ci(this,Rt(e,n),Ot(t,n))},t.prototype.__iterator=function(e,t){var n=t?this.size:0,r=Ai(this,t);return new an(function(){var i=r();return i===bi?{value:void 0,done:!0}:hn(e,t?--n:n++,i)})},t.prototype.__iterate=function(e,t){for(var n,r=t?this.size:0,i=Ai(this,t);(n=i())!==bi&&!1!==e(n,t?--r:r++,this););return r},t.prototype.__ensureOwner=function(e){return e===this.__ownerID?this:e?Si(this._origin,this._capacity,this._level,this._root,this._tail,e,this.__hash):0===this.size?Ii():(this.__ownerID=e,this.__altered=!1,this)},t}(qt);xi.isList=yi;var vi=xi.prototype;vi[gi]=!0,vi.delete=vi.remove,vi.merge=vi.concat,vi.setIn=Cr,vi.deleteIn=vi.removeIn=$r,vi.update=Or,vi.updateIn=Mr,vi.mergeIn=Wr,vi.mergeDeepIn=Ur,vi.withMutations=Fr,vi.wasAltered=Hr,vi.asImmutable=Gr,vi["@@transducer/init"]=vi.asMutable=qr,vi["@@transducer/step"]=function(e,t){return e.push(t)},vi["@@transducer/result"]=function(e){return e.asImmutable()};var Ei=function(e,t){this.array=e,this.ownerID=t;};Ei.prototype.removeBefore=function(e,t,n){if(n===t?1<<t:0===this.array.length)return this;var r=n>>>t&St;if(r>=this.array.length)return new Ei([],e);var i,s=0===r;if(t>0){var o=this.array[r];if((i=o&&o.removeBefore(e,t-bt,n))===o&&s)return this}if(s&&!i)return this;var a=Pi(this,e);if(!s)for(var h=0;h<r;h++)a.array[h]=void 0;return i&&(a.array[r]=i),a},Ei.prototype.removeAfter=function(e,t,n){if(n===(t?1<<t:0)||0===this.array.length)return this;var r,i=n-1>>>t&St;if(i>=this.array.length)return this;if(t>0){var s=this.array[i];if((r=s&&s.removeAfter(e,t-bt,n))===s&&i===this.array.length-1)return this}var o=Pi(this,e);return o.array.splice(i+1),r&&(o.array[i]=r),o};var _i,bi={};function Ai(e,t){var n=e._origin,r=e._capacity,i=Ni(r),s=e._tail;return o(e._root,e._level,0);function o(e,a,h){return 0===a?function(e,o){var a=o===i?s&&s.array:e&&e.array,h=o>n?0:n-o,u=r-o;u>At&&(u=At);return function(){if(h===u)return bi;var e=t?--u:h++;return a&&a[e]}}(e,h):function(e,i,s){var a,h=e&&e.array,u=s>n?0:n-s>>i,c=1+(r-s>>i);c>At&&(c=At);return function(){for(;;){if(a){var e=a();if(e!==bi)return e;a=null;}if(u===c)return bi;var n=t?--c:u++;a=o(h&&h[n],i-bt,s+(n<<i));}}}(e,a,h)}}function Si(e,t,n,r,i,s,o){var a=Object.create(vi);return a.size=t-e,a._origin=e,a._capacity=t,a._level=n,a._root=r,a._tail=i,a.__ownerID=s,a.__hash=o,a.__altered=!1,a}function Ii(){return _i||(_i=Si(0,0,bt))}function wi(e,t,n,r,i,s){var o,a=r>>>n&St,h=e&&a<e.array.length;if(!h&&void 0===i)return e;if(n>0){var u=e&&e.array[a],c=wi(u,t,n-bt,r,i,s);return c===u?e:((o=Pi(e,t)).array[a]=c,o)}return h&&e.array[a]===i?e:(s&&wt(s),o=Pi(e,t),void 0===i&&a===o.array.length-1?o.array.pop():o.array[a]=i,o)}function Pi(e,t){return t&&e&&t===e.ownerID?e:new Ei(e?e.array.slice():[],t)}function ki(e,t){if(t>=Ni(e._capacity))return e._tail;if(t<1<<e._level+bt){for(var n=e._root,r=e._level;n&&r>0;)n=n.array[t>>>r&St],r-=bt;return n}}function Ci(e,t,n){void 0!==t&&(t|=0),void 0!==n&&(n|=0);var r=e.__ownerID||new Pt,i=e._origin,s=e._capacity,o=i+t,a=void 0===n?s:n<0?s+n:i+n;if(o===i&&a===s)return e;if(o>=a)return e.clear();for(var h=e._level,u=e._root,c=0;o+c<0;)u=new Ei(u&&u.array.length?[void 0,u]:[],r),c+=1<<(h+=bt);c&&(o+=c,i+=c,a+=c,s+=c);for(var l=Ni(s),p=Ni(a);p>=1<<h+bt;)u=new Ei(u&&u.array.length?[u]:[],r),h+=bt;var d=e._tail,f=p<l?ki(e,a-1):p>l?new Ei([],r):d;if(d&&p>l&&o<s&&d.array.length){for(var m=u=Pi(u,r),g=h;g>bt;g-=bt){var y=l>>>g&St;m=m.array[y]=Pi(m.array[y],r);}m.array[l>>>bt&St]=d;}if(a<s&&(f=f&&f.removeAfter(r,0,a)),o>=p)o-=p,a-=p,h=bt,u=null,f=f&&f.removeBefore(r,0,o);else if(o>i||p<l){for(c=0;u;){var x=o>>>h&St;if(x!==p>>>h&St)break;x&&(c+=(1<<h)*x),h-=bt,u=u.array[x];}u&&o>i&&(u=u.removeBefore(r,h,o-c)),u&&p<l&&(u=u.removeAfter(r,h,p-c)),c&&(o-=c,a-=c);}return e.__ownerID?(e.size=a-o,e._origin=o,e._capacity=a,e._level=h,e._root=u,e._tail=f,e.__hash=void 0,e.__altered=!0,e):Si(o,a,h,u,f)}function Ni(e){return e<At?0:e-1>>>bt<<bt}var $i,Ri=function(e){function t(e){return null==e?Mi():Nn(e)?e:Mi().withMutations(function(t){var n=Ft(e);yr(n.size),n.forEach(function(e,n){return t.set(n,e)});})}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.of=function(){return this(arguments)},t.prototype.toString=function(){return this.__toString("OrderedMap {","}")},t.prototype.get=function(e,t){var n=this._map.get(e);return void 0!==n?this._list.get(n)[1]:t},t.prototype.clear=function(){return 0===this.size?this:this.__ownerID?(this.size=0,this._map.clear(),this._list.clear(),this):Mi()},t.prototype.set=function(e,t){return Ti(this,e,t)},t.prototype.remove=function(e){return Ti(this,e,It)},t.prototype.wasAltered=function(){return this._map.wasAltered()||this._list.wasAltered()},t.prototype.__iterate=function(e,t){var n=this;return this._list.__iterate(function(t){return t&&e(t[1],t[0],n)},t)},t.prototype.__iterator=function(e,t){return this._list.fromEntrySeq().__iterator(e,t)},t.prototype.__ensureOwner=function(e){if(e===this.__ownerID)return this;var t=this._map.__ensureOwner(e),n=this._list.__ensureOwner(e);return e?Oi(t,n,e,this.__hash):0===this.size?Mi():(this.__ownerID=e,this._map=t,this._list=n,this)},t}(Kr);function Oi(e,t,n,r){var i=Object.create(Ri.prototype);return i.size=e?e.size:0,i._map=e,i._list=t,i.__ownerID=n,i.__hash=r,i}function Mi(){return $i||($i=Oi(oi(),Ii()))}function Ti(e,t,n){var r,i,s=e._map,o=e._list,a=s.get(t),h=void 0!==a;if(n===It){if(!h)return e;o.size>=At&&o.size>=2*s.size?(r=(i=o.filter(function(e,t){return void 0!==e&&a!==t})).toKeyedSeq().map(function(e){return e[0]}).flip().toMap(),e.__ownerID&&(r.__ownerID=i.__ownerID=e.__ownerID)):(r=s.remove(t),i=a===o.size-1?o.pop():o.set(a,void 0));}else if(h){if(n===o.get(a)[1])return e;r=s,i=o.set(a,[t,n]);}else r=s.set(t,o.size),i=o.set(o.size,[t,n]);return e.__ownerID?(e.size=r.size,e._map=r,e._list=i,e.__hash=void 0,e):Oi(r,i)}Ri.isOrderedMap=Nn,Ri.prototype[Jt]=!0,Ri.prototype.delete=Ri.prototype.remove;var Di="@@__IMMUTABLE_STACK__@@";function Li(e){return Boolean(e&&e[Di])}var Vi=function(e){function t(e){return null==e?Wi():Li(e)?e:Wi().pushAll(e)}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.of=function(){return this(arguments)},t.prototype.toString=function(){return this.__toString("Stack [","]")},t.prototype.get=function(e,t){var n=this._head;for(e=Ct(this,e);n&&e--;)n=n.next;return n?n.value:t},t.prototype.peek=function(){return this._head&&this._head.value},t.prototype.push=function(){var e=arguments;if(0===arguments.length)return this;for(var t=this.size+arguments.length,n=this._head,r=arguments.length-1;r>=0;r--)n={value:e[r],next:n};return this.__ownerID?(this.size=t,this._head=n,this.__hash=void 0,this.__altered=!0,this):ji(t,n)},t.prototype.pushAll=function(t){if(0===(t=e(t)).size)return this;if(0===this.size&&Li(t))return t;yr(t.size);var n=this.size,r=this._head;return t.__iterate(function(e){n++,r={value:e,next:r};},!0),this.__ownerID?(this.size=n,this._head=r,this.__hash=void 0,this.__altered=!0,this):ji(n,r)},t.prototype.pop=function(){return this.slice(1)},t.prototype.clear=function(){return 0===this.size?this:this.__ownerID?(this.size=0,this._head=void 0,this.__hash=void 0,this.__altered=!0,this):Wi()},t.prototype.slice=function(t,n){if($t(t,n,this.size))return this;var r=Rt(t,this.size);if(Ot(n,this.size)!==this.size)return e.prototype.slice.call(this,t,n);for(var i=this.size-r,s=this._head;r--;)s=s.next;return this.__ownerID?(this.size=i,this._head=s,this.__hash=void 0,this.__altered=!0,this):ji(i,s)},t.prototype.__ensureOwner=function(e){return e===this.__ownerID?this:e?ji(this.size,this._head,e,this.__hash):0===this.size?Wi():(this.__ownerID=e,this.__altered=!1,this)},t.prototype.__iterate=function(e,t){var n=this;if(t)return new En(this.toArray()).__iterate(function(t,r){return e(t,r,n)},t);for(var r=0,i=this._head;i&&!1!==e(i.value,r++,this);)i=i.next;return r},t.prototype.__iterator=function(e,t){if(t)return new En(this.toArray()).__iterator(e,t);var n=0,r=this._head;return new an(function(){if(r){var t=r.value;return r=r.next,hn(e,n++,t)}return {value:void 0,done:!0}})},t}(qt);Vi.isStack=Li;var Bi,zi=Vi.prototype;function ji(e,t,n,r){var i=Object.create(zi);return i.size=e,i._head=t,i.__ownerID=n,i.__hash=r,i.__altered=!1,i}function Wi(){return Bi||(Bi=ji(0))}zi[Di]=!0,zi.shift=zi.pop,zi.unshift=zi.push,zi.unshiftAll=zi.pushAll,zi.withMutations=Fr,zi.wasAltered=Hr,zi.asImmutable=Gr,zi["@@transducer/init"]=zi.asMutable=qr,zi["@@transducer/step"]=function(e,t){return e.unshift(t)},zi["@@transducer/result"]=function(e){return e.asImmutable()};var Ui="@@__IMMUTABLE_SET__@@";function Fi(e){return Boolean(e&&e[Ui])}function qi(e){return Fi(e)&&Zt(e)}function Gi(e,t){if(e===t)return !0;if(!Lt(t)||void 0!==e.size&&void 0!==t.size&&e.size!==t.size||void 0!==e.__hash&&void 0!==t.__hash&&e.__hash!==t.__hash||Bt(e)!==Bt(t)||jt(e)!==jt(t)||Zt(e)!==Zt(t))return !1;if(0===e.size&&0===t.size)return !0;var n=!Wt(e);if(Zt(e)){var r=e.entries();return t.every(function(e,t){var i=r.next().value;return i&&Rn(i[1],e)&&(n||Rn(i[0],t))})&&r.next().done}var i=!1;if(void 0===e.size)if(void 0===t.size)"function"==typeof e.cacheResult&&e.cacheResult();else{i=!0;var s=e;e=t,t=s;}var o=!0,a=t.__iterate(function(t,r){if(n?!e.has(t):i?!Rn(t,e.get(r,It)):!Rn(e.get(r,It),t))return o=!1,!1});return o&&e.size===a}function Hi(e,t){var n=function(n){e.prototype[n]=t[n];};return Object.keys(t).forEach(n),Object.getOwnPropertySymbols&&Object.getOwnPropertySymbols(t).forEach(n),e}function Ki(e){if(!e||"object"!=typeof e)return e;if(!Lt(e)){if(!Er(e))return e;e=gn(e);}if(Bt(e)){var t={};return e.__iterate(function(e,n){t[n]=Ki(e);}),t}var n=[];return e.__iterate(function(e){n.push(Ki(e));}),n}var Yi=function(e){function t(t){return null==t?es():Fi(t)&&!Zt(t)?t:es().withMutations(function(n){var r=e(t);yr(r.size),r.forEach(function(e){return n.add(e)});})}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.of=function(){return this(arguments)},t.fromKeys=function(e){return this(Ft(e).keySeq())},t.intersect=function(e){return (e=Ut(e).toArray()).length?Qi.intersect.apply(t(e.pop()),e):es()},t.union=function(e){return (e=Ut(e).toArray()).length?Qi.union.apply(t(e.pop()),e):es()},t.prototype.toString=function(){return this.__toString("Set {","}")},t.prototype.has=function(e){return this._map.has(e)},t.prototype.add=function(e){return Ji(this,this._map.set(e,e))},t.prototype.remove=function(e){return Ji(this,this._map.remove(e))},t.prototype.clear=function(){return Ji(this,this._map.clear())},t.prototype.map=function(e,t){var n=this,r=[],i=[];return this.forEach(function(s){var o=e.call(t,s,s,n);o!==s&&(r.push(s),i.push(o));}),this.withMutations(function(e){r.forEach(function(t){return e.remove(t)}),i.forEach(function(t){return e.add(t)});})},t.prototype.union=function(){for(var t=[],n=arguments.length;n--;)t[n]=arguments[n];return 0===(t=t.filter(function(e){return 0!==e.size})).length?this:0!==this.size||this.__ownerID||1!==t.length?this.withMutations(function(n){for(var r=0;r<t.length;r++)e(t[r]).forEach(function(e){return n.add(e)});}):this.constructor(t[0])},t.prototype.intersect=function(){for(var t=[],n=arguments.length;n--;)t[n]=arguments[n];if(0===t.length)return this;t=t.map(function(t){return e(t)});var r=[];return this.forEach(function(e){t.every(function(t){return t.includes(e)})||r.push(e);}),this.withMutations(function(e){r.forEach(function(t){e.remove(t);});})},t.prototype.subtract=function(){for(var t=[],n=arguments.length;n--;)t[n]=arguments[n];if(0===t.length)return this;t=t.map(function(t){return e(t)});var r=[];return this.forEach(function(e){t.some(function(t){return t.includes(e)})&&r.push(e);}),this.withMutations(function(e){r.forEach(function(t){e.remove(t);});})},t.prototype.sort=function(e){return xs(sr(this,e))},t.prototype.sortBy=function(e,t){return xs(sr(this,t,e))},t.prototype.wasAltered=function(){return this._map.wasAltered()},t.prototype.__iterate=function(e,t){var n=this;return this._map.__iterate(function(t){return e(t,t,n)},t)},t.prototype.__iterator=function(e,t){return this._map.__iterator(e,t)},t.prototype.__ensureOwner=function(e){if(e===this.__ownerID)return this;var t=this._map.__ensureOwner(e);return e?this.__make(t,e):0===this.size?this.__empty():(this.__ownerID=e,this._map=t,this)},t}(Gt);Yi.isSet=Fi;var Xi,Qi=Yi.prototype;function Ji(e,t){return e.__ownerID?(e.size=t.size,e._map=t,e):t===e._map?e:0===t.size?e.__empty():e.__make(t)}function Zi(e,t){var n=Object.create(Qi);return n.size=e?e.size:0,n._map=e,n.__ownerID=t,n}function es(){return Xi||(Xi=Zi(oi()))}Qi[Ui]=!0,Qi.delete=Qi.remove,Qi.merge=Qi.concat=Qi.union,Qi.withMutations=Fr,Qi.asImmutable=Gr,Qi["@@transducer/init"]=Qi.asMutable=qr,Qi["@@transducer/step"]=function(e,t){return e.add(t)},Qi["@@transducer/result"]=function(e){return e.asImmutable()},Qi.__empty=es,Qi.__make=Zi;var ts,ns=function(e){function t(e,n,r){if(!(this instanceof t))return new t(e,n,r);if(gr(0!==r,"Cannot step a Range by 0"),e=e||0,void 0===n&&(n=1/0),r=void 0===r?1:Math.abs(r),n<e&&(r=-r),this._start=e,this._end=n,this._step=r,this.size=Math.max(0,Math.ceil((n-e)/r-1)+1),0===this.size){if(ts)return ts;ts=this;}}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.toString=function(){return 0===this.size?"Range []":"Range [ "+this._start+"..."+this._end+(1!==this._step?" by "+this._step:"")+" ]"},t.prototype.get=function(e,t){return this.has(e)?this._start+Ct(this,e)*this._step:t},t.prototype.includes=function(e){var t=(e-this._start)/this._step;return t>=0&&t<this.size&&t===Math.floor(t)},t.prototype.slice=function(e,n){return $t(e,n,this.size)?this:(e=Rt(e,this.size),(n=Ot(n,this.size))<=e?new t(0,0):new t(this.get(e,this._end),this.get(n,this._end),this._step))},t.prototype.indexOf=function(e){var t=e-this._start;if(t%this._step==0){var n=t/this._step;if(n>=0&&n<this.size)return n}return -1},t.prototype.lastIndexOf=function(e){return this.indexOf(e)},t.prototype.__iterate=function(e,t){for(var n=this.size,r=this._step,i=t?this._start+(n-1)*r:this._start,s=0;s!==n&&!1!==e(i,t?n-++s:s++,this);)i+=t?-r:r;return s},t.prototype.__iterator=function(e,t){var n=this.size,r=this._step,i=t?this._start+(n-1)*r:this._start,s=0;return new an(function(){if(s===n)return {value:void 0,done:!0};var o=i;return i+=t?-r:r,hn(e,t?n-++s:s++,o)})},t.prototype.equals=function(e){return e instanceof t?this._start===e._start&&this._end===e._end&&this._step===e._step:Gi(this,e)},t}(xn);function rs(e,t,n){for(var r=xr(t),i=0;i!==r.length;)if((e=Ar(e,r[i++],It))===It)return n;return e}function is(e,t){return rs(this,e,t)}function ss(e,t){return rs(e,t,It)!==It}function os(){yr(this.size);var e={};return this.__iterate(function(t,n){e[n]=t;}),e}Ut.isIterable=Lt,Ut.isKeyed=Bt,Ut.isIndexed=jt,Ut.isAssociative=Wt,Ut.isOrdered=Zt,Ut.Iterator=an,Hi(Ut,{toArray:function(){yr(this.size);var e=new Array(this.size||0),t=Bt(this),n=0;return this.__iterate(function(r,i){e[n++]=t?[i,r]:r;}),e},toIndexedSeq:function(){return new Yn(this)},toJS:function(){return Ki(this)},toKeyedSeq:function(){return new Kn(this,!0)},toMap:function(){return Kr(this.toKeyedSeq())},toObject:os,toOrderedMap:function(){return Ri(this.toKeyedSeq())},toOrderedSet:function(){return xs(Bt(this)?this.valueSeq():this)},toSet:function(){return Yi(Bt(this)?this.valueSeq():this)},toSetSeq:function(){return new Xn(this)},toSeq:function(){return jt(this)?this.toIndexedSeq():Bt(this)?this.toKeyedSeq():this.toSetSeq()},toStack:function(){return Vi(Bt(this)?this.valueSeq():this)},toList:function(){return xi(Bt(this)?this.valueSeq():this)},toString:function(){return "[Collection]"},__toString:function(e,t){return 0===this.size?e+t:e+" "+this.toSeq().map(this.__toStringMapper).join(", ")+" "+t},concat:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return ur(this,function(e,t){var n=Bt(e),r=[e].concat(t).map(function(e){return Lt(e)?n&&(e=Ft(e)):e=n?In(e):wn(Array.isArray(e)?e:[e]),e}).filter(function(e){return 0!==e.size});if(0===r.length)return e;if(1===r.length){var i=r[0];if(i===e||n&&Bt(i)||jt(e)&&jt(i))return i}var s=new En(r);return n?s=s.toKeyedSeq():jt(e)||(s=s.toSetSeq()),(s=s.flatten(!0)).size=r.reduce(function(e,t){if(void 0!==e){var n=t.size;if(void 0!==n)return e+n}},0),s}(this,e))},includes:function(e){return this.some(function(t){return Rn(t,e)})},entries:function(){return this.__iterator(nn)},every:function(e,t){yr(this.size);var n=!0;return this.__iterate(function(r,i,s){if(!e.call(t,r,i,s))return n=!1,!1}),n},filter:function(e,t){return ur(this,tr(this,e,t,!0))},find:function(e,t,n){var r=this.findEntry(e,t);return r?r[1]:n},forEach:function(e,t){return yr(this.size),this.__iterate(t?e.bind(t):e)},join:function(e){yr(this.size),e=void 0!==e?""+e:",";var t="",n=!0;return this.__iterate(function(r){n?n=!1:t+=e,t+=null!=r?r.toString():"";}),t},keys:function(){return this.__iterator(en)},map:function(e,t){return ur(this,Zn(this,e,t))},reduce:function(e,t,n){return cs(this,e,t,n,arguments.length<2,!1)},reduceRight:function(e,t,n){return cs(this,e,t,n,arguments.length<2,!0)},reverse:function(){return ur(this,er(this,!0))},slice:function(e,t){return ur(this,nr(this,e,t,!0))},some:function(e,t){return !this.every(ds(e),t)},sort:function(e){return ur(this,sr(this,e))},values:function(){return this.__iterator(tn)},butLast:function(){return this.slice(0,-1)},isEmpty:function(){return void 0!==this.size?0===this.size:!this.some(function(){return !0})},count:function(e,t){return kt(e?this.toSeq().filter(e,t):this)},countBy:function(e,t){return function(e,t,n){var r=Kr().asMutable();return e.__iterate(function(i,s){r.update(t.call(n,i,s,e),0,function(e){return e+1});}),r.asImmutable()}(this,e,t)},equals:function(e){return Gi(this,e)},entrySeq:function(){var e=this;if(e._cache)return new En(e._cache);var t=e.toSeq().map(ps).toIndexedSeq();return t.fromEntrySeq=function(){return e.toSeq()},t},filterNot:function(e,t){return this.filter(ds(e),t)},findEntry:function(e,t,n){var r=n;return this.__iterate(function(n,i,s){if(e.call(t,n,i,s))return r=[i,n],!1}),r},findKey:function(e,t){var n=this.findEntry(e,t);return n&&n[0]},findLast:function(e,t,n){return this.toKeyedSeq().reverse().find(e,t,n)},findLastEntry:function(e,t,n){return this.toKeyedSeq().reverse().findEntry(e,t,n)},findLastKey:function(e,t){return this.toKeyedSeq().reverse().findKey(e,t)},first:function(e){return this.find(Nt,null,e)},flatMap:function(e,t){return ur(this,function(e,t,n){var r=lr(e);return e.toSeq().map(function(i,s){return r(t.call(n,i,s,e))}).flatten(!0)}(this,e,t))},flatten:function(e){return ur(this,ir(this,e,!0))},fromEntrySeq:function(){return new Qn(this)},get:function(e,t){return this.find(function(t,n){return Rn(n,e)},void 0,t)},getIn:is,groupBy:function(e,t){return function(e,t,n){var r=Bt(e),i=(Zt(e)?Ri():Kr()).asMutable();e.__iterate(function(s,o){i.update(t.call(n,s,o,e),function(e){return (e=e||[]).push(r?[o,s]:s),e});});var s=lr(e);return i.map(function(t){return ur(e,s(t))}).asImmutable()}(this,e,t)},has:function(e){return this.get(e,It)!==It},hasIn:function(e){return ss(this,e)},isSubset:function(e){return e="function"==typeof e.includes?e:Ut(e),this.every(function(t){return e.includes(t)})},isSuperset:function(e){return (e="function"==typeof e.isSubset?e:Ut(e)).isSubset(this)},keyOf:function(e){return this.findKey(function(t){return Rn(t,e)})},keySeq:function(){return this.toSeq().map(ls).toIndexedSeq()},last:function(e){return this.toSeq().reverse().first(e)},lastKeyOf:function(e){return this.toKeyedSeq().reverse().keyOf(e)},max:function(e){return or(this,e)},maxBy:function(e,t){return or(this,t,e)},min:function(e){return or(this,e?fs(e):gs)},minBy:function(e,t){return or(this,t?fs(t):gs,e)},rest:function(){return this.slice(1)},skip:function(e){return 0===e?this:this.slice(Math.max(0,e))},skipLast:function(e){return 0===e?this:this.slice(0,-Math.max(0,e))},skipWhile:function(e,t){return ur(this,rr(this,e,t,!0))},skipUntil:function(e,t){return this.skipWhile(ds(e),t)},sortBy:function(e,t){return ur(this,sr(this,t,e))},take:function(e){return this.slice(0,Math.max(0,e))},takeLast:function(e){return this.slice(-Math.max(0,e))},takeWhile:function(e,t){return ur(this,function(e,t,n){var r=pr(e);return r.__iterateUncached=function(r,i){var s=this;if(i)return this.cacheResult().__iterate(r,i);var o=0;return e.__iterate(function(e,i,a){return t.call(n,e,i,a)&&++o&&r(e,i,s)}),o},r.__iteratorUncached=function(r,i){var s=this;if(i)return this.cacheResult().__iterator(r,i);var o=e.__iterator(nn,i),a=!0;return new an(function(){if(!a)return {value:void 0,done:!0};var e=o.next();if(e.done)return e;var i=e.value,h=i[0],u=i[1];return t.call(n,u,h,s)?r===nn?e:hn(r,h,u,e):(a=!1,{value:void 0,done:!0})})},r}(this,e,t))},takeUntil:function(e,t){return this.takeWhile(ds(e),t)},update:function(e){return e(this)},valueSeq:function(){return this.toIndexedSeq()},hashCode:function(){return this.__hash||(this.__hash=function(e){if(e.size===1/0)return 0;var t=Zt(e),n=Bt(e),r=t?1:0;return function(e,t){return t=On(t,3432918353),t=On(t<<15|t>>>-15,461845907),t=On(t<<13|t>>>-13,5),t=On((t=(t+3864292196|0)^e)^t>>>16,2246822507),t=Mn((t=On(t^t>>>13,3266489909))^t>>>16)}(e.__iterate(n?t?function(e,t){r=31*r+ys(Dn(e),Dn(t))|0;}:function(e,t){r=r+ys(Dn(e),Dn(t))|0;}:t?function(e){r=31*r+Dn(e)|0;}:function(e){r=r+Dn(e)|0;}),r)}(this))}});var as=Ut.prototype;as[Dt]=!0,as[on]=as.values,as.toJSON=as.toArray,as.__toStringMapper=_r,as.inspect=as.toSource=function(){return this.toString()},as.chain=as.flatMap,as.contains=as.includes,Hi(Ft,{flip:function(){return ur(this,Jn(this))},mapEntries:function(e,t){var n=this,r=0;return ur(this,this.toSeq().map(function(i,s){return e.call(t,[s,i],r++,n)}).fromEntrySeq())},mapKeys:function(e,t){var n=this;return ur(this,this.toSeq().flip().map(function(r,i){return e.call(t,r,i,n)}).flip())}});var hs=Ft.prototype;hs[Vt]=!0,hs[on]=as.entries,hs.toJSON=os,hs.__toStringMapper=function(e,t){return _r(t)+": "+_r(e)},Hi(qt,{toKeyedSeq:function(){return new Kn(this,!1)},filter:function(e,t){return ur(this,tr(this,e,t,!1))},findIndex:function(e,t){var n=this.findEntry(e,t);return n?n[0]:-1},indexOf:function(e){var t=this.keyOf(e);return void 0===t?-1:t},lastIndexOf:function(e){var t=this.lastKeyOf(e);return void 0===t?-1:t},reverse:function(){return ur(this,er(this,!1))},slice:function(e,t){return ur(this,nr(this,e,t,!1))},splice:function(e,t){var n=arguments.length;if(t=Math.max(t||0,0),0===n||2===n&&!t)return this;e=Rt(e,e<0?this.count():this.size);var r=this.slice(0,e);return ur(this,1===n?r:r.concat(mr(arguments,2),this.slice(e+t)))},findLastIndex:function(e,t){var n=this.findLastEntry(e,t);return n?n[0]:-1},first:function(e){return this.get(0,e)},flatten:function(e){return ur(this,ir(this,e,!1))},get:function(e,t){return (e=Ct(this,e))<0||this.size===1/0||void 0!==this.size&&e>this.size?t:this.find(function(t,n){return n===e},void 0,t)},has:function(e){return (e=Ct(this,e))>=0&&(void 0!==this.size?this.size===1/0||e<this.size:-1!==this.indexOf(e))},interpose:function(e){return ur(this,function(e,t){var n=pr(e);return n.size=e.size&&2*e.size-1,n.__iterateUncached=function(n,r){var i=this,s=0;return e.__iterate(function(e){return (!s||!1!==n(t,s++,i))&&!1!==n(e,s++,i)},r),s},n.__iteratorUncached=function(n,r){var i,s=e.__iterator(tn,r),o=0;return new an(function(){return (!i||o%2)&&(i=s.next()).done?i:o%2?hn(n,o++,t):hn(n,o++,i.value,i)})},n}(this,e))},interleave:function(){var e=[this].concat(mr(arguments)),t=hr(this.toSeq(),xn.of,e),n=t.flatten(!0);return t.size&&(n.size=t.size*e.length),ur(this,n)},keySeq:function(){return ns(0,this.size)},last:function(e){return this.get(-1,e)},skipWhile:function(e,t){return ur(this,rr(this,e,t,!1))},zip:function(){return ur(this,hr(this,ms,[this].concat(mr(arguments))))},zipAll:function(){return ur(this,hr(this,ms,[this].concat(mr(arguments)),!0))},zipWith:function(e){var t=mr(arguments);return t[0]=this,ur(this,hr(this,e,t))}});var us=qt.prototype;function cs(e,t,n,r,i,s){return yr(e.size),e.__iterate(function(e,s,o){i?(i=!1,n=e):n=t.call(r,n,e,s,o);},s),n}function ls(e,t){return t}function ps(e,t){return [t,e]}function ds(e){return function(){return !e.apply(this,arguments)}}function fs(e){return function(){return -e.apply(this,arguments)}}function ms(){return mr(arguments)}function gs(e,t){return e<t?1:e>t?-1:0}function ys(e,t){return e^t+2654435769+(e<<6)+(e>>2)|0}us[zt]=!0,us[Jt]=!0,Hi(Gt,{get:function(e,t){return this.has(e)?e:t},includes:function(e){return this.has(e)},keySeq:function(){return this.valueSeq()}}),Gt.prototype.has=as.includes,Gt.prototype.contains=Gt.prototype.includes,Hi(yn,Ft.prototype),Hi(xn,qt.prototype),Hi(vn,Gt.prototype);var xs=function(e){function t(e){return null==e?bs():qi(e)?e:bs().withMutations(function(t){var n=Gt(e);yr(n.size),n.forEach(function(e){return t.add(e)});})}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.of=function(){return this(arguments)},t.fromKeys=function(e){return this(Ft(e).keySeq())},t.prototype.toString=function(){return this.__toString("OrderedSet {","}")},t}(Yi);xs.isOrderedSet=qi;var vs,Es=xs.prototype;function _s(e,t){var n=Object.create(Es);return n.size=e?e.size:0,n._map=e,n.__ownerID=t,n}function bs(){return vs||(vs=_s(Mi()))}Es[Jt]=!0,Es.zip=us.zip,Es.zipWith=us.zipWith,Es.__empty=bs,Es.__make=_s;var As=function(e,t){var n,r=function(s){var o=this;if(s instanceof r)return s;if(!(this instanceof r))return new r(s);if(!n){n=!0;var a=Object.keys(e),h=i._indices={};i._name=t,i._keys=a,i._defaultValues=e;for(var u=0;u<a.length;u++){var c=a[u];h[c]=u,i[c]?"object"==typeof console&&console.warn&&console.warn("Cannot define "+Ps(this)+' with property "'+c+'" since that property name is part of the Record API.'):Cs(i,c);}}this.__ownerID=void 0,this._values=xi().withMutations(function(e){e.setSize(o._keys.length),Ft(s).forEach(function(t,n){e.set(o._indices[n],t===o._defaultValues[n]?void 0:t);});});},i=r.prototype=Object.create(Is);return i.constructor=r,t&&(r.displayName=t),r};As.prototype.toString=function(){for(var e,t=Ps(this)+" { ",n=this._keys,r=0,i=n.length;r!==i;r++)t+=(r?", ":"")+(e=n[r])+": "+_r(this.get(e));return t+" }"},As.prototype.equals=function(e){return this===e||e&&this._keys===e._keys&&ks(this).equals(ks(e))},As.prototype.hashCode=function(){return ks(this).hashCode()},As.prototype.has=function(e){return this._indices.hasOwnProperty(e)},As.prototype.get=function(e,t){if(!this.has(e))return t;var n=this._indices[e],r=this._values.get(n);return void 0===r?this._defaultValues[e]:r},As.prototype.set=function(e,t){if(this.has(e)){var n=this._values.set(this._indices[e],t===this._defaultValues[e]?void 0:t);if(n!==this._values&&!this.__ownerID)return ws(this,n)}return this},As.prototype.remove=function(e){return this.set(e)},As.prototype.clear=function(){var e=this._values.clear().setSize(this._keys.length);return this.__ownerID?this:ws(this,e)},As.prototype.wasAltered=function(){return this._values.wasAltered()},As.prototype.toSeq=function(){return ks(this)},As.prototype.toJS=function(){return Ki(this)},As.prototype.entries=function(){return this.__iterator(nn)},As.prototype.__iterator=function(e,t){return ks(this).__iterator(e,t)},As.prototype.__iterate=function(e,t){return ks(this).__iterate(e,t)},As.prototype.__ensureOwner=function(e){if(e===this.__ownerID)return this;var t=this._values.__ensureOwner(e);return e?ws(this,t,e):(this.__ownerID=e,this._values=t,this)},As.isRecord=Xt,As.getDescriptiveName=Ps;var Ss,Is=As.prototype;function ws(e,t,n){var r=Object.create(Object.getPrototypeOf(e));return r._values=t,r.__ownerID=n,r}function Ps(e){return e.constructor.displayName||e.constructor.name||"Record"}function ks(e){return In(e._keys.map(function(t){return [t,e.get(t)]}))}function Cs(e,t){try{Object.defineProperty(e,t,{get:function(){return this.get(t)},set:function(e){gr(this.__ownerID,"Cannot set on an immutable record."),this.set(t,e);}});}catch(e){}}function Ns(e,t){return Bt(t)?t.toMap():t.toList()}Is[Yt]=!0,Is.delete=Is.remove,Is.deleteIn=Is.removeIn=$r,Is.getIn=is,Is.hasIn=as.hasIn,Is.merge=Tr,Is.mergeWith=Dr,Is.mergeIn=Wr,Is.mergeDeep=zr,Is.mergeDeepWith=jr,Is.mergeDeepIn=Ur,Is.setIn=Cr,Is.update=Or,Is.updateIn=Mr,Is.withMutations=Fr,Is.asMutable=qr,Is.asImmutable=Gr,Is[on]=Is.entries,Is.toJSON=Is.toObject=as.toObject,Is.inspect=Is.toSource=function(){return this.toString()};var $s,Rs={version:"4.0.0-rc.11",Collection:Ut,Iterable:Ut,Seq:gn,Map:Kr,OrderedMap:Ri,List:xi,Stack:Vi,Set:Yi,OrderedSet:xs,Record:As,Range:ns,Repeat:function(e){function t(e,n){if(!(this instanceof t))return new t(e,n);if(this._value=e,this.size=void 0===n?1/0:Math.max(0,n),0===this.size){if(Ss)return Ss;Ss=this;}}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.toString=function(){return 0===this.size?"Repeat []":"Repeat [ "+this._value+" "+this.size+" times ]"},t.prototype.get=function(e,t){return this.has(e)?this._value:t},t.prototype.includes=function(e){return Rn(this._value,e)},t.prototype.slice=function(e,n){var r=this.size;return $t(e,n,r)?this:new t(this._value,Ot(n,r)-Rt(e,r))},t.prototype.reverse=function(){return this},t.prototype.indexOf=function(e){return Rn(this._value,e)?0:-1},t.prototype.lastIndexOf=function(e){return Rn(this._value,e)?this.size:-1},t.prototype.__iterate=function(e,t){for(var n=this.size,r=0;r!==n&&!1!==e(this._value,t?n-++r:r++,this););return r},t.prototype.__iterator=function(e,t){var n=this,r=this.size,i=0;return new an(function(){return i===r?{value:void 0,done:!0}:hn(e,t?r-++i:i++,n._value)})},t.prototype.equals=function(e){return e instanceof t?Rn(this._value,e._value):Gi(e)},t}(xn),is:Rn,fromJS:function(e,t){return function e(t,n,r,i,s,o){var a=Array.isArray(r)?xn:vr(r)?yn:null;if(a){if(~t.indexOf(r))throw new TypeError("Cannot convert circular structure to Immutable");t.push(r),s&&""!==i&&s.push(i);var h=n.call(o,i,a(r).map(function(i,o){return e(t,n,i,o,s,r)}),s&&s.slice());return t.pop(),s&&s.pop(),h}return r}([],t||Ns,e,"",t&&t.length>2?[]:void 0,{"":e})},hash:Dn,isImmutable:Qt,isCollection:Lt,isKeyed:Bt,isIndexed:jt,isAssociative:Wt,isOrdered:Zt,isValueObject:$n,isSeq:Kt,isList:yi,isMap:Cn,isOrderedMap:Nn,isStack:Li,isSet:Fi,isOrderedSet:qi,isRecord:Xt,get:Ar,getIn:rs,has:br,hasIn:ss,merge:function(e){for(var t=[],n=arguments.length-1;n-- >0;)t[n]=arguments[n+1];return Br(e,t)},mergeDeep:function(e){for(var t=[],n=arguments.length-1;n-- >0;)t[n]=arguments[n+1];return Vr(e,t)},mergeWith:function(e,t){for(var n=[],r=arguments.length-2;r-- >0;)n[r]=arguments[r+2];return Br(t,n,e)},mergeDeepWith:function(e,t){for(var n=[],r=arguments.length-2;r-- >0;)n[r]=arguments[r+2];return Vr(t,n,e)},remove:Ir,removeIn:Nr,set:wr,setIn:kr,update:Rr,updateIn:Pr};!function(e){e[e.IGNORED_LABELS=0]="IGNORED_LABELS",e[e.ACCESSED_NODES=1]="ACCESSED_NODES",e[e.ARGUMENTS_VARIABLES=2]="ARGUMENTS_VARIABLES",e[e.ASSIGNED_NODES=3]="ASSIGNED_NODES",e[e.IGNORE_BREAK_STATEMENTS=4]="IGNORE_BREAK_STATEMENTS",e[e.IGNORE_RETURN_AWAIT_YIELD=5]="IGNORE_RETURN_AWAIT_YIELD",e[e.NODES_CALLED_AT_PATH_WITH_OPTIONS=6]="NODES_CALLED_AT_PATH_WITH_OPTIONS",e[e.REPLACED_VARIABLE_INITS=7]="REPLACED_VARIABLE_INITS",e[e.RETURN_EXPRESSIONS_ACCESSED_AT_PATH=8]="RETURN_EXPRESSIONS_ACCESSED_AT_PATH",e[e.RETURN_EXPRESSIONS_ASSIGNED_AT_PATH=9]="RETURN_EXPRESSIONS_ASSIGNED_AT_PATH",e[e.RETURN_EXPRESSIONS_CALLED_AT_PATH=10]="RETURN_EXPRESSIONS_CALLED_AT_PATH";}($s||($s={}));const Os={};class Ms{static create(){return new this(Rs.Map())}constructor(e){this.optionValues=e;}addAccessedNodeAtPath(e,t){return this.setIn([$s.ACCESSED_NODES,t,...e,Os],!0)}addAccessedReturnExpressionAtPath(e,t){return this.setIn([$s.RETURN_EXPRESSIONS_ACCESSED_AT_PATH,t,...e,Os],!0)}addAssignedNodeAtPath(e,t){return this.setIn([$s.ASSIGNED_NODES,t,...e,Os],!0)}addAssignedReturnExpressionAtPath(e,t){return this.setIn([$s.RETURN_EXPRESSIONS_ASSIGNED_AT_PATH,t,...e,Os],!0)}addCalledNodeAtPathWithOptions(e,t,n){return this.setIn([$s.NODES_CALLED_AT_PATH_WITH_OPTIONS,t,...e,Os,n],!0)}addCalledReturnExpressionAtPath(e,t){return this.setIn([$s.RETURN_EXPRESSIONS_CALLED_AT_PATH,t,...e,Os],!0)}getArgumentsVariables(){return this.get($s.ARGUMENTS_VARIABLES)||[]}getHasEffectsWhenCalledOptions(){return this.setIgnoreReturnAwaitYield().setIgnoreBreakStatements(!1).setIgnoreNoLabels()}getReplacedVariableInit(e){return this.optionValues.getIn([$s.REPLACED_VARIABLE_INITS,e])}hasNodeBeenAccessedAtPath(e,t){return this.optionValues.getIn([$s.ACCESSED_NODES,t,...e,Os])}hasNodeBeenAssignedAtPath(e,t){return this.optionValues.getIn([$s.ASSIGNED_NODES,t,...e,Os])}hasNodeBeenCalledAtPathWithOptions(e,t,n){const r=this.optionValues.getIn([$s.NODES_CALLED_AT_PATH_WITH_OPTIONS,t,...e,Os]);return r&&r.find((e,t)=>t.equals(n))}hasReturnExpressionBeenAccessedAtPath(e,t){return this.optionValues.getIn([$s.RETURN_EXPRESSIONS_ACCESSED_AT_PATH,t,...e,Os])}hasReturnExpressionBeenAssignedAtPath(e,t){return this.optionValues.getIn([$s.RETURN_EXPRESSIONS_ASSIGNED_AT_PATH,t,...e,Os])}hasReturnExpressionBeenCalledAtPath(e,t){return this.optionValues.getIn([$s.RETURN_EXPRESSIONS_CALLED_AT_PATH,t,...e,Os])}ignoreBreakStatements(){return this.get($s.IGNORE_BREAK_STATEMENTS)}ignoreLabel(e){return this.optionValues.getIn([$s.IGNORED_LABELS,e])}ignoreReturnAwaitYield(){return this.get($s.IGNORE_RETURN_AWAIT_YIELD)}replaceVariableInit(e,t){return this.setIn([$s.REPLACED_VARIABLE_INITS,e],t)}setArgumentsVariables(e){return this.set($s.ARGUMENTS_VARIABLES,e)}setIgnoreBreakStatements(e=!0){return this.set($s.IGNORE_BREAK_STATEMENTS,e)}setIgnoreLabel(e){return this.setIn([$s.IGNORED_LABELS,e],!0)}setIgnoreNoLabels(){return this.remove($s.IGNORED_LABELS)}setIgnoreReturnAwaitYield(e=!0){return this.set($s.IGNORE_RETURN_AWAIT_YIELD,e)}get(e){return this.optionValues.get(e)}remove(e){return new Ms(this.optionValues.remove(e))}set(e,t){return new Ms(this.optionValues.set(e,t))}setIn(e,t){return new Ms(this.optionValues.setIn(e,t))}}const Ts={Literal:[],Program:["body"]};const Ds=Ms.create();class Ls{constructor(e,t,n){this.keys=Ts[e.type]||function(e){return Ts[e.type]=Object.keys(e).filter(t=>"object"==typeof e[t]),Ts[e.type]}(e),this.parent=t,this.context=t.context,this.createScope(n),this.parseNode(e),this.initialise(),this.context.magicString.addSourcemapLocation(this.start),this.context.magicString.addSourcemapLocation(this.end);}bind(){for(const e of this.keys){const t=this[e];if(null!==t&&"annotations"!==e)if(Array.isArray(t))for(const e of t)null!==e&&e.bind();else t.bind();}}createScope(e){this.scope=e;}declare(e,t){}deoptimizePath(e){}getLiteralValueAtPath(e,t,n){return Se}getReturnExpressionWhenCalledAtPath(e,t,n){return Ie}hasEffects(e){for(const t of this.keys){const n=this[t];if(null!==n&&"annotations"!==t)if(Array.isArray(n)){for(const t of n)if(null!==t&&t.hasEffects(e))return !0}else if(n.hasEffects(e))return !0}return !1}hasEffectsWhenAccessedAtPath(e,t){return e.length>0}hasEffectsWhenAssignedAtPath(e,t){return !0}hasEffectsWhenCalledAtPath(e,t,n){return !0}include(e){this.included=!0;for(const t of this.keys){const n=this[t];if(null!==n&&"annotations"!==t)if(Array.isArray(n))for(const t of n)null!==t&&t.include(e);else n.include(e);}}includeWithAllDeclaredVariables(e){this.include(e);}initialise(){this.included=!1;}insertSemicolon(e){";"!==e.original[this.end-1]&&e.appendLeft(this.end,";");}locate(){const e=_t(this.context.code,this.start,{offsetLine:1});return e.file=this.context.fileName,e.toString=(()=>JSON.stringify(e)),e}parseNode(e){for(const t of Object.keys(e)){if(this.hasOwnProperty(t))continue;const n=e[t];if("object"!=typeof n||null===n||"annotations"===t)this[t]=n;else if(Array.isArray(n)){this[t]=[];for(const e of n)this[t].push(null===e?null:new(this.context.nodeConstructors[e.type]||this.context.nodeConstructors.UnknownNode)(e,this,this.scope));}else this[t]=new(this.context.nodeConstructors[n.type]||this.context.nodeConstructors.UnknownNode)(n,this,this.scope);}}render(e,t){for(const n of this.keys){const r=this[n];if(null!==r&&"annotations"!==n)if(Array.isArray(r))for(const n of r)null!==n&&n.render(e,t);else r.render(e,t);}}shouldBeIncluded(){return this.included||this.hasEffects(Ds)}toString(){return this.context.code.slice(this.start,this.end)}}class Vs extends Ls{createScope(e){this.scope=new Et(e);}hasEffectsWhenAccessedAtPath(e,t){return e.length>1}hasEffectsWhenAssignedAtPath(e,t){return e.length>1}hasEffectsWhenCalledAtPath(e,t,n){return this.body.hasEffectsWhenCalledAtPath(e,t,n)||null!==this.superClass&&this.superClass.hasEffectsWhenCalledAtPath(e,t,n)}initialise(){this.included=!1,null!==this.id&&this.id.declare("class",this);}}class Bs extends Vs{initialise(){super.initialise(),null!==this.id&&(this.id.variable.isId=!0);}parseNode(e){null!==e.id&&(this.id=new this.context.nodeConstructors.Identifier(e.id,this,this.scope.parent)),super.parseNode(e);}render(e,t){"system"===t.format&&this.id&&this.id.variable.exportName&&e.appendLeft(this.end,` exports('${this.id.variable.exportName}', ${this.id.variable.getName()});`),super.render(e,t);}}const zs=(e,t)=>{const n=parseInt(e[0],10);return n<t.getArgumentsVariables().length&&t.getArgumentsVariables()[n]||Ie};class js extends xt{constructor(e,t){super("arguments",null,Ie,t),this.parameters=e;}deoptimizePath(e){const t=parseInt(e[0],10);e.length>0&&t>=0&&this.parameters[t]&&this.parameters[t].deoptimizePath(e.slice(1));}hasEffectsWhenAccessedAtPath(e,t){return e.length>1&&zs(e,t).hasEffectsWhenAccessedAtPath(e.slice(1),t)}hasEffectsWhenAssignedAtPath(e,t){return 0===e.length||this.included||zs(e,t).hasEffectsWhenAssignedAtPath(e.slice(1),t)}hasEffectsWhenCalledAtPath(e,t,n){return 0===e.length||zs(e,n).hasEffectsWhenCalledAtPath(e.slice(1),t,n)}}class Ws extends xt{constructor(e){super("this",null,null,e);}_getInit(e){return e.getReplacedVariableInit(this)||Ie}getLiteralValueAtPath(){return Se}hasEffectsWhenAccessedAtPath(e,t){return this._getInit(t).hasEffectsWhenAccessedAtPath(e,t)||super.hasEffectsWhenAccessedAtPath(e,t)}hasEffectsWhenAssignedAtPath(e,t){return this._getInit(t).hasEffectsWhenAssignedAtPath(e,t)||super.hasEffectsWhenAssignedAtPath(e,t)}hasEffectsWhenCalledAtPath(e,t,n){return this._getInit(n).hasEffectsWhenCalledAtPath(e,t,n)||super.hasEffectsWhenCalledAtPath(e,t,n)}}class Us extends Et{constructor(e,t){super(e),this.parameters=[],this.context=t,this.hoistedBodyVarScope=new Et(this);}addParameterDeclaration(e){const t=e.name;let n;return t in this.hoistedBodyVarScope.variables?(n=this.hoistedBodyVarScope.variables[t]).addDeclaration(e,null):n=new xt(t,e,Ie,this.context),this.variables[t]=n,this.parameters.push(n),n}getParameterVariables(){return this.parameters}}class Fs extends Us{constructor(){super(...arguments),this.returnExpression=null,this.returnExpressions=[];}addReturnExpression(e){this.returnExpressions.push(e);}getReturnExpression(){return null===this.returnExpression&&this.updateReturnExpression(),this.returnExpression}updateReturnExpression(){if(1===this.returnExpressions.length)this.returnExpression=this.returnExpressions[0];else{this.returnExpression=Ie;for(const e of this.returnExpressions)e.deoptimizePath(be);}}}class qs extends Fs{constructor(e,t){super(e,t),this.variables.arguments=new js(super.getParameterVariables(),t),this.variables.this=new Ws(t);}findLexicalBoundary(){return this}getOptionsWhenCalledWith({args:e,withNew:t},n){return n.replaceVariableInit(this.variables.this,t?new Ue:Ie).setArgumentsVariables(e.map((e,t)=>super.getParameterVariables()[t]||e))}}class Gs extends Ls{createScope(e){this.scope=new qs(e,this.context);}deoptimizePath(e){1===e.length&&("prototype"===e[0]?this.isPrototypeDeoptimized=!0:e[0]===Ee&&(this.isPrototypeDeoptimized=!0,this.scope.getReturnExpression().deoptimizePath(be)));}getReturnExpressionWhenCalledAtPath(e){return 0===e.length?this.scope.getReturnExpression():Ie}hasEffects(e){return null!==this.id&&this.id.hasEffects(e)}hasEffectsWhenAccessedAtPath(e){return !(e.length<=1)&&(e.length>2||"prototype"!==e[0]||this.isPrototypeDeoptimized)}hasEffectsWhenAssignedAtPath(e){return !(e.length<=1)&&(e.length>2||"prototype"!==e[0]||this.isPrototypeDeoptimized)}hasEffectsWhenCalledAtPath(e,t,n){if(e.length>0)return !0;const r=this.scope.getOptionsWhenCalledWith(t,n);for(const e of this.params)if(e.hasEffects(r))return !0;return this.body.hasEffects(r)}include(e){this.scope.variables.arguments.include(),super.include(e);}initialise(){this.included=!1,this.isPrototypeDeoptimized=!1,null!==this.id&&this.id.declare("function",this);for(const e of this.params)e.declare("parameter",Ie);this.body.addImplicitReturnExpressionToScope();}parseNode(e){this.body=new this.context.nodeConstructors.BlockStatement(e.body,this,this.scope.hoistedBodyVarScope),super.parseNode(e);}}Gs.prototype.preventChildBlockScope=!0;class Hs extends Gs{initialise(){super.initialise(),null!==this.id&&(this.id.variable.isId=!0);}parseNode(e){null!==e.id&&(this.id=new this.context.nodeConstructors.Identifier(e.id,this,this.scope.parent)),super.parseNode(e);}}const Ks=/\s/;class Ys extends Ls{include(e){super.include(e),e&&this.context.includeVariable(this.variable);}initialise(){this.included=!1;const e=this.declaration;this.declarationName=e.id&&e.id.name||this.declaration.name,this.variable=this.scope.addExportDefaultDeclaration(this.declarationName||this.context.getModuleName(),this,this.context),this.context.addExport(this);}render(e,t,{start:n,end:r}=Y){const i=function(e,t=0){for(t=le(e,"default",t)+7;Ks.test(e[t]);)t++;return t}(e.original,this.start);if(this.declaration instanceof Hs)this.renderNamedDeclaration(e,i,"function",null===this.declaration.id,t);else if(this.declaration instanceof Bs)this.renderNamedDeclaration(e,i,"class",null===this.declaration.id,t);else{if(this.variable.getOriginalVariable()!==this.variable)return void("system"===t.format&&this.variable.exportName?e.overwrite(n,r,`exports('${this.variable.exportName}', ${this.variable.getName()});`):he(this,e,n,r));if(!this.variable.included)return e.remove(this.start,i),this.declaration.render(e,t,{isCalleeOfRenderedParent:!1,renderedParentType:Z}),void(";"!==e.original[this.end-1]&&e.appendLeft(this.end,";"));this.renderVariableDeclaration(e,i,t);}this.declaration.render(e,t);}renderNamedDeclaration(e,t,n,r,i){const s=this.variable.getName();e.remove(this.start,t),r&&e.appendLeft(function(e,t,n=0){const r=le(e,t,n)+t.length;e=e.slice(r,le(e,"{",r));const i=le(e,"*");return -1===i?r:r+i+1}(e.original,n,t),` ${s}`),"system"===i.format&&this.declaration instanceof Bs&&this.variable.exportName&&e.appendLeft(this.end,` exports('${this.variable.exportName}', ${s});`);}renderVariableDeclaration(e,t,n){const r="system"===n.format&&this.variable.exportName?`exports('${this.variable.exportName}', `:"";e.overwrite(this.start,t,`${n.varOrConst} ${this.variable.getName()} = ${r}`);const i=59===e.original.charCodeAt(this.end-1);r?e.appendRight(i?this.end-1:this.end,")"+(i?"":";")):i||e.appendLeft(this.end,";");}}Ys.prototype.needsBoundaries=!0;class Xs extends Ls{addExportedVariables(e){null!==this.variable&&this.variable.exportName&&e.push(this.variable);}bind(){this.bound||(this.bound=!0,null===this.variable&&function e(t,n){if("MemberExpression"===t.type)return !t.computed&&e(t.object,t);if("Identifier"===t.type)switch(n.type){case"MemberExpression":return n.computed||t===n.object;case"MethodDefinition":return n.computed;case"Property":return n.computed||t===n.value;case"ExportSpecifier":return t===n.local;case"LabeledStatement":case"BreakStatement":case"ContinueStatement":return !1;default:return !0}return !1}(this,this.parent)&&(this.variable=this.scope.findVariable(this.name),this.variable.addReference(this)),null!==this.variable&&this.variable.isLocal&&null!==this.variable.additionalInitializers&&this.variable.consolidateInitializers());}declare(e,t){switch(e){case"var":case"function":this.variable=this.scope.addDeclaration(this,this.context,t,!0);break;case"let":case"const":case"class":this.variable=this.scope.addDeclaration(this,this.context,t,!1);break;case"parameter":this.variable=this.scope.addParameterDeclaration(this);break;default:throw new Error(`Unexpected identifier kind ${e}.`)}}deoptimizePath(e){this.bound||this.bind(),null!==this.variable&&(0===e.length&&this.name in this.context.importDescriptions&&!this.scope.contains(this.name)&&this.disallowImportReassignment(),this.variable.deoptimizePath(e));}getLiteralValueAtPath(e,t,n){return this.bound||this.bind(),null!==this.variable?this.variable.getLiteralValueAtPath(e,t,n):Se}getReturnExpressionWhenCalledAtPath(e,t,n){return this.bound||this.bind(),null!==this.variable?this.variable.getReturnExpressionWhenCalledAtPath(e,t,n):Ie}hasEffectsWhenAccessedAtPath(e,t){return null!==this.variable&&this.variable.hasEffectsWhenAccessedAtPath(e,t)}hasEffectsWhenAssignedAtPath(e,t){return !this.variable||this.variable.hasEffectsWhenAssignedAtPath(e,t)}hasEffectsWhenCalledAtPath(e,t,n){return !this.variable||this.variable.hasEffectsWhenCalledAtPath(e,t,n)}include(e){this.included||(this.included=!0,null!==this.variable&&this.context.includeVariable(this.variable));}initialise(){this.included=!1,this.bound=!1,this.variable||(this.variable=null);}render(e,t,{renderedParentType:n,isCalleeOfRenderedParent:r,isShorthandProperty:i}=Y){if(this.variable){const t=this.variable.getName();t!==this.name&&(e.overwrite(this.start,this.end,t,{contentOnly:!0,storeName:!0}),i&&e.prependRight(this.start,`${this.name}: `)),"eval"===t&&n===Q&&r&&e.appendRight(this.start,"0, ");}}disallowImportReassignment(){this.context.error({code:"ILLEGAL_REASSIGNMENT",message:`Illegal reassignment to import '${this.name}'`},this.start);}}class Qs extends xt{constructor(e,t,n){super(e,t,t.declaration,n),this.originalId=null,this.originalVariable=null;const r=t.declaration;(r instanceof Hs||r instanceof Bs)&&r.id?(this.hasId=!0,this.originalId=r.id):r instanceof Xs&&(this.originalId=r);}addReference(e){this.hasId||(this.name=e.name);}getAssignedVariableName(){return this.originalId&&this.originalId.name||null}getName(){const e=this.getOriginalVariable();return e===this?super.getName():e.getName()}getOriginalVariable(){if(null===this.originalVariable)if(!this.originalId||!this.hasId&&this.originalId.variable.isReassigned)this.originalVariable=this;else{const e=this.originalId.variable;this.originalVariable=e instanceof Qs?e.getOriginalVariable():e;}return this.originalVariable}setRenderNames(e,t){const n=this.getOriginalVariable();n===this?super.setRenderNames(e,t):n.setRenderNames(e,t);}setSafeName(e){const t=this.getOriginalVariable();t===this?super.setSafeName(e):t.setSafeName(e);}}Qs.prototype.getBaseVariableName=Qs.prototype.getName,Qs.prototype.isDefault=!0;const Js="_missingExportShim",Zs="_interopDefault";class eo extends Qe{constructor(e){super(Js),this.module=e;}}const to={},no="Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "),ro="Int8x16 Int16x8 Int32x4 Float32x4 Float64x2".split(" "),io="abs add and bool check div equal extractLane fromFloat32x4 fromFloat32x4Bits fromFloat64x2 fromFloat64x2Bits fromInt16x8Bits fromInt32x4 fromInt32x4Bits fromInt8x16Bits greaterThan greaterThanOrEqual lessThan lessThanOrEqual load max maxNum min minNum mul neg not notEqual or reciprocalApproximation reciprocalSqrtApproximation replaceLane select selectBits shiftLeftByScalar shiftRightArithmeticByScalar shiftRightLogicalByScalar shuffle splat sqrt store sub swizzle xor".split(" "),so=[];ro.forEach(e=>{io.forEach(t=>{so.push(`SIMD.${e}.${t}`);});}),["Array.isArray","Error","EvalError","InternalError","RangeError","ReferenceError","SyntaxError","TypeError","URIError","isFinite","isNaN","parseFloat","parseInt","decodeURI","decodeURIComponent","encodeURI","encodeURIComponent","escape","unescape","Object","Object.create","Object.getNotifier","Object.getOwn","Object.getOwnPropertyDescriptor","Object.getOwnPropertyNames","Object.getOwnPropertySymbols","Object.getPrototypeOf","Object.is","Object.isExtensible","Object.isFrozen","Object.isSealed","Object.keys","Boolean","Number","Number.isFinite","Number.isInteger","Number.isNaN","Number.isSafeInteger","Number.parseFloat","Number.parseInt","Symbol","Symbol.for","Symbol.keyFor","Math.abs","Math.acos","Math.acosh","Math.asin","Math.asinh","Math.atan","Math.atan2","Math.atanh","Math.cbrt","Math.ceil","Math.clz32","Math.cos","Math.cosh","Math.exp","Math.expm1","Math.floor","Math.fround","Math.hypot","Math.imul","Math.log","Math.log10","Math.log1p","Math.log2","Math.max","Math.min","Math.pow","Math.random","Math.round","Math.sign","Math.sin","Math.sinh","Math.sqrt","Math.tan","Math.tanh","Math.trunc","Date","Date.UTC","Date.now","Date.parse","String","String.fromCharCode","String.fromCodePoint","String.raw","RegExp","Map","Set","WeakMap","WeakSet","ArrayBuffer","ArrayBuffer.isView","DataView","Promise.all","Promise.race","Promise.resolve","Intl.Collator","Intl.Collator.supportedLocalesOf","Intl.DateTimeFormat","Intl.DateTimeFormat.supportedLocalesOf","Intl.NumberFormat","Intl.NumberFormat.supportedLocalesOf"].concat(no,no.map(e=>`${e}.from`),no.map(e=>`${e}.of`),ro.map(e=>`SIMD.${e}`),so).forEach(e=>to[e]=!0);class oo extends Qe{hasEffectsWhenAccessedAtPath(e){return e.length>0&&!this.isPureFunctionMember(e)&&!("Reflect"===this.name&&1===e.length)}hasEffectsWhenCalledAtPath(e){return !to[[this.name,...e].join(".")]}isPureFunctionMember(e){return to[[this.name,...e].join(".")]||e.length>=1&&to[[this.name,...e.slice(0,-1)].join(".")]||e.length>=2&&to[[this.name,...e.slice(0,-2)].join(".")]&&"prototype"===e[e.length-2]}}const ao=Object.assign(Object.create(null),{await:!0,break:!0,case:!0,catch:!0,class:!0,const:!0,continue:!0,debugger:!0,default:!0,delete:!0,do:!0,else:!0,enum:!0,eval:!0,export:!0,extends:!0,false:!0,finally:!0,for:!0,function:!0,if:!0,implements:!0,import:!0,in:!0,instanceof:!0,interface:!0,let:!0,new:!0,null:!0,package:!0,private:!0,protected:!0,public:!0,return:!0,static:!0,super:!0,switch:!0,this:!0,throw:!0,true:!0,try:!0,typeof:!0,undefined:!0,var:!0,void:!0,while:!0,with:!0,yield:!0}),ho={},uo={exports:!0},co={amd:{formatGlobals:uo,forbiddenNames:ao},cjs:{forbiddenNames:ao,formatGlobals:{exports:!0,module:!0,[Zs]:!0}},es:{formatGlobals:ho,forbiddenNames:ao},iife:{formatGlobals:uo,forbiddenNames:ao},system:{forbiddenNames:Object.assign(Object.create(null),ao,uo),formatGlobals:ho},umd:{formatGlobals:uo,forbiddenNames:ao}};class lo extends Qe{constructor(e){super(e.getModuleName()),this.memberVariables=Object.create(null),this.containsExternalNamespace=!1,this.referencedEarly=!1,this.references=[],this.context=e,this.module=e.module;for(const e of this.context.getExports().concat(this.context.getReexports()))"*"===e[0]&&e.length>1&&(this.containsExternalNamespace=!0),this.memberVariables[e]=this.context.traceExport(e);}addReference(e){this.references.push(e),this.name=e.name;}deoptimizePath(){for(const e in this.memberVariables)this.memberVariables[e].deoptimizePath(be);}include(){if(!this.included){this.containsExternalNamespace&&this.context.error({code:"NAMESPACE_CANNOT_CONTAIN_EXTERNAL",id:this.module.id,message:`Cannot create an explicit namespace object for module "${this.context.getModuleName()}" because it contains a reexported external namespace`},void 0),this.included=!0;for(const e of this.references)if(e.context.getModuleExecIndex()<=this.context.getModuleExecIndex()){this.referencedEarly=!0;break}if(this.context.preserveModules)for(const e of Object.keys(this.memberVariables))this.memberVariables[e].include();else for(const e of Object.keys(this.memberVariables))this.context.includeVariable(this.memberVariables[e]);}}renderBlock(e){const t=e.compact?"":" ",n=e.compact?"":"\n",r=e.indent,i=Object.keys(this.memberVariables).map(n=>{const i=this.memberVariables[n];if(this.referencedEarly||i.isReassigned)return `${r}get ${n}${t}()${t}{${t}return ${i.getName()}${e.compact?"":";"}${t}}`;const s=ao[n]?`'${n}'`:n;return `${r}${s}: ${i.getName()}`}),s=this.getName(),o=e.freeze?"/*#__PURE__*/Object.freeze":"";let a=`${e.varOrConst} ${s} = ${e.namespaceToStringTag?`{${n}${i.join(`,${n}`)}${n}};`:`${o}({${n}${i.join(`,${n}`)}${n}});`}`;return e.namespaceToStringTag&&(a+=`${n}if${t}(typeof Symbol${t}!==${t}'undefined'${t}&&${t}Symbol.toStringTag)${n}`,a+=`${r}Object.defineProperty(${s},${t}Symbol.toStringTag,${t}{${t}value:${t}'Module'${t}});${n}`,a+=`else${n||" "}`,a+=`${r}Object.defineProperty(${s},${t}'toString',${t}{${t}value:${t}function${t}()${t}{${t}return${t}'[object Module]'${e.compact?";":""}${t}}${t}});${n}`,a+=`${o}(${s});`),"system"===e.format&&this.exportName&&(a+=`${n}exports('${this.exportName}',${t}${s});`),a}renderFirst(){return this.referencedEarly}}lo.prototype.isNamespace=!0;const po="Object.defineProperty(exports, '__esModule', { value: true });",fo="Object.defineProperty(exports,'__esModule',{value:true});";function mo(e,t,n,r,i,s,o="return "){const a=i?"":" ",h=i?"":"\n";if(!n){let n;return e.some(e=>"default"===e.exported&&(n=e.local,!0)),n||t.some(e=>!!e.reexports&&e.reexports.some(t=>"default"===t.reexported&&(n=e.namedExportsMode?`${e.name}.${t.imported}`:e.name,!0))),`${o}${n};`}let u="";return t.forEach(({name:e,reexports:t})=>{t&&n&&t.forEach(t=>{"*"===t.reexported&&(!i&&u&&(u+="\n"),u+=`Object.keys(${e}).forEach(function${a}(key)${a}{${h}`+`${s}Object.defineProperty(exports,${a}key,${a}{${h}`+`${s}${s}enumerable:${a}true,${h}`+`${s}${s}get:${a}function${a}()${a}{${h}`+`${s}${s}${s}return ${e}[key];${h}`+`${s}${s}}${h}${s}});${h}});`);});}),t.forEach(({name:e,imports:t,reexports:o,isChunk:c,namedExportsMode:l})=>{o&&n&&o.forEach(n=>{if("default"!==n.imported||c)if("*"!==n.imported){u&&!i&&(u+="\n");const t="default"!==n.imported||l?`${e}.${n.imported}`:e;u+=n.needsLiveBinding?`Object.defineProperty(exports,${a}'${n.reexported}',${a}{${h}`+`${s}enumerable:${a}true,${h}`+`${s}get:${a}function${a}()${a}{${h}`+`${s}${s}return ${t};${h}${s}}${h}});`:`exports.${n.reexported}${a}=${a}${t};`;}else"*"!==n.reexported&&(u&&!i&&(u+="\n"),u+=`exports.${n.reexported}${a}=${a}${e};`);else{const s=t&&t.some(e=>"default"!==e.imported)||o&&o.some(e=>"default"!==e.imported&&"*"!==e.imported),h=o&&o.some(e=>"default"===e.imported&&"default"===e.reexported);u&&!i&&(u+="\n"),u+=s||h?`exports.${n.reexported}${a}=${a}${e}${!1!==r?"__default":".default"};`:`exports.${n.reexported}${a}=${a}${e};`;}});}),e.forEach(e=>{const t=`exports.${e.exported}`,n=e.local;t!==n&&(u&&!i&&(u+="\n"),u+=`${t}${a}=${a}${n};`);}),u}function go(e,t,n){return e.map(({name:e,exportsNames:r,exportsDefault:i,namedExportsMode:s})=>{if(s)return i&&!1!==t.interop?r?t.compact?`${n} ${e}__default='default'in ${e}?${e}['default']:${e};`:`${n} ${e}__default = 'default' in ${e} ? ${e}['default'] : ${e};`:t.compact?`${e}=${e}&&${e}.hasOwnProperty('default')?${e}['default']:${e};`:`${e} = ${e} && ${e}.hasOwnProperty('default') ? ${e}['default'] : ${e};`:null}).filter(Boolean).join(t.compact?"":"\n")}const yo={assert:!0,buffer:!0,console:!0,constants:!0,domain:!0,events:!0,http:!0,https:!0,os:!0,path:!0,process:!0,punycode:!0,querystring:!0,stream:!0,string_decoder:!0,timers:!0,tty:!0,url:!0,util:!0,vm:!0,zlib:!0};function xo(e,t){const n=t.map(({id:e})=>e).filter(e=>e in yo);n.length&&e({code:"MISSING_NODE_BUILTINS",message:`Creating a browser bundle that depends on Node.js built-in ${1===n.length?`module ('${n[0]}')`:`modules (${n.slice(0,-1).map(e=>`'${e}'`).join(", ")} and '${n.slice(-1)}')`}. You might need to include https://www.npmjs.com/package/rollup-plugin-node-builtins`,modules:n});}function vo(e){return e.replace(/^\t+/,e=>e.split("\t").join("  "))}function Eo(e,t,n){let r=e.split("\n");const i=Math.max(0,t-3);let s=Math.min(t+2,r.length);for(r=r.slice(i,s);!/\S/.test(r[r.length-1]);)r.pop(),s-=1;const o=String(s).length;return r.map((e,r)=>{const s=i+r+1===t;let a=String(r+i+1);for(;a.length<o;)a=` ${a}`;if(s){const t=function(e){let t="";for(;e--;)t+=" ";return t}(o+2+vo(e.slice(0,n)).length)+"^";return `${a}: ${vo(e)}\n${t}`}return `${a}: ${vo(e)}`}).join("\n")}function _o(e){const t=ct(e);return t.substr(0,t.length-pt(e).length)}function bo(e){return "undefined"!=typeof process&&at(e)?dt(process.cwd(),e):e}function Ao(e){return !("/"===e[0]||"."===e[1]&&("/"===e[2]||"."===e[2]&&"/"===e[3]))}function So(e,t){throw e instanceof Error==!1&&(e=Object.assign(new Error(e.message),e)),t&&Object.assign(e,t),e}function Io(e,t,n,r){if(void 0!==t.line&&void 0!==t.column){const{line:n,column:i}=t;e.loc={file:r,line:n,column:i};}else{e.pos=t;const{line:i,column:s}=_t(n,t,{offsetLine:1});e.loc={file:r,line:i,column:s};}if(void 0===e.frame){const{line:t,column:r}=e.loc;e.frame=Eo(n,t,r);}}var wo;function Po(e,t,n){return {code:wo.INVALID_CHUNK,message:`Cannot assign ${bo(e)} to the "${t}" chunk as it is already in the "${n}" chunk.`}}function ko(e,t,n){return {code:wo.NAMESPACE_CONFLICT,message:`Conflicting namespaces: ${bo(t.id)} re-exports '${e}' from both ${bo(t.exportsAll[e])} and ${bo(n.exportsAll[e])} (will be ignored)`,name:e,reexporter:t.id,sources:[t.exportsAll[e],n.exportsAll[e]]}}!function(e){e.ASSET_NOT_FINALISED="ASSET_NOT_FINALISED",e.ASSET_NOT_FOUND="ASSET_NOT_FOUND",e.ASSET_SOURCE_ALREADY_SET="ASSET_SOURCE_ALREADY_SET",e.ASSET_SOURCE_MISSING="ASSET_SOURCE_MISSING",e.BAD_LOADER="BAD_LOADER",e.CHUNK_NOT_FOUND="CHUNK_NOT_FOUND",e.CHUNK_NOT_GENERATED="CHUNK_NOT_GENERATED",e.INVALID_ASSET_NAME="INVALID_ASSET_NAME",e.INVALID_CHUNK="INVALID_CHUNK",e.INVALID_EXTERNAL_ID="INVALID_EXTERNAL_ID",e.INVALID_OPTION="INVALID_OPTION",e.INVALID_PLUGIN_HOOK="INVALID_PLUGIN_HOOK",e.INVALID_ROLLUP_PHASE="INVALID_ROLLUP_PHASE",e.NAMESPACE_CONFLICT="NAMESPACE_CONFLICT",e.UNRESOLVED_ENTRY="UNRESOLVED_ENTRY",e.UNRESOLVED_IMPORT="UNRESOLVED_IMPORT";}(wo||(wo={}));const Co=/^[a-zA-Z$_][a-zA-Z0-9$_]*$/;function No(e){return Co.test(e)?`.${e}`:`['${e}']`}function $o(e){return e.split(".").map(No).join("")}function Ro(e,t,n,r,i){const s=r?"":" ",o=e.split(".");n&&(o[0]=("function"==typeof n?n(o[0]):n[o[0]])||o[0]);const a=o.pop();let h=t,u=o.map(e=>(h+=No(e),`${h}${s}=${s}${h}${s}||${s}{}`)).concat(`${h}${No(a)}`).join(`,${s}`).concat(`${s}=${s}${i}`);return o.length>0&&(u=`(${u})`),u}function Oo(e){let t=e.length;for(;t--;){const n=e[t];if(n.exportsDefault||n.exportsNames)return e.slice(0,t+1)}return []}const Mo=e=>`this${$o(e)}`;const To=(e,t,n,r,i)=>e?`${i}${r}${t} _starExcludes${n}=${n}{${n}${Array.from(e).join(`:${n}1,${n}`)}${e.size?`:${n}1`:""}${n}};`:"",Do=(e,t,n,r)=>e.length?`${r}${n}var ${e.join(`,${t}`)};`:"";function Lo(e,t,n,r){return 0===e.length?"":1===e.length?`${n}${n}${n}exports('${e[0].name}',${t}${e[0].value});${r}${r}`:`${n}${n}${n}exports({${r}`+e.map(({name:e,value:r})=>`${n}${n}${n}${n}${e}:${t}${r}`).join(`,${r}`)+`${r}${n}${n}${n}});${r}${r}`}const Vo=(e,t,n,r)=>Lo(e.filter(e=>e.hoisted||e.uninitialized).map(e=>({name:e.exported,value:e.uninitialized?"void 0":e.local})),t,n,r),Bo=(e,t,n,r)=>Lo(e.filter(e=>e.local===Js).map(e=>({name:e.exported,value:Js})),t,n,r);function zo(e,t){return e?`${t}${$o(e)}`:"null"}var jo={system:function(e,{dependencies:t,exports:n,indentString:r,intro:i,outro:s,usesTopLevelAwait:o,varOrConst:a},h){const u=h.compact?"":"\n",c=h.compact?"":" ",l=t.map(e=>`'${e.id}'`),p=[];let d;const f=[];t.forEach(({imports:e,reexports:i})=>{const s=[];if(e&&e.forEach(e=>{p.push(e.local),"*"===e.imported?s.push(`${e.local}${c}=${c}module;`):s.push(`${e.local}${c}=${c}module.${e.imported};`);}),i){let e=!1;i.length>1||1===i.length&&("*"===i[0].reexported||"*"===i[0].imported)?(i.forEach(i=>{"*"===i.reexported&&(d||(d=function({dependencies:e,exports:t}){const n=new Set(t.map(e=>e.exported));return n.has("default")||n.add("default"),e.forEach(({reexports:e})=>{e&&e.forEach(e=>{"*"===e.imported||n.has(e.reexported)||n.add(e.reexported);});}),n}({dependencies:t,exports:n})),e||(s.push(`${a} _setter${c}=${c}{};`),e=!0),s.push(`for${c}(var _$p${c}in${c}module)${c}{`),s.push(`${r}if${c}(!_starExcludes[_$p])${c}_setter[_$p]${c}=${c}module[_$p];`),s.push("}"));}),i.forEach(e=>{"*"===e.imported&&"*"!==e.reexported&&s.push(`exports('${e.reexported}',${c}module);`);}),i.forEach(t=>{"*"!==t.reexported&&"*"!==t.imported&&(e||(s.push(`${a} _setter${c}=${c}{};`),e=!0),s.push(`_setter.${t.reexported}${c}=${c}module.${t.imported};`));}),e&&s.push("exports(_setter);")):i.forEach(e=>{s.push(`exports('${e.reexported}',${c}module.${e.imported});`);});}f.push(s.join(`${u}${r}${r}${r}`));});let m=`System.register(${h.name?`'${h.name}',${c}`:""}[`+l.join(`,${c}`)+`],${c}function${c}(exports,${c}module)${c}{${u}${r}'use strict';`+To(d,a,c,r,u)+Do(p,c,r,u)+`${u}${r}return${c}{${f.length?`${u}${r}${r}setters:${c}[${f.map(e=>e?`function${c}(module)${c}{${u}${r}${r}${r}${e}${u}${r}${r}}`:`function${c}()${c}{}`).join(`,${c}`)}],`:""}${u}`;m+=`${r}${r}execute:${c}${o?`async${c}`:""}function${c}()${c}{${u}${u}`+Vo(n,c,r,u);const g=`${u}${u}`+Bo(n,c,r,u)+`${r}${r}}${u}${r}}${h.compact?"":";"}${u}});`;return i&&e.prepend(i),s&&e.append(s),e.indent(`${r}${r}${r}`).append(g).prepend(m)},amd:function(e,{dependencies:t,dynamicImport:n,exports:r,hasExports:i,indentString:s,intro:o,isEntryModuleFacade:a,namedExportsMode:h,needsAmdModule:u,outro:c,varOrConst:l,warn:p},d){xo(p,t);const f=t.map(e=>`'${function(e){return "."===e[0]&&e.endsWith(".js")?e.slice(0,-3):e}(e.id)}'`),m=t.map(e=>e.name),g=d.compact?"":"\n",y=d.compact?"":" ";h&&i&&(m.unshift("exports"),f.unshift("'exports'")),n&&(m.unshift("require"),f.unshift("'require'")),u&&(m.unshift("module"),f.unshift("'module'"));const x=d.amd||{},v=(x.id?`'${x.id}',${y}`:"")+(f.length?`[${f.join(`,${y}`)}],${y}`:""),E=!1!==d.strict?`${y}'use strict';`:"",_=`${x.define||"define"}(${v}function${y}(${m.join(`,${y}`)})${y}{${E}${g}${g}`,b=go(t,d,l);b&&e.prepend(b+g+g),o&&e.prepend(o);const A=mo(r,t,h,d.interop,d.compact,s);return A&&e.append(g+g+A),h&&i&&a&&d.esModule&&e.append(`${g}${g}${d.compact?fo:po}`),c&&e.append(c),e.indent(s).append(g+g+"});").prepend(_)},cjs:function(e,{dependencies:t,exports:n,hasExports:r,indentString:i,intro:s,isEntryModuleFacade:o,namedExportsMode:a,outro:h,varOrConst:u},c){const l=c.compact?"":"\n",p=c.compact?"":" ";s=(!1===c.strict?s:`'use strict';${l}${l}${s}`)+(a&&r&&o&&c.esModule?`${c.compact?fo:po}${l}${l}`:"");let d=!1;const f=!1!==c.interop;let m,g=!1;m="";for(const{id:e,namedExportsMode:n,isChunk:r,name:i,reexports:s,imports:o,exportsNames:a,exportsDefault:h}of t)s||o?(m+=c.compact&&g?",":`${m?`;${l}`:""}${u} `,g=!0,f&&!r&&h&&n?(d=!0,m+=a?`${i}${p}=${p}require('${e}')${c.compact?",":`;\n${u} `}${i}__default${p}=${p}${Zs}(${i})`:`${i}${p}=${p}${Zs}(require('${e}'))`):m+=`${i}${p}=${p}require('${e}')`):(m&&(m+=!c.compact||g?`;${l}`:","),g=!1,m+=`require('${e}')`);if(m&&(m+=";"),d){const e=c.compact?"e":"ex";s+=`function ${Zs}${p}(${e})${p}{${p}return${p}`+`(${e}${p}&&${p}(typeof ${e}${p}===${p}'object')${p}&&${p}'default'${p}in ${e})${p}`+`?${p}${e}['default']${p}:${p}${e}${c.compact?"":"; "}}${l}${l}`;}m&&(s+=m+l+l);const y=mo(n,t,a,c.interop,c.compact,i,`module.exports${p}=${p}`);return e.prepend(s),y&&e.append(l+l+y),h&&e.append(h),e},es:function(e,{intro:t,outro:n,dependencies:r,exports:i},s){const o=s.compact?"":" ",a=s.compact?"":"\n",h=r.map(({id:e,reexports:t,imports:n,name:r})=>{if(!t&&!n)return `import${o}'${e}';`;let i="";if(n){const t=n.find(e=>"default"===e.imported),r=n.find(e=>"*"===e.imported);r&&(i+=`import${o}*${o}as ${r.local} from${o}'${e}';`,n.length>1&&(i+=a)),t&&1===n.length?i+=`import ${t.local} from${o}'${e}';`:(!r||n.length>1)&&(i+=`import ${t?`${t.local},${o}`:""}{${o}${n.filter(e=>e!==t&&e!==r).map(e=>e.imported===e.local?e.imported:`${e.imported} as ${e.local}`).join(`,${o}`)}${o}}${o}from${o}'${e}';`);}if(t){n&&(i+=a);const s=t.find(e=>"*"===e.reexported),h=t.find(e=>"*"===e.imported&&"*"!==e.reexported);if(s){if(i+=`export${o}*${o}from${o}'${e}';`,1===t.length)return i;i+=a;}if(h){if(n&&n.some(e=>"*"===e.imported&&e.local===r)||(i+=`import${o}*${o}as ${r} from${o}'${e}';${a}`),i+=`export${o}{${o}${r===h.reexported?r:`${r} as ${h.reexported}`} };`,t.length===(s?2:1))return i;i+=a;}i+=`export${o}{${o}${t.filter(e=>e!==s&&e!==h).map(e=>e.imported===e.reexported?e.imported:`${e.imported} as ${e.reexported}`).join(`,${o}`)}${o}}${o}from${o}'${e}';`;}return i}).join(a);h&&(t+=h+a+a),t&&e.prepend(t);const u=[],c=[];return i.forEach(e=>{"default"===e.exported?u.push(`export default ${e.local};`):c.push(e.exported===e.local?e.local:`${e.local} as ${e.exported}`);}),c.length&&u.push(`export${o}{${o}${c.join(`,${o}`)}${o}};`),u.length&&e.append(a+a+u.join(a).trim()),n&&e.append(n),e.trim()},iife:function(e,{dependencies:t,exports:n,hasExports:r,indentString:i,intro:s,namedExportsMode:o,outro:a,varOrConst:h,warn:u},c){const l=c.compact?"":" ",p=c.compact?"":"\n",{extend:d,name:f}=c,m=f&&-1!==f.indexOf("."),g=!d&&!m;var y;f&&g&&(rt(y=f)||tt[y]||nt.test(y))&&So({code:"ILLEGAL_IDENTIFIER_AS_NAME",message:`Given name (${f}) is not legal JS identifier. If you need this you can try --extend option`}),xo(u,t);const x=Oo(t),v=x.map(e=>e.globalName||"null"),E=x.map(e=>e.name);r&&!f&&So({code:"INVALID_OPTION",message:'You must supply "output.name" for IIFE bundles.'}),o&&r&&(d?(v.unshift(`${Mo(f)}${l}=${l}${Mo(f)}${l}||${l}{}`),E.unshift("exports")):(v.unshift("{}"),E.unshift("exports")));const _=!1!==c.strict?`${i}'use strict';${p}${p}`:"";let b=`(function${l}(${E.join(`,${l}`)})${l}{${p}${_}`;!r||d&&o||(b=(g?`${h} ${f}`:Mo(f))+`${l}=${l}${b}`),m&&r&&(b=function(e,t,n,r){const i=e.split(".");n&&(i[0]=("function"==typeof n?n(i[0]):n[i[0]])||i[0]);const s=r?"":" ";i.pop();let o=t;return i.map(e=>(o+=No(e),`${o}${s}=${s}${o}${s}||${s}{}${r?"":";"}`)).join(r?",":"\n")+(r&&i.length?";":"\n")}(f,"this",c.globals,c.compact)+b);let A=`${p}${p}}(${v.join(`,${l}`)}));`;!d&&o&&r&&(A=`${p}${p}${i}return exports;${A}`);const S=go(t,c,h);S&&e.prepend(S+p+p),s&&e.prepend(s);const I=mo(n,t,o,c.interop,c.compact,i);return I&&e.append(p+p+I),a&&e.append(a),e.indent(i).prepend(b).append(A)},umd:function(e,{dependencies:t,exports:n,hasExports:r,indentString:i,intro:s,namedExportsMode:o,outro:a,varOrConst:h,warn:u},c){const l=c.compact?"":" ",p=c.compact?"":"\n",d=c.compact?"f":"factory",f=c.compact?"g":"global";r&&!c.name&&So({code:"INVALID_OPTION",message:'You must supply "output.name" for UMD bundles.'}),xo(u,t);const m=t.map(e=>`'${e.id}'`),g=t.map(e=>`require('${e.id}')`),y=Oo(t),x=y.map(e=>zo(e.globalName,f)),v=y.map(e=>e.name);o&&(r||!0===c.noConflict)&&(m.unshift("'exports'"),g.unshift("exports"),x.unshift(Ro(c.name,f,c.globals,c.compact,`${c.extend?`${zo(c.name,f)}${l}||${l}`:""}{}`)),v.unshift("exports"));const E=c.amd||{},_=(E.id?`'${E.id}',${l}`:"")+(m.length?`[${m.join(`,${l}`)}],${l}`:""),b=E.define||"define",A=!o&&r?`module.exports${l}=${l}`:"",S=!1!==c.strict?`${l}'use strict';${p}`:"";let I;if(!0===c.noConflict){const e=c.compact?"e":"exports";let t;!o&&r?t=`var ${e}${l}=${l}${Ro(c.name,f,c.globals,c.compact,`${d}(${x.join(`,${l}`)})`)};`:o&&(t=`var ${e}${l}=${l}${x.shift()};${p}`+`${i}${i}${d}(${[e].concat(x).join(`,${l}`)});`),I=`(function${l}()${l}{${p}`+`${i}${i}var current${l}=${l}${function(e,t,n){const r=e.split(".");let i=t;return r.map(e=>(i+=No(e),i)).join(`${n}&&${n}`)}(c.name,f,l)};${p}`+`${i}${i}${t}${p}`+`${i}${i}${e}.noConflict${l}=${l}function${l}()${l}{${l}`+`${zo(c.name,f)}${l}=${l}current;${l}return ${e}${c.compact?"":"; "}};${p}`+`${i}}())`;}else I=`${d}(${x.join(`,${l}`)})`,!o&&r&&(I=Ro(c.name,f,c.globals,c.compact,I));const w=r||!0===c.noConflict&&o||x.length>0,P=w?`this,${l}`:"",k=w?`(${f}${l}=${l}${f}${l}||${l}self,${l}`:"",C=w?")":"",N=`(function${l}(${w?`${f},${l}`:""}${d})${l}{${p}`+(w?`${i}typeof exports${l}===${l}'object'${l}&&${l}typeof module${l}!==${l}'undefined'${l}?`+`${l}${A}${d}(${g.join(`,${l}`)})${l}:${p}`:"")+`${i}typeof ${b}${l}===${l}'function'${l}&&${l}${b}.amd${l}?${l}${b}(${_}${d})${l}:${p}`+`${i}${k}${I}${C};${p}`+`}(${P}function${l}(${v.join(", ")})${l}{${S}${p}`,$=p+p+"}));",R=go(t,c,h);R&&e.prepend(R+p+p),s&&e.prepend(s);const O=mo(n,t,o,c.interop,c.compact,i);return O&&e.append(p+p+O),o&&r&&c.esModule&&e.append(p+p+(c.compact?fo:po)),a&&e.append(a),e.trim().indent(i).append($).prepend(N)}};const Wo={ArrayPattern(e,t){for(const n of t.elements)n&&Wo[n.type](e,n);},AssignmentPattern(e,t){Wo[t.left.type](e,t.left);},Identifier(e,t){e.push(t.name);},MemberExpression(){},ObjectPattern(e,t){for(const n of t.properties)"RestElement"===n.type?Wo.RestElement(e,n):Wo[n.value.type](e,n.value);},RestElement(e,t){Wo[t.argument.type](e,t.argument);}},Uo=function(e){const t=[];return Wo[e.type](t,e),t};class Fo extends Et{addDeclaration(e,t,n=null,r=!1){return r?this.parent.addDeclaration(e,t,Ie,!0):super.addDeclaration(e,t,n,!1)}}class qo extends Ls{addImplicitReturnExpressionToScope(){const e=this.body[this.body.length-1];e&&e.type===oe||this.scope.addReturnExpression(Ie);}createScope(e){this.scope=this.parent.preventChildBlockScope?e:new Fo(e);}hasEffects(e){for(const t of this.body)if(t.hasEffects(e))return !0;return !1}include(e){this.included=!0;for(const t of this.body)(e||t.shouldBeIncluded())&&t.include(e);}render(e,t){this.body.length?de(this.body,e,this.start+1,this.end-1,t):super.render(e,t);}}class Go extends Ls{createScope(e){this.scope=new Fs(e,this.context);}deoptimizePath(e){1===e.length&&e[0]===Ee&&this.scope.getReturnExpression().deoptimizePath(be);}getReturnExpressionWhenCalledAtPath(e){return 0===e.length?this.scope.getReturnExpression():Ie}hasEffects(e){return !1}hasEffectsWhenAccessedAtPath(e,t){return e.length>1}hasEffectsWhenAssignedAtPath(e,t){return e.length>1}hasEffectsWhenCalledAtPath(e,t,n){if(e.length>0)return !0;for(const e of this.params)if(e.hasEffects(n))return !0;return this.body.hasEffects(n)}initialise(){this.included=!1;for(const e of this.params)e.declare("parameter",Ie);this.body instanceof qo?this.body.addImplicitReturnExpressionToScope():this.scope.addReturnExpression(this.body);}parseNode(e){e.body.type===X&&(this.body=new this.context.nodeConstructors.BlockStatement(e.body,this,this.scope.hoistedBodyVarScope)),super.parseNode(e);}}function Ho(e){return 1===e.length?`exports('${e[0].safeExportName||e[0].exportName}', ${e[0].getName()});`:`exports({${e.map(e=>`${e.safeExportName||e.exportName}: ${e.getName()}`).join(", ")}});`}Go.prototype.preventChildBlockScope=!0;const Ko={"!=":(e,t)=>e!=t,"!==":(e,t)=>e!==t,"%":(e,t)=>e%t,"&":(e,t)=>e&t,"*":(e,t)=>e*t,"**":(e,t)=>Math.pow(e,t),"+":(e,t)=>e+t,"-":(e,t)=>e-t,"/":(e,t)=>e/t,"<":(e,t)=>e<t,"<<":(e,t)=>e<<t,"<=":(e,t)=>e<=t,"==":(e,t)=>e==t,"===":(e,t)=>e===t,">":(e,t)=>e>t,">=":(e,t)=>e>=t,">>":(e,t)=>e>>t,">>>":(e,t)=>e>>>t,"^":(e,t)=>e^t,in:()=>Se,instanceof:()=>Se,"|":(e,t)=>e|t};const Yo={};class Xo{constructor(e=Rs.Map()){this.entityPaths=e;}isTracked(e,t){return this.entityPaths.getIn([e,...t,Yo])}track(e,t){return new Xo(this.entityPaths.setIn([e,...t,Yo],!0))}}const Qo=new Xo;class Jo extends Us{addDeclaration(e,t,n=null,r=!1){return r?this.parent.addDeclaration(e,t,n,!0):super.addDeclaration(e,t,n,!1)}}class Zo extends Ls{createScope(e){this.scope=new Jo(e,this.context);}initialise(){this.included=!1,this.param&&this.param.declare("parameter",Ie);}parseNode(e){this.body=new this.context.nodeConstructors.BlockStatement(e.body,this,this.scope),super.parseNode(e);}}Zo.prototype.preventChildBlockScope=!0;class ea{constructor(e){this.expressions=e;}deoptimizePath(e){for(const t of this.expressions)t.deoptimizePath(e);}getLiteralValueAtPath(){return Se}getReturnExpressionWhenCalledAtPath(e,t,n){return new ea(this.expressions.map(r=>r.getReturnExpressionWhenCalledAtPath(e,t,n)))}hasEffectsWhenAccessedAtPath(e,t){for(const n of this.expressions)if(n.hasEffectsWhenAccessedAtPath(e,t))return !0;return !1}hasEffectsWhenAssignedAtPath(e,t){for(const n of this.expressions)if(n.hasEffectsWhenAssignedAtPath(e,t))return !0;return !1}hasEffectsWhenCalledAtPath(e,t,n){for(const r of this.expressions)if(r.hasEffectsWhenCalledAtPath(e,t,n))return !0;return !1}include(){}}class ta extends Ls{hasEffects(){return !1}initialise(){this.included=!1,this.context.addExport(this);}render(e,t,{start:n,end:r}=Y){e.remove(n,r);}}ta.prototype.needsBoundaries=!0;class na extends Ls{bind(){null!==this.declaration&&this.declaration.bind();}hasEffects(e){return null!==this.declaration&&this.declaration.hasEffects(e)}initialise(){this.included=!1,this.context.addExport(this);}render(e,t,{start:n,end:r}=Y){null===this.declaration?e.remove(n,r):(e.remove(this.start,this.declaration.start),this.declaration.render(e,t,{start:n,end:r}));}}na.prototype.needsBoundaries=!0;const ra=e=>{switch(e.format){case"cjs":{const t=e.compact?"":" ";return {interopLeft:`Promise.resolve({${t}default:${t}require(`,interopRight:`)${t}})`,left:"Promise.resolve(require(",right:"))"}}case"amd":{const t=e.compact?"":" ",n=e.compact?"c":"resolve",r=e.compact?"e":"reject";return {interopLeft:`new Promise(function${t}(${n},${t}${r})${t}{${t}require([`,interopRight:`],${t}function${t}(m)${t}{${t}${n}({${t}default:${t}m${t}})${t}},${t}${r})${t}})`,left:`new Promise(function${t}(${n},${t}${r})${t}{${t}require([`,right:`],${t}${n},${t}${r})${t}})`}}case"system":return {left:"module.import(",right:")"};case"es":return {left:`${e.dynamicImportFunction||"import"}(`,right:")"}}};class ia extends Ls{bind(){}hasEffects(){return !1}initialise(){this.included=!1,this.context.addImport(this);}render(e,t,{start:n,end:r}=Y){e.remove(n,r);}}ia.prototype.needsBoundaries=!0;class sa extends Ls{getLiteralValueAtPath(e){return e.length>0||null===this.value&&110!==this.context.code.charCodeAt(this.start)||"bigint"==typeof this.value?Se:this.value}getReturnExpressionWhenCalledAtPath(e){return 1!==e.length?Ie:Xe(this.members,e[0])}hasEffectsWhenAccessedAtPath(e){return null===this.value?e.length>0:e.length>1}hasEffectsWhenAssignedAtPath(e){return e.length>0}hasEffectsWhenCalledAtPath(e,t,n){return 1!==e.length||Ye(this.members,e[0],this.included,t,n)}initialise(){this.included=!1,this.members=function(e){switch(typeof e){case"boolean":return Ge;case"number":return He;case"string":return Ke;default:return Object.create(null)}}(this.value);}render(e,t){"string"==typeof this.value&&e.indentExclusionRanges.push([this.start+1,this.end-1]);}}function oa(e){return e.computed?function(e){if(e instanceof sa)return String(e.value);return null}(e.property):e.property.name}class aa extends Ls{constructor(){super(...arguments),this.variable=null;}addExportedVariables(){}bind(){if(this.bound)return;this.bound=!0;const e=function e(t){const n=t.propertyKey,r=t.object;if("string"==typeof n){if(r instanceof Xs)return [{key:r.name,pos:r.start},{key:n,pos:t.property.start}];if(r instanceof aa){const i=e(r);return i&&[...i,{key:n,pos:t.property.start}]}}return null}(this),t=e&&this.scope.findVariable(e[0].key);if(t&&t.isNamespace){const n=this.resolveNamespaceVariables(t,e.slice(1));n?"string"==typeof n?this.replacement=n:(n.isExternal&&n.module&&n.module.suggestName(e[0].key),this.variable=n,this.scope.addNamespaceMemberAccess(function(e){let t=e[0].key;for(let n=1;n<e.length;n++)t+="."+e[n].key;return t}(e),n)):super.bind();}else super.bind(),null===this.propertyKey&&this.analysePropertyKey();}deoptimizeCache(){for(const e of this.expressionsToBeDeoptimized)e.deoptimizeCache();}deoptimizePath(e){this.bound||this.bind(),0===e.length&&this.disallowNamespaceReassignment(),this.variable?this.variable.deoptimizePath(e):(null===this.propertyKey&&this.analysePropertyKey(),this.object.deoptimizePath([this.propertyKey,...e]));}getLiteralValueAtPath(e,t,n){return null!==this.variable?this.variable.getLiteralValueAtPath(e,t,n):(null===this.propertyKey&&this.analysePropertyKey(),this.expressionsToBeDeoptimized.push(n),this.object.getLiteralValueAtPath([this.propertyKey,...e],t,n))}getReturnExpressionWhenCalledAtPath(e,t,n){return null!==this.variable?this.variable.getReturnExpressionWhenCalledAtPath(e,t,n):(null===this.propertyKey&&this.analysePropertyKey(),this.expressionsToBeDeoptimized.push(n),this.object.getReturnExpressionWhenCalledAtPath([this.propertyKey,...e],t,n))}hasEffects(e){return this.property.hasEffects(e)||this.object.hasEffects(e)||this.context.propertyReadSideEffects&&this.object.hasEffectsWhenAccessedAtPath([this.propertyKey],e)}hasEffectsWhenAccessedAtPath(e,t){return 0!==e.length&&(null!==this.variable?this.variable.hasEffectsWhenAccessedAtPath(e,t):this.object.hasEffectsWhenAccessedAtPath([this.propertyKey,...e],t))}hasEffectsWhenAssignedAtPath(e,t){return null!==this.variable?this.variable.hasEffectsWhenAssignedAtPath(e,t):this.object.hasEffectsWhenAssignedAtPath([this.propertyKey,...e],t)}hasEffectsWhenCalledAtPath(e,t,n){return null!==this.variable?this.variable.hasEffectsWhenCalledAtPath(e,t,n):this.object.hasEffectsWhenCalledAtPath([this.propertyKey,...e],t,n)}include(e){this.included||(this.included=!0,null!==this.variable&&this.context.includeVariable(this.variable)),this.object.include(e),this.property.include(e);}initialise(){this.included=!1,this.propertyKey=oa(this),this.variable=null,this.bound=!1,this.replacement=null,this.expressionsToBeDeoptimized=[];}render(e,t,{renderedParentType:n,isCalleeOfRenderedParent:r}=Y){const i=n===Q&&r;if(this.variable||this.replacement){let t=this.variable?this.variable.getName():this.replacement;i&&(t="0, "+t),e.overwrite(this.start,this.end,t,{contentOnly:!0,storeName:!0});}else i&&e.appendRight(this.start,"0, "),super.render(e,t);}analysePropertyKey(){this.propertyKey=Ee;const e=this.property.getLiteralValueAtPath(_e,Qo,this);this.propertyKey=e===Se?Ee:String(e);}disallowNamespaceReassignment(){this.object instanceof Xs&&this.scope.findVariable(this.object.name).isNamespace&&this.context.error({code:"ILLEGAL_NAMESPACE_REASSIGNMENT",message:`Illegal reassignment to import '${this.object.name}'`},this.start);}resolveNamespaceVariables(e,t){if(0===t.length)return e;if(!e.isNamespace)return null;const n=t[0].key,r=e.isExternal?e.module.getVariableForExportName(n):e.context.traceExport(n);if(!r){const r=e.isExternal?e.module.id:e.context.fileName;return this.context.warn({code:"MISSING_EXPORT",exporter:bo(r),importer:bo(this.context.fileName),message:`'${n}' is not exported by '${bo(r)}'`,missing:n,url:"https://rollupjs.org/guide/en#error-name-is-not-exported-by-module-"},t[0].pos),"undefined"}return this.resolveNamespaceVariables(r,t.slice(1))}}const ha="ROLLUP_ASSET_URL_",ua="ROLLUP_CHUNK_URL_";class ca extends Ls{bind(){super.bind(),this.argument.deoptimizePath([Ee,Ee]);}}class la extends Ls{hasEffects(e){for(const t of this.body)if(t.hasEffects(e))return !0;return !1}include(e){this.included=!0;for(const t of this.body)(e||t.shouldBeIncluded())&&t.include(e);}render(e,t){this.body.length?de(this.body,e,this.start,this.end,t):super.render(e,t);}}class pa extends Ls{getLiteralValueAtPath(e){return e.length>0||1!==this.quasis.length?Se:this.quasis[0].value.cooked}render(e,t){e.indentExclusionRanges.push([this.start,this.end]),super.render(e,t);}}class da extends Et{constructor(e,t){super(e),this.context=t,this.variables.this=new xt("this",null,we,t);}addExportDefaultDeclaration(e,t,n){return this.variables.default=new Qs(e,t,n)}addNamespaceMemberAccess(e,t){t instanceof oo&&(this.accessedOutsideVariables[t.name]=t);}deconflict(e){for(const t of this.children)t.deconflict(e);}findLexicalBoundary(){return this}findVariable(e){const t=this.variables[e]||this.accessedOutsideVariables[e];if(t)return t;const n=this.context.traceVariable(e)||this.parent.findVariable(e);return n instanceof oo&&(this.accessedOutsideVariables[e]=n),n}}const fa={"!":e=>!e,"+":e=>+e,"-":e=>-e,delete:()=>Se,typeof:e=>typeof e,void:()=>void 0,"~":e=>~e};function ma(e){return null!==e.renderBaseName&&null!==e.exportName&&e.isReassigned}const ga={ArrayExpression:class extends Ls{bind(){super.bind();for(const e of this.elements)null!==e&&e.deoptimizePath(be);}getReturnExpressionWhenCalledAtPath(e){return 1!==e.length?Ie:Xe(qe,e[0])}hasEffectsWhenAccessedAtPath(e){return e.length>1}hasEffectsWhenCalledAtPath(e,t,n){return 1!==e.length||Ye(qe,e[0],this.included,t,n)}},ArrayPattern:class extends Ls{addExportedVariables(e){for(const t of this.elements)null!==t&&t.addExportedVariables(e);}declare(e,t){for(const t of this.elements)null!==t&&t.declare(e,Ie);}deoptimizePath(e){if(0===e.length)for(const t of this.elements)null!==t&&t.deoptimizePath(e);}hasEffectsWhenAssignedAtPath(e,t){if(e.length>0)return !0;for(const e of this.elements)if(null!==e&&e.hasEffectsWhenAssignedAtPath(_e,t))return !0;return !1}},ArrowFunctionExpression:Go,AssignmentExpression:class extends Ls{bind(){super.bind(),this.left.deoptimizePath(_e),this.right.deoptimizePath(be);}hasEffects(e){return this.right.hasEffects(e)||this.left.hasEffects(e)||this.left.hasEffectsWhenAssignedAtPath(_e,e)}hasEffectsWhenAccessedAtPath(e,t){return e.length>0&&this.right.hasEffectsWhenAccessedAtPath(e,t)}render(e,t){if(this.left.render(e,t),this.right.render(e,t),"system"===t.format)if(this.left.variable&&this.left.variable.exportName)e.prependLeft(e.original.indexOf("=",this.left.end)+1,` exports('${this.left.variable.exportName}',`),e.appendLeft(this.right.end,")");else if("addExportedVariables"in this.left){const t=[];this.left.addExportedVariables(t),t.length>0&&(e.prependRight(this.start,`function (v) {${Ho(t)} return v;} (`),e.appendLeft(this.end,")"));}}},AssignmentPattern:class extends Ls{addExportedVariables(e){this.left.addExportedVariables(e);}bind(){super.bind(),this.left.deoptimizePath(_e),this.right.deoptimizePath(be);}declare(e,t){this.left.declare(e,t);}deoptimizePath(e){0===e.length&&this.left.deoptimizePath(e);}hasEffectsWhenAssignedAtPath(e,t){return e.length>0||this.left.hasEffectsWhenAssignedAtPath(_e,t)}render(e,t,{isShorthandProperty:n}=Y){this.left.render(e,t,{isShorthandProperty:n}),this.right.render(e,t);}},AwaitExpression:class extends Ls{hasEffects(e){return super.hasEffects(e)||!e.ignoreReturnAwaitYield()}include(e){if(super.include(e),!this.context.usesTopLevelAwait){let e=this.parent;do{if(e instanceof Gs||e instanceof Go)return}while(e=e.parent);this.context.usesTopLevelAwait=!0;}}render(e,t){super.render(e,t);}},BinaryExpression:class extends Ls{getLiteralValueAtPath(e,t,n){if(e.length>0)return Se;const r=this.left.getLiteralValueAtPath(_e,t,n);if(r===Se)return Se;const i=this.right.getLiteralValueAtPath(_e,t,n);if(i===Se)return Se;const s=Ko[this.operator];return s?s(r,i):Se}hasEffectsWhenAccessedAtPath(e,t){return e.length>1}},BlockStatement:qo,BreakStatement:class extends Ls{hasEffects(e){return super.hasEffects(e)||!e.ignoreBreakStatements()||null!==this.label&&!e.ignoreLabel(this.label.name)}},CallExpression:class extends Ls{bind(){super.bind(),this.callee instanceof Xs&&(this.scope.findVariable(this.callee.name).isNamespace&&this.context.error({code:"CANNOT_CALL_NAMESPACE",message:`Cannot call a namespace ('${this.callee.name}')`},this.start),"eval"===this.callee.name&&this.context.warn({code:"EVAL",message:"Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification",url:"https://rollupjs.org/guide/en#avoiding-eval"},this.start)),null===this.returnExpression&&(this.returnExpression=this.callee.getReturnExpressionWhenCalledAtPath(_e,Qo,this));for(const e of this.arguments)e.deoptimizePath(be);}deoptimizeCache(){if(this.returnExpression!==Ie){this.returnExpression=Ie;for(const e of this.expressionsToBeDeoptimized)e.deoptimizeCache();}}deoptimizePath(e){e.length>0&&!this.context.deoptimizationTracker.track(this,e)&&(null===this.returnExpression&&(this.returnExpression=this.callee.getReturnExpressionWhenCalledAtPath(_e,Qo,this)),this.returnExpression.deoptimizePath(e));}getLiteralValueAtPath(e,t,n){return null===this.returnExpression&&(this.returnExpression=this.callee.getReturnExpressionWhenCalledAtPath(_e,t,this)),this.returnExpression===Ie||t.isTracked(this.returnExpression,e)?Se:(this.expressionsToBeDeoptimized.push(n),this.returnExpression.getLiteralValueAtPath(e,t.track(this.returnExpression,e),n))}getReturnExpressionWhenCalledAtPath(e,t,n){return null===this.returnExpression&&(this.returnExpression=this.callee.getReturnExpressionWhenCalledAtPath(_e,t,this)),this.returnExpression===Ie||t.isTracked(this.returnExpression,e)?Ie:(this.expressionsToBeDeoptimized.push(n),this.returnExpression.getReturnExpressionWhenCalledAtPath(e,t.track(this.returnExpression,e),n))}hasEffects(e){for(const t of this.arguments)if(t.hasEffects(e))return !0;return (!this.context.annotations||!this.annotatedPure)&&(this.callee.hasEffects(e)||this.callee.hasEffectsWhenCalledAtPath(_e,this.callOptions,e.getHasEffectsWhenCalledOptions()))}hasEffectsWhenAccessedAtPath(e,t){return e.length>0&&!t.hasReturnExpressionBeenAccessedAtPath(e,this)&&this.returnExpression.hasEffectsWhenAccessedAtPath(e,t.addAccessedReturnExpressionAtPath(e,this))}hasEffectsWhenAssignedAtPath(e,t){return 0===e.length||!t.hasReturnExpressionBeenAssignedAtPath(e,this)&&this.returnExpression.hasEffectsWhenAssignedAtPath(e,t.addAssignedReturnExpressionAtPath(e,this))}hasEffectsWhenCalledAtPath(e,t,n){return !n.hasReturnExpressionBeenCalledAtPath(e,this)&&this.returnExpression.hasEffectsWhenCalledAtPath(e,t,n.addCalledReturnExpressionAtPath(e,this))}include(e){super.include(e),this.returnExpression.included||this.returnExpression.include(!1);}initialise(){this.included=!1,this.returnExpression=null,this.callOptions=ve.create({args:this.arguments,callIdentifier:this,withNew:!1}),this.expressionsToBeDeoptimized=[];}render(e,t,{renderedParentType:n}=Y){super.render(e,t),n===Z&&this.callee.type===ee&&(e.appendRight(this.start,"("),e.prependLeft(this.end,")"));}},CatchClause:Zo,ClassBody:class extends Ls{hasEffectsWhenCalledAtPath(e,t,n){return e.length>0||null!==this.classConstructor&&this.classConstructor.hasEffectsWhenCalledAtPath(_e,t,n)}initialise(){this.included=!1;for(const e of this.body)if("constructor"===e.kind)return void(this.classConstructor=e);this.classConstructor=null;}},ClassDeclaration:Bs,ClassExpression:class extends Vs{},ConditionalExpression:class extends Ls{bind(){super.bind(),this.isBranchResolutionAnalysed||this.analyseBranchResolution();}deoptimizeCache(){if(null!==this.usedBranch){this.usedBranch=null,this.unusedBranch.deoptimizePath(be);for(const e of this.expressionsToBeDeoptimized)e.deoptimizeCache();}}deoptimizePath(e){e.length>0&&(this.isBranchResolutionAnalysed||this.analyseBranchResolution(),null===this.usedBranch?(this.consequent.deoptimizePath(e),this.alternate.deoptimizePath(e)):this.usedBranch.deoptimizePath(e));}getLiteralValueAtPath(e,t,n){return this.isBranchResolutionAnalysed||this.analyseBranchResolution(),null===this.usedBranch?Se:(this.expressionsToBeDeoptimized.push(n),this.usedBranch.getLiteralValueAtPath(e,t,n))}getReturnExpressionWhenCalledAtPath(e,t,n){return this.isBranchResolutionAnalysed||this.analyseBranchResolution(),null===this.usedBranch?new ea([this.consequent.getReturnExpressionWhenCalledAtPath(e,t,n),this.alternate.getReturnExpressionWhenCalledAtPath(e,t,n)]):(this.expressionsToBeDeoptimized.push(n),this.usedBranch.getReturnExpressionWhenCalledAtPath(e,t,n))}hasEffects(e){return !!this.test.hasEffects(e)||(null===this.usedBranch?this.consequent.hasEffects(e)||this.alternate.hasEffects(e):this.usedBranch.hasEffects(e))}hasEffectsWhenAccessedAtPath(e,t){return 0!==e.length&&(null===this.usedBranch?this.consequent.hasEffectsWhenAccessedAtPath(e,t)||this.alternate.hasEffectsWhenAccessedAtPath(e,t):this.usedBranch.hasEffectsWhenAccessedAtPath(e,t))}hasEffectsWhenAssignedAtPath(e,t){return 0===e.length||(null===this.usedBranch?this.consequent.hasEffectsWhenAssignedAtPath(e,t)||this.alternate.hasEffectsWhenAssignedAtPath(e,t):this.usedBranch.hasEffectsWhenAssignedAtPath(e,t))}hasEffectsWhenCalledAtPath(e,t,n){return null===this.usedBranch?this.consequent.hasEffectsWhenCalledAtPath(e,t,n)||this.alternate.hasEffectsWhenCalledAtPath(e,t,n):this.usedBranch.hasEffectsWhenCalledAtPath(e,t,n)}include(e){this.included=!0,e||null===this.usedBranch||this.test.shouldBeIncluded()?(this.test.include(e),this.consequent.include(e),this.alternate.include(e)):this.usedBranch.include(e);}initialise(){this.included=!1,this.isBranchResolutionAnalysed=!1,this.usedBranch=null,this.unusedBranch=null,this.expressionsToBeDeoptimized=[];}render(e,t,{renderedParentType:n,isCalleeOfRenderedParent:r}=Y){this.test.included?super.render(e,t):(e.remove(this.start,this.usedBranch.start),e.remove(this.usedBranch.end,this.end),ue(this,e),this.usedBranch.render(e,t,{isCalleeOfRenderedParent:n?r:this.parent.callee===this,renderedParentType:n||this.parent.type}));}analyseBranchResolution(){this.isBranchResolutionAnalysed=!0;const e=this.test.getLiteralValueAtPath(_e,Qo,this);e!==Se&&(e?(this.usedBranch=this.consequent,this.unusedBranch=this.alternate):(this.usedBranch=this.alternate,this.unusedBranch=this.consequent));}},DoWhileStatement:class extends Ls{hasEffects(e){return this.test.hasEffects(e)||this.body.hasEffects(e.setIgnoreBreakStatements())}},EmptyStatement:class extends Ls{hasEffects(){return !1}},ExportAllDeclaration:ta,ExportDefaultDeclaration:Ys,ExportNamedDeclaration:na,ExpressionStatement:class extends Ls{initialise(){this.included=!1,this.directive&&"use strict"!==this.directive&&this.parent.type===ie&&this.context.warn({code:"MODULE_LEVEL_DIRECTIVE",message:`Module level directives cause errors when bundled, '${this.directive}' was ignored.`},this.start);}render(e,t){super.render(e,t),this.included&&this.insertSemicolon(e);}shouldBeIncluded(){return this.directive&&"use strict"!==this.directive?this.parent.type!==ie:super.shouldBeIncluded()}},ForInStatement:class extends Ls{bind(){this.left.bind(),this.left.deoptimizePath(_e),this.right.bind(),this.body.bind();}createScope(e){this.scope=new Fo(e);}hasEffects(e){return this.left&&(this.left.hasEffects(e)||this.left.hasEffectsWhenAssignedAtPath(_e,e))||this.right&&this.right.hasEffects(e)||this.body.hasEffects(e.setIgnoreBreakStatements())}include(e){this.included=!0,this.left.includeWithAllDeclaredVariables(e),this.left.deoptimizePath(_e),this.right.include(e),this.body.include(e);}render(e,t){this.left.render(e,t,ce),this.right.render(e,t,ce),this.body.render(e,t);}},ForOfStatement:class extends Ls{bind(){this.left.bind(),this.left.deoptimizePath(_e),this.right.bind(),this.body.bind();}createScope(e){this.scope=new Fo(e);}hasEffects(e){return this.left&&(this.left.hasEffects(e)||this.left.hasEffectsWhenAssignedAtPath(_e,e))||this.right&&this.right.hasEffects(e)||this.body.hasEffects(e.setIgnoreBreakStatements())}include(e){this.included=!0,this.left.includeWithAllDeclaredVariables(e),this.left.deoptimizePath(_e),this.right.include(e),this.body.include(e);}render(e,t){this.left.render(e,t,ce),this.right.render(e,t,ce),this.body.render(e,t);}},ForStatement:class extends Ls{createScope(e){this.scope=new Fo(e);}hasEffects(e){return this.init&&this.init.hasEffects(e)||this.test&&this.test.hasEffects(e)||this.update&&this.update.hasEffects(e)||this.body.hasEffects(e.setIgnoreBreakStatements())}render(e,t){this.init&&this.init.render(e,t,ce),this.test&&this.test.render(e,t,ce),this.update&&this.update.render(e,t,ce),this.body.render(e,t);}},FunctionDeclaration:Hs,FunctionExpression:class extends Gs{},Identifier:Xs,IfStatement:class extends Ls{bind(){super.bind(),this.isTestValueAnalysed||(this.testValue=Se,this.isTestValueAnalysed=!0,this.testValue=this.test.getLiteralValueAtPath(_e,Qo,this));}deoptimizeCache(){this.testValue=Se;}hasEffects(e){return !!this.test.hasEffects(e)||(this.testValue===Se?this.consequent.hasEffects(e)||null!==this.alternate&&this.alternate.hasEffects(e):this.testValue?this.consequent.hasEffects(e):null!==this.alternate&&this.alternate.hasEffects(e))}include(e){if(this.included=!0,e)return this.test.include(!0),this.consequent.include(!0),void(null!==this.alternate&&this.alternate.include(!0));const t=this.testValue===Se;(t||this.test.shouldBeIncluded())&&this.test.include(!1),(t||this.testValue)&&this.consequent.shouldBeIncluded()&&this.consequent.include(!1),null===this.alternate||!t&&this.testValue||!this.alternate.shouldBeIncluded()||this.alternate.include(!1);}initialise(){this.included=!1,this.isTestValueAnalysed=!1;}render(e,t){if(this.test.included||(this.testValue?null!==this.alternate&&this.alternate.included:this.consequent.included))this.test.included?this.test.render(e,t):e.overwrite(this.test.start,this.test.end,this.testValue?"true":"false"),this.consequent.included?this.consequent.render(e,t):e.overwrite(this.consequent.start,this.consequent.end,";"),null!==this.alternate&&(this.alternate.included?this.alternate.render(e,t):e.remove(this.consequent.end,this.alternate.end));else{const n=this.testValue?this.consequent:this.alternate;e.remove(this.start,n.start),e.remove(n.end,this.end),ue(this,e),n.render(e,t);}}},Import:class extends Ls{include(){this.included=!0,this.context.includeDynamicImport(this);}initialise(){this.included=!1,this.resolutionNamespace=void 0,this.resolutionInterop=!1,this.context.addDynamicImport(this);}render(e,t){if(this.resolutionNamespace){const n=t.compact?"":" ",r=t.compact?"":";";return void e.overwrite(this.parent.start,this.parent.end,`Promise.resolve().then(function${n}()${n}{${n}return ${this.resolutionNamespace}${r}${n}})`)}const n=ra(t);if(n){const t=this.resolutionInterop&&n.interopLeft||n.left,r=le(e.original,"(",this.parent.callee.end)+1;e.overwrite(this.parent.start,r,t);const i=this.resolutionInterop&&n.interopRight||n.right;e.overwrite(this.parent.end-1,this.parent.end,i);}}renderFinalResolution(e,t,n){this.included&&("amd"===n&&t.startsWith("'.")&&t.endsWith(".js'")&&(t=t.slice(0,-4)+"'"),e.overwrite(this.parent.arguments[0].start,this.parent.arguments[0].end,t));}setResolution(e,t){this.resolutionInterop=e,this.resolutionNamespace=t;}},ImportDeclaration:ia,LabeledStatement:class extends Ls{hasEffects(e){return this.body.hasEffects(e.setIgnoreLabel(this.label.name).setIgnoreBreakStatements())}},Literal:sa,LogicalExpression:class extends Ls{bind(){super.bind(),this.isBranchResolutionAnalysed||this.analyseBranchResolution();}deoptimizeCache(){if(null!==this.usedBranch){this.usedBranch=null,this.unusedBranch.deoptimizePath(be);for(const e of this.expressionsToBeDeoptimized)e.deoptimizeCache();}}deoptimizePath(e){e.length>0&&(this.isBranchResolutionAnalysed||this.analyseBranchResolution(),null===this.usedBranch?(this.left.deoptimizePath(e),this.right.deoptimizePath(e)):this.usedBranch.deoptimizePath(e));}getLiteralValueAtPath(e,t,n){return this.isBranchResolutionAnalysed||this.analyseBranchResolution(),null===this.usedBranch?Se:(this.expressionsToBeDeoptimized.push(n),this.usedBranch.getLiteralValueAtPath(e,t,n))}getReturnExpressionWhenCalledAtPath(e,t,n){return this.isBranchResolutionAnalysed||this.analyseBranchResolution(),null===this.usedBranch?new ea([this.left.getReturnExpressionWhenCalledAtPath(e,t,n),this.right.getReturnExpressionWhenCalledAtPath(e,t,n)]):(this.expressionsToBeDeoptimized.push(n),this.usedBranch.getReturnExpressionWhenCalledAtPath(e,t,n))}hasEffects(e){return null===this.usedBranch?this.left.hasEffects(e)||this.right.hasEffects(e):this.usedBranch.hasEffects(e)}hasEffectsWhenAccessedAtPath(e,t){return 0!==e.length&&(null===this.usedBranch?this.left.hasEffectsWhenAccessedAtPath(e,t)||this.right.hasEffectsWhenAccessedAtPath(e,t):this.usedBranch.hasEffectsWhenAccessedAtPath(e,t))}hasEffectsWhenAssignedAtPath(e,t){return 0===e.length||(null===this.usedBranch?this.left.hasEffectsWhenAssignedAtPath(e,t)||this.right.hasEffectsWhenAssignedAtPath(e,t):this.usedBranch.hasEffectsWhenAssignedAtPath(e,t))}hasEffectsWhenCalledAtPath(e,t,n){return null===this.usedBranch?this.left.hasEffectsWhenCalledAtPath(e,t,n)||this.right.hasEffectsWhenCalledAtPath(e,t,n):this.usedBranch.hasEffectsWhenCalledAtPath(e,t,n)}include(e){this.included=!0,e||null===this.usedBranch||this.unusedBranch.shouldBeIncluded()?(this.left.include(e),this.right.include(e)):this.usedBranch.include(e);}initialise(){this.included=!1,this.isBranchResolutionAnalysed=!1,this.usedBranch=null,this.unusedBranch=null,this.expressionsToBeDeoptimized=[];}render(e,t,{renderedParentType:n,isCalleeOfRenderedParent:r}=Y){this.left.included&&this.right.included?super.render(e,t):(e.remove(this.start,this.usedBranch.start),e.remove(this.usedBranch.end,this.end),ue(this,e),this.usedBranch.render(e,t,{isCalleeOfRenderedParent:n?r:this.parent.callee===this,renderedParentType:n||this.parent.type}));}analyseBranchResolution(){this.isBranchResolutionAnalysed=!0;const e=this.left.getLiteralValueAtPath(_e,Qo,this);e!==Se&&(("||"===this.operator?e:!e)?(this.usedBranch=this.left,this.unusedBranch=this.right):(this.usedBranch=this.right,this.unusedBranch=this.left));}},MemberExpression:aa,MetaProperty:class extends Ls{hasEffectsWhenAccessedAtPath(e){return e.length>1}initialise(){"import"===this.meta.name&&this.context.addImportMeta(this),this.included=!1;}renderFinalMechanism(e,t,n,r){if(!this.included)return !1;const i=this.parent,s=i instanceof aa&&"string"==typeof i.propertyKey?i.propertyKey:null;if(s&&(s.startsWith(ha)||s.startsWith(ua))){let o,a=null,h=null;s.startsWith(ha)?(a=s.substr(ha.length),o=this.context.getAssetFileName(a)):(h=s.substr(ua.length),o=this.context.getChunkFileName(h));const u=ut(dt(lt(t),o));let c;return null!==a&&(c=r.hookFirstSync("resolveAssetUrl",[{assetFileName:o,chunkId:t,format:n,moduleId:this.context.module.id,relativeAssetPath:u}])),c||(c=r.hookFirstSync("resolveFileUrl",[{assetReferenceId:a,chunkId:t,chunkReferenceId:h,fileName:o,format:n,moduleId:this.context.module.id,relativePath:u}])),e.overwrite(i.start,i.end,c),!0}const o=r.hookFirstSync("resolveImportMeta",[s,{chunkId:t,format:n,moduleId:this.context.module.id}]);return "string"==typeof o&&(i instanceof aa?e.overwrite(i.start,i.end,o):e.overwrite(this.start,this.end,o),!0)}},MethodDefinition:class extends Ls{hasEffects(e){return this.key.hasEffects(e)}hasEffectsWhenCalledAtPath(e,t,n){return e.length>0||this.value.hasEffectsWhenCalledAtPath(_e,t,n)}},NewExpression:class extends Ls{bind(){super.bind();for(const e of this.arguments)e.deoptimizePath(be);}hasEffects(e){for(const t of this.arguments)if(t.hasEffects(e))return !0;return !this.annotatedPure&&this.callee.hasEffectsWhenCalledAtPath(_e,this.callOptions,e.getHasEffectsWhenCalledOptions())}hasEffectsWhenAccessedAtPath(e,t){return e.length>1}initialise(){this.included=!1,this.callOptions=ve.create({args:this.arguments,callIdentifier:this,withNew:!0});}},ObjectExpression:class extends Ls{bind(){super.bind(),null===this.propertyMap&&this.buildPropertyMap();}deoptimizeCache(){this.hasUnknownDeoptimizedProperty||this.deoptimizeAllProperties();}deoptimizePath(e){if(this.hasUnknownDeoptimizedProperty)return;if(null===this.propertyMap&&this.buildPropertyMap(),0===e.length)return void this.deoptimizeAllProperties();const t=e[0];if(1===e.length){if("string"!=typeof t)return void this.deoptimizeAllProperties();if(!this.deoptimizedPaths[t]&&(this.deoptimizedPaths[t]=!0,this.expressionsToBeDeoptimized[t]))for(const e of this.expressionsToBeDeoptimized[t])e.deoptimizeCache();}const n=1===e.length?be:e.slice(1);for(const e of"string"==typeof t?this.propertyMap[t]?this.propertyMap[t].propertiesRead:[]:this.properties)e.deoptimizePath(n);}getLiteralValueAtPath(e,t,n){null===this.propertyMap&&this.buildPropertyMap();const r=e[0];return 0===e.length||this.hasUnknownDeoptimizedProperty||"string"!=typeof r||this.deoptimizedPaths[r]?Se:1!==e.length||this.propertyMap[r]||Fe[r]||0!==this.unmatchablePropertiesRead.length?!this.propertyMap[r]||null===this.propertyMap[r].exactMatchRead||this.propertyMap[r].propertiesRead.length>1?Se:(this.expressionsToBeDeoptimized[r]?this.expressionsToBeDeoptimized[r].push(n):this.expressionsToBeDeoptimized[r]=[n],this.propertyMap[r].exactMatchRead.getLiteralValueAtPath(e.slice(1),t,n)):void(this.expressionsToBeDeoptimized[r]?this.expressionsToBeDeoptimized[r].push(n):this.expressionsToBeDeoptimized[r]=[n])}getReturnExpressionWhenCalledAtPath(e,t,n){null===this.propertyMap&&this.buildPropertyMap();const r=e[0];return 0===e.length||this.hasUnknownDeoptimizedProperty||"string"!=typeof r||this.deoptimizedPaths[r]?Ie:1!==e.length||!Fe[r]||0!==this.unmatchablePropertiesRead.length||this.propertyMap[r]&&null!==this.propertyMap[r].exactMatchRead?!this.propertyMap[r]||null===this.propertyMap[r].exactMatchRead||this.propertyMap[r].propertiesRead.length>1?Ie:(this.expressionsToBeDeoptimized[r]?this.expressionsToBeDeoptimized[r].push(n):this.expressionsToBeDeoptimized[r]=[n],this.propertyMap[r].exactMatchRead.getReturnExpressionWhenCalledAtPath(e.slice(1),t,n)):Xe(Fe,r)}hasEffectsWhenAccessedAtPath(e,t){if(0===e.length)return !1;const n=e[0];if(e.length>1&&(this.hasUnknownDeoptimizedProperty||"string"!=typeof n||this.deoptimizedPaths[n]||!this.propertyMap[n]||null===this.propertyMap[n].exactMatchRead))return !0;const r=e.slice(1);for(const e of"string"!=typeof n?this.properties:this.propertyMap[n]?this.propertyMap[n].propertiesRead:[])if(e.hasEffectsWhenAccessedAtPath(r,t))return !0;return !1}hasEffectsWhenAssignedAtPath(e,t){if(0===e.length)return !1;const n=e[0];if(e.length>1&&(this.hasUnknownDeoptimizedProperty||"string"!=typeof n||this.deoptimizedPaths[n]||!this.propertyMap[n]||null===this.propertyMap[n].exactMatchRead))return !0;const r=e.slice(1);for(const i of"string"!=typeof n?this.properties:e.length>1?this.propertyMap[n].propertiesRead:this.propertyMap[n]?this.propertyMap[n].propertiesSet:[])if(i.hasEffectsWhenAssignedAtPath(r,t))return !0;return !1}hasEffectsWhenCalledAtPath(e,t,n){const r=e[0];if(0===e.length||this.hasUnknownDeoptimizedProperty||"string"!=typeof r||this.deoptimizedPaths[r]||(this.propertyMap[r]?!this.propertyMap[r].exactMatchRead:e.length>1||!Fe[r]))return !0;const i=e.slice(1);for(const e of this.propertyMap[r]?this.propertyMap[r].propertiesRead:[])if(e.hasEffectsWhenCalledAtPath(i,t,n))return !0;return !(1!==e.length||!Fe[r])&&Ye(Fe,r,this.included,t,n)}initialise(){this.included=!1,this.hasUnknownDeoptimizedProperty=!1,this.deoptimizedPaths=Object.create(null),this.propertyMap=null,this.expressionsToBeDeoptimized=Object.create(null);}render(e,t,{renderedParentType:n}=Y){super.render(e,t),n===Z&&(e.appendRight(this.start,"("),e.prependLeft(this.end,")"));}buildPropertyMap(){this.propertyMap=Object.create(null),this.unmatchablePropertiesRead=[],this.unmatchablePropertiesWrite=[];for(let e=this.properties.length-1;e>=0;e--){const t=this.properties[e];if(t instanceof ca){this.unmatchablePropertiesRead.push(t);continue}const n="get"!==t.kind,r="set"!==t.kind;let i;if(t.computed){const e=t.key.getLiteralValueAtPath(_e,Qo,this);if(e===Se){r?this.unmatchablePropertiesRead.push(t):this.unmatchablePropertiesWrite.push(t);continue}i=String(e);}else i=t.key instanceof Xs?t.key.name:String(t.key.value);const s=this.propertyMap[i];s?(r&&null===s.exactMatchRead&&(s.exactMatchRead=t,s.propertiesRead.push(t,...this.unmatchablePropertiesRead)),n&&!r&&null===s.exactMatchWrite&&(s.exactMatchWrite=t,s.propertiesSet.push(t,...this.unmatchablePropertiesWrite))):this.propertyMap[i]={exactMatchRead:r?t:null,exactMatchWrite:n?t:null,propertiesRead:r?[t,...this.unmatchablePropertiesRead]:[],propertiesSet:n&&!r?[t,...this.unmatchablePropertiesWrite]:[]};}}deoptimizeAllProperties(){this.hasUnknownDeoptimizedProperty=!0;for(const e of this.properties)e.deoptimizePath(be);for(const e of Object.keys(this.expressionsToBeDeoptimized))for(const t of this.expressionsToBeDeoptimized[e])t.deoptimizeCache();}},ObjectPattern:class extends Ls{addExportedVariables(e){for(const t of this.properties)t.type===se?t.value.addExportedVariables(e):t.argument.addExportedVariables(e);}declare(e,t){for(const n of this.properties)n.declare(e,t);}deoptimizePath(e){if(0===e.length)for(const t of this.properties)t.deoptimizePath(e);}hasEffectsWhenAssignedAtPath(e,t){if(e.length>0)return !0;for(const e of this.properties)if(e.hasEffectsWhenAssignedAtPath(_e,t))return !0;return !1}},Program:la,Property:class extends Ls{constructor(){super(...arguments),this.declarationInit=null;}bind(){super.bind(),"get"===this.kind&&null===this.returnExpression&&this.updateReturnExpression(),null!==this.declarationInit&&this.declarationInit.deoptimizePath([Ee,Ee]);}declare(e,t){this.declarationInit=t,this.value.declare(e,Ie);}deoptimizeCache(){throw new Error("Unexpected deoptimization")}deoptimizePath(e){"get"===this.kind?e.length>0&&(null===this.returnExpression&&this.updateReturnExpression(),this.returnExpression.deoptimizePath(e)):"set"!==this.kind&&this.value.deoptimizePath(e);}getLiteralValueAtPath(e,t,n){return "set"===this.kind?Se:"get"===this.kind?(null===this.returnExpression&&this.updateReturnExpression(),this.returnExpression.getLiteralValueAtPath(e,t,n)):this.value.getLiteralValueAtPath(e,t,n)}getReturnExpressionWhenCalledAtPath(e,t,n){return "set"===this.kind?Ie:"get"===this.kind?(null===this.returnExpression&&this.updateReturnExpression(),this.returnExpression.getReturnExpressionWhenCalledAtPath(e,t,n)):this.value.getReturnExpressionWhenCalledAtPath(e,t,n)}hasEffects(e){return this.key.hasEffects(e)||this.value.hasEffects(e)}hasEffectsWhenAccessedAtPath(e,t){return "get"===this.kind?this.value.hasEffectsWhenCalledAtPath(_e,this.accessorCallOptions,t.getHasEffectsWhenCalledOptions())||e.length>0&&this.returnExpression.hasEffectsWhenAccessedAtPath(e,t):this.value.hasEffectsWhenAccessedAtPath(e,t)}hasEffectsWhenAssignedAtPath(e,t){return "get"===this.kind?0===e.length||this.returnExpression.hasEffectsWhenAssignedAtPath(e,t):"set"===this.kind?e.length>0||this.value.hasEffectsWhenCalledAtPath(_e,this.accessorCallOptions,t.getHasEffectsWhenCalledOptions()):this.value.hasEffectsWhenAssignedAtPath(e,t)}hasEffectsWhenCalledAtPath(e,t,n){return "get"===this.kind?this.returnExpression.hasEffectsWhenCalledAtPath(e,t,n):this.value.hasEffectsWhenCalledAtPath(e,t,n)}initialise(){this.included=!1,this.returnExpression=null,this.accessorCallOptions=ve.create({callIdentifier:this,withNew:!1});}render(e,t){this.shorthand||this.key.render(e,t),this.value.render(e,t,{isShorthandProperty:this.shorthand});}updateReturnExpression(){this.returnExpression=Ie,this.returnExpression=this.value.getReturnExpressionWhenCalledAtPath(_e,Qo,this);}},RestElement:class extends Ls{constructor(){super(...arguments),this.declarationInit=null;}addExportedVariables(e){this.argument.addExportedVariables(e);}bind(){super.bind(),null!==this.declarationInit&&this.declarationInit.deoptimizePath([Ee,Ee]);}declare(e,t){this.argument.declare(e,Ie),this.declarationInit=t;}deoptimizePath(e){0===e.length&&this.argument.deoptimizePath(_e);}hasEffectsWhenAssignedAtPath(e,t){return e.length>0||this.argument.hasEffectsWhenAssignedAtPath(_e,t)}},ReturnStatement:class extends Ls{hasEffects(e){return !e.ignoreReturnAwaitYield()||null!==this.argument&&this.argument.hasEffects(e)}initialise(){this.included=!1,this.scope.addReturnExpression(this.argument||Ie);}render(e,t){this.argument&&(this.argument.render(e,t),this.argument.start===this.start+6&&e.prependLeft(this.start+6," "));}},SequenceExpression:class extends Ls{deoptimizePath(e){e.length>0&&this.expressions[this.expressions.length-1].deoptimizePath(e);}getLiteralValueAtPath(e,t,n){return this.expressions[this.expressions.length-1].getLiteralValueAtPath(e,t,n)}hasEffects(e){for(const t of this.expressions)if(t.hasEffects(e))return !0;return !1}hasEffectsWhenAccessedAtPath(e,t){return e.length>0&&this.expressions[this.expressions.length-1].hasEffectsWhenAccessedAtPath(e,t)}hasEffectsWhenAssignedAtPath(e,t){return 0===e.length||this.expressions[this.expressions.length-1].hasEffectsWhenAssignedAtPath(e,t)}hasEffectsWhenCalledAtPath(e,t,n){return this.expressions[this.expressions.length-1].hasEffectsWhenCalledAtPath(e,t,n)}include(e){this.included=!0;for(let t=0;t<this.expressions.length-1;t++){const n=this.expressions[t];(e||n.shouldBeIncluded())&&n.include(e);}this.expressions[this.expressions.length-1].include(e);}render(e,t,{renderedParentType:n,isCalleeOfRenderedParent:r}=Y){let i,s=0,o=0;for(const{node:a,start:h,end:u}of fe(this.expressions,e,this.start,this.end))a.included?(o++,0===s&&(s=h),i=u,a===this.expressions[this.expressions.length-1]&&1===o?a.render(e,t,{isCalleeOfRenderedParent:n?r:this.parent.callee===this,renderedParentType:n||this.parent.type}):a.render(e,t)):he(a,e,h,u);o>1&&n&&(e.prependRight(s,"("),e.appendLeft(i,")"));}},SpreadElement:ca,SwitchCase:class extends Ls{include(e){this.included=!0,this.test&&this.test.include(e);for(const t of this.consequent)(e||t.shouldBeIncluded())&&t.include(e);}render(e,t){if(this.consequent.length){this.test&&this.test.render(e,t);const n=this.test?this.test.end:le(e.original,"default",this.start)+7,r=le(e.original,":",n)+1;de(this.consequent,e,r,this.end,t);}else super.render(e,t);}},SwitchStatement:class extends Ls{createScope(e){this.scope=new Fo(e);}hasEffects(e){return super.hasEffects(e.setIgnoreBreakStatements())}},TaggedTemplateExpression:class extends Ls{bind(){super.bind(),this.tag.type===te&&(this.scope.findVariable(this.tag.name).isNamespace&&this.context.error({code:"CANNOT_CALL_NAMESPACE",message:`Cannot call a namespace ('${this.tag.name}')`},this.start),"eval"===this.tag.name&&this.context.warn({code:"EVAL",message:"Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification",url:"https://rollupjs.org/guide/en#avoiding-eval"},this.start));}hasEffects(e){return super.hasEffects(e)||this.tag.hasEffectsWhenCalledAtPath(_e,this.callOptions,e.getHasEffectsWhenCalledOptions())}initialise(){this.included=!1,this.callOptions=ve.create({callIdentifier:this,withNew:!1});}},TemplateElement:class extends Ls{hasEffects(e){return !1}},TemplateLiteral:pa,ThisExpression:class extends Ls{bind(){super.bind(),this.variable=this.scope.findVariable("this");}hasEffectsWhenAccessedAtPath(e,t){return e.length>0&&this.variable.hasEffectsWhenAccessedAtPath(e,t)}hasEffectsWhenAssignedAtPath(e,t){return this.variable.hasEffectsWhenAssignedAtPath(e,t)}initialise(){this.included=!1,this.variable=null,this.alias=this.scope.findLexicalBoundary()instanceof da?this.context.moduleContext:null,"undefined"===this.alias&&this.context.warn({code:"THIS_IS_UNDEFINED",message:"The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten",url:"https://rollupjs.org/guide/en#error-this-is-undefined"},this.start);}render(e,t){null!==this.alias&&e.overwrite(this.start,this.end,this.alias,{contentOnly:!1,storeName:!0});}},ThrowStatement:class extends Ls{hasEffects(e){return !0}},TryStatement:Ls,UnaryExpression:class extends Ls{bind(){super.bind(),"delete"===this.operator&&this.argument.deoptimizePath(_e);}getLiteralValueAtPath(e,t,n){if(e.length>0)return Se;const r=this.argument.getLiteralValueAtPath(_e,t,n);return r===Se?Se:fa[this.operator](r)}hasEffects(e){return this.argument.hasEffects(e)||"delete"===this.operator&&this.argument.hasEffectsWhenAssignedAtPath(_e,e)}hasEffectsWhenAccessedAtPath(e,t){return "void"===this.operator?e.length>0:e.length>1}},UnknownNode:class extends Ls{hasEffects(e){return !0}include(){super.include(!0);}},UpdateExpression:class extends Ls{bind(){super.bind(),this.argument.deoptimizePath(_e),this.argument instanceof Xs&&(this.scope.findVariable(this.argument.name).isReassigned=!0);}hasEffects(e){return this.argument.hasEffects(e)||this.argument.hasEffectsWhenAssignedAtPath(_e,e)}hasEffectsWhenAccessedAtPath(e,t){return e.length>1}render(e,t){this.argument.render(e,t);const n=this.argument.variable;if("system"===t.format&&n&&n.exportName){const t=n.getName();if(this.prefix)e.overwrite(this.start,this.end,`exports('${n.exportName}', ${this.operator}${t})`);else{let r;switch(this.operator){case"++":r=`${t} + 1`;break;case"--":r=`${t} - 1`;}e.overwrite(this.start,this.end,`(exports('${n.exportName}', ${r}), ${t}${this.operator})`);}}}},VariableDeclaration:class extends Ls{deoptimizePath(e){for(const e of this.declarations)e.deoptimizePath(_e);}hasEffectsWhenAssignedAtPath(e,t){return !1}include(e){this.included=!0;for(const t of this.declarations)(e||t.shouldBeIncluded())&&t.include(e);}includeWithAllDeclaredVariables(e){this.included=!0;for(const t of this.declarations)t.include(e);}initialise(){this.included=!1;for(const e of this.declarations)e.declareDeclarator(this.kind);}render(e,t,n=Y){if(function(e){for(const t of e){if(!t.included)return !1;if(t.id.type===te){if(t.id.variable.exportName)return !1}else{const e=[];if(t.id.addExportedVariables(e),e.length>0)return !1}}return !0}(this.declarations)){for(const n of this.declarations)n.render(e,t);n.isNoStatement||59===e.original.charCodeAt(this.end-1)||e.appendLeft(this.end,";");}else this.renderReplacedDeclarations(e,t,n);}renderDeclarationEnd(e,t,n,r,i,s,o){59===e.original.charCodeAt(this.end-1)&&e.remove(this.end-1,this.end),s&&(t+=";"),null!==n?(10!==e.original.charCodeAt(r-1)||10!==e.original.charCodeAt(this.end)&&13!==e.original.charCodeAt(this.end)||(r--,13===e.original.charCodeAt(r)&&r--),r===n+1?e.overwrite(n,i,t):(e.overwrite(n,n+1,t),e.remove(r,i))):e.appendLeft(i,t),o.length>0&&e.appendLeft(i," "+Ho(o));}renderReplacedDeclarations(e,t,{start:n=this.start,end:r=this.end,isNoStatement:i}){const s=fe(this.declarations,e,this.start+this.kind.length,this.end-(59===e.original.charCodeAt(this.end-1)?1:0));let o,a,h=(a=/\n\s*$/.test(e.slice(this.start,s[0].start))?this.start+this.kind.length:s[0].start)-1;e.remove(this.start,h);let u,c,l=!1,p=!1,d="";const f=[];for(const{node:n,start:r,separator:i,contentEnd:m,end:g}of s)!n.included||n.id instanceof Xs&&ma(n.id.variable)&&null===n.init?e.remove(r,g):(u="",c="",n.id instanceof Xs&&ma(n.id.variable)?(p&&(d+=";"),l=!1):("system"===t.format&&null!==n.init&&(n.id.type!==te?n.id.addExportedVariables(f):n.id.variable.exportName&&(e.prependLeft(e.original.indexOf("=",n.id.end)+1,` exports('${n.id.variable.safeExportName||n.id.variable.exportName}',`),c+=")")),l?d+=",":(p&&(d+=";"),u+=`${this.kind} `,l=!0)),a===h+1?e.overwrite(h,a,d+u):(e.overwrite(h,h+1,d),e.appendLeft(a,u)),n.render(e,t),o=m,a=g,p=!0,h=i,d=c);p?this.renderDeclarationEnd(e,d,h,o,a,!i,f):e.remove(n,r);}},VariableDeclarator:class extends Ls{declareDeclarator(e){this.id.declare(e,this.init||we);}deoptimizePath(e){this.id.deoptimizePath(e);}render(e,t){null===this.init||this.init.included?super.render(e,t):(e.remove(this.id.end,this.end),this.id.render(e,t));}},WhileStatement:class extends Ls{hasEffects(e){return this.test.hasEffects(e)||this.body.hasEffects(e.setIgnoreBreakStatements())}},YieldExpression:class extends Ls{bind(){super.bind(),null!==this.argument&&this.argument.deoptimizePath(be);}hasEffects(e){return !e.ignoreReturnAwaitYield()||null!==this.argument&&this.argument.hasEffects(e)}render(e,t){this.argument&&(this.argument.render(e,t),this.argument.start===this.start+5&&e.prependLeft(this.start+5," "));}}};function ya(e,t,n){n(e,t);}function xa(e,t,n){}var va={};function Ea(e,t,n=e.type){let r=t.commentNodes[t.commentIndex];for(;r&&e.start>=r.end;)_a(e,r),r=t.commentNodes[++t.commentIndex];r&&r.end<=e.end&&va[n](e,t,Ea);}function _a(e,t){e.annotations?e.annotations.push(t):e.annotations=[t],"ExpressionStatement"===e.type&&(e=e.expression),"CallExpression"!==e.type&&"NewExpression"!==e.type||(e.annotatedPure=!0);}va.Program=va.BlockStatement=function(e,t,n){for(var r=0,i=e.body;r<i.length;r+=1){n(i[r],t,"Statement");}},va.Statement=ya,va.EmptyStatement=xa,va.ExpressionStatement=va.ParenthesizedExpression=function(e,t,n){return n(e.expression,t,"Expression")},va.IfStatement=function(e,t,n){n(e.test,t,"Expression"),n(e.consequent,t,"Statement"),e.alternate&&n(e.alternate,t,"Statement");},va.LabeledStatement=function(e,t,n){return n(e.body,t,"Statement")},va.BreakStatement=va.ContinueStatement=xa,va.WithStatement=function(e,t,n){n(e.object,t,"Expression"),n(e.body,t,"Statement");},va.SwitchStatement=function(e,t,n){n(e.discriminant,t,"Expression");for(var r=0,i=e.cases;r<i.length;r+=1){var s=i[r];s.test&&n(s.test,t,"Expression");for(var o=0,a=s.consequent;o<a.length;o+=1){n(a[o],t,"Statement");}}},va.SwitchCase=function(e,t,n){e.test&&n(e.test,t,"Expression");for(var r=0,i=e.consequent;r<i.length;r+=1){n(i[r],t,"Statement");}},va.ReturnStatement=va.YieldExpression=va.AwaitExpression=function(e,t,n){e.argument&&n(e.argument,t,"Expression");},va.ThrowStatement=va.SpreadElement=function(e,t,n){return n(e.argument,t,"Expression")},va.TryStatement=function(e,t,n){n(e.block,t,"Statement"),e.handler&&n(e.handler,t),e.finalizer&&n(e.finalizer,t,"Statement");},va.CatchClause=function(e,t,n){e.param&&n(e.param,t,"Pattern"),n(e.body,t,"Statement");},va.WhileStatement=va.DoWhileStatement=function(e,t,n){n(e.test,t,"Expression"),n(e.body,t,"Statement");},va.ForStatement=function(e,t,n){e.init&&n(e.init,t,"ForInit"),e.test&&n(e.test,t,"Expression"),e.update&&n(e.update,t,"Expression"),n(e.body,t,"Statement");},va.ForInStatement=va.ForOfStatement=function(e,t,n){n(e.left,t,"ForInit"),n(e.right,t,"Expression"),n(e.body,t,"Statement");},va.ForInit=function(e,t,n){"VariableDeclaration"===e.type?n(e,t):n(e,t,"Expression");},va.DebuggerStatement=xa,va.FunctionDeclaration=function(e,t,n){return n(e,t,"Function")},va.VariableDeclaration=function(e,t,n){for(var r=0,i=e.declarations;r<i.length;r+=1){n(i[r],t);}},va.VariableDeclarator=function(e,t,n){n(e.id,t,"Pattern"),e.init&&n(e.init,t,"Expression");},va.Function=function(e,t,n){e.id&&n(e.id,t,"Pattern");for(var r=0,i=e.params;r<i.length;r+=1){n(i[r],t,"Pattern");}n(e.body,t,e.expression?"Expression":"Statement");},va.Pattern=function(e,t,n){"Identifier"===e.type?n(e,t,"VariablePattern"):"MemberExpression"===e.type?n(e,t,"MemberPattern"):n(e,t);},va.VariablePattern=xa,va.MemberPattern=ya,va.RestElement=function(e,t,n){return n(e.argument,t,"Pattern")},va.ArrayPattern=function(e,t,n){for(var r=0,i=e.elements;r<i.length;r+=1){var s=i[r];s&&n(s,t,"Pattern");}},va.ObjectPattern=function(e,t,n){for(var r=0,i=e.properties;r<i.length;r+=1){var s=i[r];"Property"===s.type?(s.computed&&n(s.key,t,"Expression"),n(s.value,t,"Pattern")):"RestElement"===s.type&&n(s.argument,t,"Pattern");}},va.Expression=ya,va.ThisExpression=va.Super=va.MetaProperty=xa,va.ArrayExpression=function(e,t,n){for(var r=0,i=e.elements;r<i.length;r+=1){var s=i[r];s&&n(s,t,"Expression");}},va.ObjectExpression=function(e,t,n){for(var r=0,i=e.properties;r<i.length;r+=1){n(i[r],t);}},va.FunctionExpression=va.ArrowFunctionExpression=va.FunctionDeclaration,va.SequenceExpression=function(e,t,n){for(var r=0,i=e.expressions;r<i.length;r+=1){n(i[r],t,"Expression");}},va.TemplateLiteral=function(e,t,n){for(var r=0,i=e.quasis;r<i.length;r+=1){n(i[r],t);}for(var s=0,o=e.expressions;s<o.length;s+=1){n(o[s],t,"Expression");}},va.TemplateElement=xa,va.UnaryExpression=va.UpdateExpression=function(e,t,n){n(e.argument,t,"Expression");},va.BinaryExpression=va.LogicalExpression=function(e,t,n){n(e.left,t,"Expression"),n(e.right,t,"Expression");},va.AssignmentExpression=va.AssignmentPattern=function(e,t,n){n(e.left,t,"Pattern"),n(e.right,t,"Expression");},va.ConditionalExpression=function(e,t,n){n(e.test,t,"Expression"),n(e.consequent,t,"Expression"),n(e.alternate,t,"Expression");},va.NewExpression=va.CallExpression=function(e,t,n){if(n(e.callee,t,"Expression"),e.arguments)for(var r=0,i=e.arguments;r<i.length;r+=1){n(i[r],t,"Expression");}},va.MemberExpression=function(e,t,n){n(e.object,t,"Expression"),e.computed&&n(e.property,t,"Expression");},va.ExportNamedDeclaration=va.ExportDefaultDeclaration=function(e,t,n){e.declaration&&n(e.declaration,t,"ExportNamedDeclaration"===e.type||e.declaration.id?"Statement":"Expression"),e.source&&n(e.source,t,"Expression");},va.ExportAllDeclaration=function(e,t,n){n(e.source,t,"Expression");},va.ImportDeclaration=function(e,t,n){for(var r=0,i=e.specifiers;r<i.length;r+=1){n(i[r],t);}n(e.source,t,"Expression");},va.ImportSpecifier=va.ImportDefaultSpecifier=va.ImportNamespaceSpecifier=va.Identifier=va.Literal=xa,va.TaggedTemplateExpression=function(e,t,n){n(e.tag,t,"Expression"),n(e.quasi,t,"Expression");},va.ClassDeclaration=va.ClassExpression=function(e,t,n){return n(e,t,"Class")},va.Class=function(e,t,n){e.id&&n(e.id,t,"Pattern"),e.superClass&&n(e.superClass,t,"Expression"),n(e.body,t);},va.ClassBody=function(e,t,n){for(var r=0,i=e.body;r<i.length;r+=1){n(i[r],t);}},va.MethodDefinition=va.Property=function(e,t,n){e.computed&&n(e.key,t,"Expression"),n(e.value,t,"Expression");};const ba=/[@#]__PURE__/,Aa=e=>ba.test(e.text);let Sa="sourceMa";Sa+="ppingURL";const Ia=new RegExp(`^#\\s+${Sa}=.+\\n?`),wa=()=>{};let Pa=()=>0,ka=()=>0,Ca=()=>0,Na={};const $a=e=>1e3*e[0]+e[1]/1e6;function Ra(e,t){switch(t){case 1:return `# ${e}`;case 2:return `## ${e}`;case 3:return e;default:return `${"  ".repeat(t-4)}- ${e}`}}function Oa(e,t=3){e=Ra(e,t),Na.hasOwnProperty(e)||(Na[e]={memory:0,startMemory:void 0,startTime:void 0,time:0,totalMemory:0});const n=Ca();Na[e].startTime=Pa(),Na[e].startMemory=n;}function Ma(e,t=3){if(e=Ra(e,t),Na.hasOwnProperty(e)){const t=Ca();Na[e].time+=ka(Na[e].startTime),Na[e].totalMemory=Math.max(Na[e].totalMemory,t),Na[e].memory+=t-Na[e].startMemory;}}function Ta(){const e={};return Object.keys(Na).forEach(t=>{e[t]=[Na[t].time,Na[t].memory,Na[t].totalMemory];}),e}let Da=wa,La=wa;const Va={load:!0,ongenerate:!0,onwrite:!0,resolveDynamicImport:!0,resolveId:!0,transform:!0,transformBundle:!0};function Ba(e,t){const n={};for(const r of Object.keys(e))if(!0===Va[r]){let i=`plugin ${t}`;e.name&&(i+=` (${e.name})`),i+=` - ${r}`,n[r]=function(){Da(i,4);const t=e[r].apply(this===n?e:this,arguments);return La(i,4),t&&"function"==typeof t.then&&(Da(`${i} (async)`,4),t.then(()=>La(`${i} (async)`,4))),t};}else n[r]=e[r];return n}function za(e){e.perf?(Na={},"undefined"!=typeof process&&"function"==typeof process.hrtime?(Pa=process.hrtime.bind(process),ka=(e=>$a(process.hrtime(e)))):"undefined"!=typeof performance&&"function"==typeof performance.now&&(Pa=performance.now.bind(performance),ka=(e=>performance.now()-e)),"undefined"!=typeof process&&"function"==typeof process.memoryUsage&&(Ca=(()=>process.memoryUsage().heapUsed)),Da=Oa,La=Ma,e.plugins=e.plugins.map(Ba)):(Da=wa,La=wa);}const ja={ecmaVersion:2019,preserveParens:!1,sourceType:"module"};function Wa(e,t,n,r){t.error({code:"MISSING_EXPORT",message:`'${e}' is not exported by ${bo(n)}`,url:"https://rollupjs.org/guide/en#error-name-is-not-exported-by-module-"},r);}const Ua={identifier:null,localName:Js};class Fa{constructor(e,t,n,r){this.chunkAlias=null,this.comments=[],this.dependencies=[],this.dynamicallyImportedBy=[],this.dynamicDependencies=[],this.dynamicImports=[],this.entryPointsHash=new Uint8Array(10),this.execIndex=1/0,this.exportAllModules=null,this.exportAllSources=[],this.exports=Object.create(null),this.exportsAll=Object.create(null),this.exportShimVariable=new eo(this),this.facadeChunk=null,this.importDescriptions=Object.create(null),this.importMetas=[],this.imports=new Set,this.isExecuted=!1,this.isUserDefinedEntryPoint=!1,this.manualChunkAlias=null,this.reexports=Object.create(null),this.sources=[],this.usesTopLevelAwait=!1,this.namespaceVariable=void 0,this.id=t,this.graph=e,this.excludeFromSourcemap=/\0/.test(t),this.context=e.getModuleContext(t),this.moduleSideEffects=n,this.isEntryPoint=r;}basename(){const e=ct(this.id),t=pt(this.id);return it(t?e.slice(0,-t.length):e)}bindReferences(){this.ast.bind();}error(e,t){if(void 0!==t){e.pos=t;let n=_t(this.code,t,{offsetLine:1});try{n=function(e,t){const n=e.filter(e=>e.mappings);for(;n.length>0;){const e=n.pop(),r=e.mappings[t.line-1];let i=!1;if(void 0!==r)for(const n of r)if(n[0]>=t.column){if(n.length<4)break;t={column:n[3],line:n[2]+1,name:e.names[n[4]],source:e.sources[n[1]]},i=!0;break}if(!i)throw new Error("Can't resolve original location of error.")}return t}(this.sourcemapChain,n);}catch(e){this.warn({code:"SOURCEMAP_ERROR",loc:{column:n.column,file:this.id,line:n.line},message:`Error when using sourcemap for reporting an error: ${e.message}`,pos:t},void 0);}e.loc={column:n.column,file:this.id,line:n.line},e.frame=Eo(this.originalCode,n.line,n.column);}So(e);}getAllExports(){const e=Object.assign(Object.create(null),this.exports,this.reexports);return this.exportAllModules.forEach(t=>{if(t.isExternal)e[`*${t.id}`]=!0;else for(const n of t.getAllExports())"default"!==n&&(e[n]=!0);}),Object.keys(e)}getDynamicImportExpressions(){return this.dynamicImports.map(({node:e})=>{const t=e.parent.arguments[0];if(t instanceof pa){if(0===t.expressions.length&&1===t.quasis.length)return t.quasis[0].value.cooked}else{if(!(t instanceof sa))return t;if("string"==typeof t.value)return t.value}})}getExports(){return Object.keys(this.exports)}getOrCreateNamespace(){return this.namespaceVariable||(this.namespaceVariable=new lo(this.astContext))}getReexports(){if(this.transitiveReexports)return this.transitiveReexports;this.transitiveReexports=[];const e=new Set;for(const t in this.reexports)e.add(t);for(const t of this.exportAllModules)if(t instanceof mt)e.add(`*${t.id}`);else for(const n of t.getExports().concat(t.getReexports()))"default"!==n&&e.add(n);return this.transitiveReexports=Array.from(e)}getRenderedExports(){const e=[],t=[];for(const n in this.exports){const r=this.getVariableForExportName(n);(r&&r.included?e:t).push(n);}return {renderedExports:e,removedExports:t}}getTransitiveDependencies(){return this.dependencies.concat(this.getReexports().map(e=>this.getVariableForExportName(e).module))}getVariableForExportName(e,t){if("*"===e[0]){if(1===e.length)return this.getOrCreateNamespace();return this.graph.moduleById.get(e.slice(1)).getVariableForExportName("*")}const n=this.reexports[e];if(n){const e=n.module.getVariableForExportName(n.localName);return e||Wa(n.localName,this,n.module.id,n.start),e}const r=this.exports[e];if(r){if(r===Ua)return this.exportShimVariable;const e=r.localName;return this.traceVariable(e)||this.graph.scope.findVariable(e)}if("default"!==e)for(let t=0;t<this.exportAllModules.length;t+=1){const n=this.exportAllModules[t].getVariableForExportName(e,!0);if(n)return n}if(this.graph.shimMissingExports&&!t)return this.shimMissingExport(e),this.exportShimVariable}include(){this.ast.shouldBeIncluded()&&this.ast.include(!1);}includeAllExports(){this.isExecuted||(this.graph.needsTreeshakingPass=!0,gt(this));for(const e of this.getExports()){const t=this.getVariableForExportName(e);t.deoptimizePath(be),t.included||(t.include(),this.graph.needsTreeshakingPass=!0);}for(const e of this.getReexports()){const t=this.getVariableForExportName(e);t.isExternal?t.reexported=t.module.reexported=!0:t.included||(t.include(),t.deoptimizePath(be),this.graph.needsTreeshakingPass=!0);}}includeAllInBundle(){this.ast.include(!0);}isIncluded(){return this.ast.included||this.namespaceVariable&&this.namespaceVariable.included}linkDependencies(){for(const e of this.sources){const t=this.resolvedIds[e].id;if(t){const e=this.graph.moduleById.get(t);this.dependencies.push(e);}}for(const{resolution:e}of this.dynamicImports)(e instanceof Fa||e instanceof mt)&&this.dynamicDependencies.push(e);this.addModulesToSpecifiers(this.importDescriptions),this.addModulesToSpecifiers(this.reexports),this.exportAllModules=this.exportAllSources.map(e=>{const t=this.resolvedIds[e].id;return this.graph.moduleById.get(t)});}render(e){const t=this.magicString.clone();return this.ast.render(t,e),this.usesTopLevelAwait=this.astContext.usesTopLevelAwait,t}setSource({ast:e,code:t,customTransformCache:n,moduleSideEffects:r,originalCode:i,originalSourcemap:s,resolvedIds:o,sourcemapChain:a,transformDependencies:h}){var u;this.code=t,this.originalCode=i,this.originalSourcemap=s,this.sourcemapChain=a,this.transformDependencies=h,this.customTransformCache=n,"boolean"==typeof r&&(this.moduleSideEffects=r),Da("generate ast",3),this.esTreeAst=e||function(e,t,n){try{return t.parse(e.code,Object.assign({},ja,n,{onComment:(t,n,r,i)=>e.comments.push({block:t,text:n,start:r,end:i})}))}catch(t){let n=t.message.replace(/ \(\d+:\d+\)$/,"");e.id.endsWith(".json")?n+=" (Note that you need rollup-plugin-json to import JSON files)":e.id.endsWith(".js")||(n+=" (Note that you need plugins to import files that are not JavaScript)"),e.error({code:"PARSE_ERROR",message:n},t.pos);}}(this,this.graph.acornParser,this.graph.acornOptions),u=this.comments,Ea(this.esTreeAst,{commentIndex:0,commentNodes:u.filter(Aa)}),La("generate ast",3),this.resolvedIds=o||Object.create(null);const c=this.id;this.magicString=new G(t,{filename:this.excludeFromSourcemap?null:c,indentExclusionRanges:[]}),this.removeExistingSourceMap(),Da("analyse ast",3),this.astContext={addDynamicImport:this.addDynamicImport.bind(this),addExport:this.addExport.bind(this),addImport:this.addImport.bind(this),addImportMeta:this.addImportMeta.bind(this),annotations:this.graph.treeshake&&this.graph.treeshakingOptions.annotations,code:t,deoptimizationTracker:this.graph.deoptimizationTracker,error:this.error.bind(this),fileName:c,getAssetFileName:this.graph.pluginDriver.getAssetFileName,getChunkFileName:this.graph.moduleLoader.getChunkFileName.bind(this.graph.moduleLoader),getExports:this.getExports.bind(this),getModuleExecIndex:()=>this.execIndex,getModuleName:this.basename.bind(this),getReexports:this.getReexports.bind(this),importDescriptions:this.importDescriptions,includeDynamicImport:this.includeDynamicImport.bind(this),includeVariable:this.includeVariable.bind(this),isCrossChunkImport:e=>e.module.chunk!==this.chunk,magicString:this.magicString,module:this,moduleContext:this.context,nodeConstructors:ga,preserveModules:this.graph.preserveModules,propertyReadSideEffects:!this.graph.treeshake||this.graph.treeshakingOptions.propertyReadSideEffects,traceExport:this.getVariableForExportName.bind(this),traceVariable:this.traceVariable.bind(this),treeshake:this.graph.treeshake,usesTopLevelAwait:!1,warn:this.warn.bind(this)},this.scope=new da(this.graph.scope,this.astContext),this.ast=new la(this.esTreeAst,{type:"Module",context:this.astContext},this.scope),La("analyse ast",3);}toJSON(){return {ast:this.esTreeAst,code:this.code,customTransformCache:this.customTransformCache,dependencies:this.dependencies.map(e=>e.id),id:this.id,moduleSideEffects:this.moduleSideEffects,originalCode:this.originalCode,originalSourcemap:this.originalSourcemap,resolvedIds:this.resolvedIds,sourcemapChain:this.sourcemapChain,transformAssets:this.transformAssets,transformDependencies:this.transformDependencies}}traceVariable(e){if(e in this.scope.variables)return this.scope.variables[e];if(e in this.importDescriptions){const t=this.importDescriptions[e],n=t.module;if(!n.isExternal&&"*"===t.name)return n.getOrCreateNamespace();const r=n.getVariableForExportName(t.name);return r||Wa(t.name,this,n.id,t.start),r}return null}warn(e,t){if(void 0!==t){e.pos=t;const{line:n,column:r}=_t(this.code,t,{offsetLine:1});e.loc={file:this.id,line:n,column:r},e.frame=Eo(this.code,n,r);}e.id=this.id,this.graph.warn(e);}addDynamicImport(e){this.dynamicImports.push({node:e,resolution:void 0});}addExport(e){const t=e.source&&e.source.value;if(t)if(-1===this.sources.indexOf(t)&&this.sources.push(t),e.type===J)this.exportAllSources.push(t);else for(const n of e.specifiers){const e=n.exported.name;(this.exports[e]||this.reexports[e])&&this.error({code:"DUPLICATE_EXPORT",message:`A module cannot have multiple exports with the same name ('${e}')`},n.start),this.reexports[e]={localName:n.local.name,module:null,source:t,start:n.start};}else if(e instanceof Ys)this.exports.default&&this.error({code:"DUPLICATE_EXPORT",message:"A module can only have one default export"},e.start),this.exports.default={identifier:e.variable.getAssignedVariableName(),localName:"default"};else if(e.declaration){const t=e.declaration;if(t.type===ae)for(const e of t.declarations)for(const t of Uo(e.id))this.exports[t]={identifier:null,localName:t};else{const e=t.id.name;this.exports[e]={identifier:null,localName:e};}}else for(const t of e.specifiers){const e=t.local.name,n=t.exported.name;(this.exports[n]||this.reexports[n])&&this.error({code:"DUPLICATE_EXPORT",message:`A module cannot have multiple exports with the same name ('${n}')`},t.start),this.exports[n]={identifier:null,localName:e};}}addImport(e){const t=e.source.value;-1===this.sources.indexOf(t)&&this.sources.push(t);for(const n of e.specifiers){const e=n.local.name;this.importDescriptions[e]&&this.error({code:"DUPLICATE_IMPORT",message:`Duplicated import '${e}'`},n.start);const r=n.type===ne,i=n.type===re,s=r?"default":i?"*":n.imported.name;this.importDescriptions[e]={source:t,start:n.start,name:s,module:null};}}addImportMeta(e){this.importMetas.push(e);}addModulesToSpecifiers(e){for(const t of Object.keys(e)){const n=e[t],r=this.resolvedIds[n.source].id;n.module=this.graph.moduleById.get(r);}}includeDynamicImport(e){const t=this.dynamicImports.find(t=>t.node===e).resolution;t instanceof Fa&&(t.dynamicallyImportedBy.push(this),t.includeAllExports());}includeVariable(e){const t=e.module;e.included||(e.include(),this.graph.needsTreeshakingPass=!0),t&&t!==this&&this.imports.add(e);}removeExistingSourceMap(){for(const e of this.comments)!e.block&&Ia.test(e.text)&&this.magicString.remove(e.start,e.end);}shimMissingExport(e){this.exports[e]||(this.graph.warn({code:"SHIMMED_EXPORT",exporter:bo(this.id),exportName:e,message:`Missing export "${e}" has been shimmed in module ${bo(this.id)}.`}),this.exports[e]=Ua);}}class qa{constructor(e,t){this.isOriginal=!0,this.filename=e,this.content=t;}traceSegment(e,t,n){return {line:e,column:t,name:n,source:this}}}class Ga{constructor(e,t){this.sources=t,this.names=e.names,this.mappings=e.mappings;}traceMappings(){const e=[],t=[],n=[],r=[];for(const i of this.mappings){const s=[];for(const r of i){const i=this.sources[r[1]];if(!i)continue;const o=i.traceSegment(r[2],r[3],this.names[r[4]]);if(o){let i=e.lastIndexOf(o.source.filename);-1===i?(i=e.length,e.push(o.source.filename),t[i]=o.source.content):null==t[i]?t[i]=o.source.content:null!=o.source.content&&t[i]!==o.source.content&&So({message:`Multiple conflicting contents for sourcemap source ${o.source.filename}`});const a=[r[0],i,o.line,o.column];if(o.name){let e=n.indexOf(o.name);-1===e&&(e=n.length,n.push(o.name)),a[4]=e;}s.push(a);}}r.push(s);}return {sources:e,sourcesContent:t,names:n,mappings:r}}traceSegment(e,t,n){const r=this.mappings[e];if(!r)return null;let i=0,s=r.length-1;for(;i<=s;){const e=i+s>>1,o=r[e];if(o[0]===t){const e=this.sources[o[1]];return e?e.traceSegment(o[2],o[3],this.names[o[4]]||n):null}o[0]>t?s=e-1:i=e+1;}return null}}const Ha={amd:Xa,cjs:Xa,es:Ya,iife:Xa,system:Ya,umd:Xa};function Ka(e,t,n,r,i,s,o){const{forbiddenNames:a,formatGlobals:h}=co[i];Object.assign(r,a),Object.assign(r,h),function(e,t){const n=Object.assign({},...t.map(e=>e.scope.accessedOutsideVariables));for(const t of Object.keys(n)){const r=n[t];r.included&&(e[t]=!0);}}(r,e),function(e,t){for(const n of t){const t=n.scope.variables;for(const n of Object.keys(t)){const r=t[n];r.included&&!(r.renderBaseName||r instanceof Qs&&r.getOriginalVariable()!==r)&&r.setRenderNames(null,xe(r.name,e));}const r=n.getOrCreateNamespace();r.included&&r.setRenderNames(null,xe(r.name,e));}}(r,e),Ha[i](r,n,t,s,o);for(const t of e)t.scope.deconflict(a);}function Ya(e,t,n,r){for(const n of t){const t=n.module,i=n.name;let s;s=t instanceof mt&&("*"===i||"default"===i)?"default"===i&&r&&t.exportsNamespace?t.variableName+"__default":t.variableName:i,n.setRenderNames(null,xe(s,e));}}function Xa(e,t,n,r,i){for(const t of n)t.variableName=xe(t.variableName,e);for(const e of t){const t=e.module;if(t instanceof mt){const n=e.name;"default"===n&&r&&(t.exportsNamespace||t.exportsNames)?e.setRenderNames(null,t.variableName+"__default"):"*"===n||"default"===n?e.setRenderNames(null,t.variableName):e.setRenderNames(t.variableName,null);}else{const n=t.chunk;"default"===n.exportMode||i&&e.isNamespace?e.setRenderNames(null,n.variableName):e.setRenderNames(n.variableName,n.getVariableExportName(e));}}}const Qa=(e,t)=>e.execIndex>t.execIndex?1:-1;function Ja(e){e.sort(Qa);}function Za(e,t,n){const r=[bo(e)];let i=t;for(;i!==e&&(r.push(bo(i)),i=n[i]););return r.push(r[0]),r.reverse(),r}function eh(e){const t=e.split("\n"),n=t.filter(e=>/^\t+/.test(e)),r=t.filter(e=>/^ {2,}/.test(e));if(0===n.length&&0===r.length)return null;if(n.length>=r.length)return "\t";const i=r.reduce((e,t)=>{const n=/^ +/.exec(t)[0].length;return Math.min(n,e)},1/0);return new Array(i+1).join(" ")}function th(e,t,n){return Ao(e)||So({code:"INVALID_PATTERN",message:`Invalid output pattern "${e}" for ${t}, cannot be an absolute or relative URL or path.`}),e.replace(/\[(\w+)\]/g,(e,r)=>{const i=n(r);return void 0===i&&So({code:"INVALID_PATTERN_REPLACEMENT",message:`"${r}" is not a valid substitution name in output option ${t} pattern.`}),Ao(i)||So({code:"INVALID_PATTERN_REPLACEMENT",message:`Invalid replacement "${i}" for "${r}" in ${t} pattern, must be a plain path name.`}),i})}function nh(e,t){if(e in t==!1)return e;const n=pt(e);e=e.substr(0,e.length-n.length);let r,i=1;for(;t[r=e+ ++i+n];);return r}function rh(e){return e.replace(/[\0?*]/g,"_")}function ih(e,t,n,r){let i;return "function"==typeof t?i=t(e.id):t&&(i=t[e.id]),i||(r?(n.warn({code:"MISSING_GLOBAL_NAME",guess:e.variableName,message:`No name was provided for external module '${e.id}' in output.globals – guessing '${e.variableName}'`,source:e.id}),e.variableName):void 0)}function sh(e){return !e.isEmpty||e.entryModules.length>0||null!==e.manualChunkAlias}class oh{constructor(e,t){this.entryModules=[],this.exportMode="named",this.facadeModule=null,this.hasDynamicImport=!1,this.id=void 0,this.indentString=void 0,this.manualChunkAlias=null,this.usedModules=void 0,this.dependencies=void 0,this.dynamicDependencies=void 0,this.exportNames=Object.create(null),this.exports=new Set,this.imports=new Set,this.needsExportsShim=!1,this.renderedDeclarations=void 0,this.renderedHash=void 0,this.renderedModuleSources=void 0,this.renderedSource=null,this.renderedSourceLength=void 0,this.sortedExportNames=null,this.graph=e,this.orderedModules=t,this.execIndex=t.length>0?t[0].execIndex:1/0,this.isEmpty=!0;for(const e of t)this.isEmpty&&e.isIncluded()&&(this.isEmpty=!1),e.manualChunkAlias&&(this.manualChunkAlias=e.manualChunkAlias),e.chunk=this,(e.isEntryPoint||e.dynamicallyImportedBy.some(e=>-1===t.indexOf(e)))&&this.entryModules.push(e);const n=this.entryModules[0];this.variableName=n?it(ct(n.chunkAlias||n.manualChunkAlias||_o(n.id))):"__chunk_"+ ++e.curChunkIndex;}generateEntryExportsOrMarkAsTainted(){const e=this.entryModules.map(e=>({map:this.getVariableExportNamesForModule(e),module:e}));for(const{map:t}of e)for(const e of t.keys())this.exports.add(e);e:for(const{map:t,module:n}of e){if(!this.graph.preserveModules){if(this.manualChunkAlias&&n.chunkAlias&&this.manualChunkAlias!==n.chunkAlias)continue e;for(const e of this.exports)if(!t.has(e))continue e}this.facadeModule=n;for(const[e,n]of t)for(const t of n)this.exportNames[t]=e;return}}generateId(e,t,n,r,i){this.id=nh(th(e,t,e=>{switch(e){case"format":return "es"===r.format?"esm":r.format;case"hash":return this.computeContentHashWithDependencies(n,r);case"name":return this.getChunkName()}}),i);}generateIdPreserveModules(e,t){const n=rh(this.orderedModules[0].id);this.id=nh(ut(at(this.orderedModules[0].id)?dt(e,n):"_virtual/"+ct(n)),t);}generateInternalExports(e){if(null!==this.facadeModule)return;const t="system"===e.format||"es"===e.format||e.compact;let n,r=0;if(this.exportNames=Object.create(null),this.sortedExportNames=null,t)for(const e of this.exports){do{49===(n=ye(++r)).charCodeAt(0)&&(n=ye(r+=9*Math.pow(64,n.length-1)));}while(ao[n]);this.exportNames[n]=e;}else for(const e of this.exports){for(r=0,n=e.name;this.exportNames[n];)n=e.name+"$"+ ++r;this.exportNames[n]=e;}}getChunkName(){return this.chunkName||(this.chunkName=this.computeChunkName())}getDynamicImportIds(){return this.dynamicDependencies.map(e=>e.id).filter(Boolean)}getExportNames(){return this.sortedExportNames||(this.sortedExportNames=Object.keys(this.exportNames).sort())}getImportIds(){return this.dependencies.map(e=>e.id)}getRenderedHash(){if(this.renderedHash)return this.renderedHash;if(!this.renderedSource)return "";const e=C();return e.update(this.renderedSource.toString()),e.update(this.getExportNames().map(e=>{const t=this.exportNames[e];return `${bo(t.module.id).replace(/\\/g,"/")}:${t.name}:${e}`}).join(",")),this.renderedHash=e.digest("hex")}getRenderedSourceLength(){return void 0!==this.renderedSourceLength?this.renderedSourceLength:this.renderedSourceLength=this.renderedSource.length()}getVariableExportName(e){if(this.graph.preserveModules&&e instanceof lo)return "*";for(const t of Object.keys(this.exportNames))if(this.exportNames[t]===e)return t}link(){const e=new Set,t=new Set;for(const n of this.orderedModules)this.addChunksFromDependencies(n.getTransitiveDependencies(),e),this.addChunksFromDependencies(n.dynamicDependencies,t),this.setUpModuleImports(n);this.dependencies=Array.from(e),this.dynamicDependencies=Array.from(t);}merge(e,t,n,r){if(null!==this.facadeModule||null!==e.facadeModule)throw new Error("Internal error: Code splitting chunk merges not supported for facades");for(const t of e.orderedModules)t.chunk=this,this.orderedModules.push(t);for(const t of e.imports)this.imports.has(t)||t.module.chunk===this||this.imports.add(t);for(const t of e.exports)this.exports.has(t)||this.exports.add(t);const i=this.exportNames;this.generateInternalExports(n);const s=(e,t)=>{if(e.imports)for(const n of e.imports)n.imported=this.getVariableExportName(t[n.imported]);if(e.reexports)for(const n of e.reexports)n.imported=this.getVariableExportName(t[n.imported]);},o=(e,t)=>{t.imports&&(e.imports?e.imports=e.imports.concat(t.imports):e.imports=t.imports),t.reexports&&(e.reexports?e.reexports=e.reexports.concat(t.reexports):e.reexports=t.reexports),!e.exportsNames&&t.exportsNames&&(e.exportsNames=!0),!e.exportsDefault&&t.exportsDefault&&(e.exportsDefault=!0),e.name=this.variableName;};for(const n of t){let t=void 0;for(let r=0;r<n.dependencies.length;r++){const a=n.dependencies[r];if(a!==e&&a!==this||!t)a===e?(n.dependencies[r]=this,s(t=n.renderedDeclarations.dependencies[r],e.exportNames)):a===this&&s(t=n.renderedDeclarations.dependencies[r],i);else{const h=n.renderedDeclarations.dependencies[r];s(h,a===e?e.exportNames:i),o(t,h),n.renderedDeclarations.dependencies.splice(r,1),n.dependencies.splice(r--,1);}}}this.preRender(n,r);}preRender(e,t){Da("render modules",3);const n=new K({separator:e.compact?"":"\n\n"});this.usedModules=[],this.indentString=e.compact?"":function(e,t){if(!0!==t.indent)return t.indent||"";for(let t=0;t<e.length;t++){const n=eh(e[t].originalCode);if(null!==n)return n}return "\t"}(this.orderedModules,e);const r=e.compact?"":"\n",i=e.compact?"":" ",s={compact:e.compact,dynamicImportFunction:e.dynamicImportFunction,format:e.format,freeze:!1!==e.freeze,indent:this.indentString,namespaceToStringTag:!0===e.namespaceToStringTag,varOrConst:e.preferConst?"const":"var"};for(const{module:e}of this.imports){const t=e instanceof Fa?e.chunk:e;-1===this.dependencies.indexOf(t)&&this.dependencies.push(t);}if(!this.graph.preserveModules&&null!==this.facadeModule)for(const e of this.dependencies)e instanceof oh&&this.inlineChunkDependencies(e,!0);for(let e=0;e<this.dependencies.length;e++){const t=this.dependencies[e];t instanceof oh&&t.isEmpty&&(this.dependencies.splice(e--,1),this.inlineChunkDependencies(t,!1));}Ja(this.dependencies),this.setIdentifierRenderResolutions(e),this.prepareDynamicImports();let o="";this.renderedModules=Object.create(null),this.renderedModuleSources=[];for(let t=0;t<this.orderedModules.length;t++){const i=this.orderedModules[t],a=i.render(s);a.trim(),e.compact&&-1!==a.lastLine().indexOf("//")&&a.append("\n"),this.renderedModuleSources.push(a);const{renderedExports:h,removedExports:u}=i.getRenderedExports();this.renderedModules[i.id]={originalLength:i.originalCode.length,removedExports:u,renderedExports:h,renderedLength:a.length()};const c=i.getOrCreateNamespace();if((c.included||!a.isEmpty())&&(n.addSource(a),this.usedModules.push(i),c.included&&!this.graph.preserveModules)){const e=c.renderBlock(s);c.renderFirst()?o+=r+e:n.addSource(new G(e));}}o&&n.prepend(o+r+r),this.needsExportsShim&&n.prepend(`${r}${s.varOrConst} ${Js}${i}=${i}void 0;${r}${r}`),e.compact?this.renderedSource=n:this.renderedSource=n.trim(),this.renderedSourceLength=void 0,this.renderedHash=void 0,0===this.getExportNames().length&&0===this.getImportIds().length&&this.isEmpty&&this.graph.warn({code:"EMPTY_BUNDLE",message:"Generated an empty bundle"}),this.setExternalRenderPaths(e,t),this.renderedDeclarations={dependencies:this.getChunkDependencyDeclarations(e),exports:"none"===this.exportMode?[]:this.getChunkExportDeclarations()},La("render modules",3);}render(e,t,n){if(Da("render format",3),!this.renderedSource)throw new Error("Internal error: Chunk render called before preRender");const r=jo[e.format];r||So({code:"INVALID_OPTION",message:`Invalid format: ${e.format} - valid options are ${Object.keys(jo).join(", ")}.`}),e.dynamicImportFunction&&"es"!==e.format&&this.graph.warn({code:"INVALID_OPTION",message:'"output.dynamicImportFunction" is ignored for formats other than "esm".'});for(let e=0;e<this.dependencies.length;e++){const t=this.dependencies[e];if(t instanceof mt&&!t.renormalizeRenderPath)continue;const n=this.renderedDeclarations.dependencies[e],r=t instanceof mt?n.id:t.id;let i=this.id?ut(dt(lt(this.id),r)):r;i.startsWith("../")||(i="./"+i),t instanceof oh&&(n.namedExportsMode="default"!==t.exportMode),n.id=i;}this.finaliseDynamicImports(e.format);const i=this.finaliseImportMetas(e),s=0!==this.renderedDeclarations.exports.length||this.renderedDeclarations.dependencies.some(e=>e.reexports&&0!==e.reexports.length),o=this.orderedModules.some(e=>e.usesTopLevelAwait);o&&"es"!==e.format&&"system"!==e.format&&So({code:"INVALID_TLA_FORMAT",message:`Module format ${e.format} does not support top-level await. Use the "es" or "system" output formats rather.`});const a=r(this.renderedSource,{dependencies:this.renderedDeclarations.dependencies,dynamicImport:this.hasDynamicImport,exports:this.renderedDeclarations.exports,hasExports:s,indentString:this.indentString,intro:t.intro,isEntryModuleFacade:null!==this.facadeModule&&this.facadeModule.isEntryPoint,namedExportsMode:"default"!==this.exportMode,needsAmdModule:i,outro:t.outro,usesTopLevelAwait:o,varOrConst:e.preferConst?"const":"var",warn:this.graph.warn.bind(this.graph)},e);t.banner&&a.prepend(t.banner),t.footer&&a.append(t.footer);const h=a.toString();La("render format",3);let u=null;const c=[];return function({graph:e,chunk:t,renderChunk:n,code:r,sourcemapChain:i,options:s}){const o=(e,t,n)=>{if(null==t)return e;"string"==typeof t&&(t={code:t,map:void 0});const r="string"==typeof t.map?JSON.parse(t.map):t.map;return r&&"string"==typeof r.mappings&&(r.mappings=O(r.mappings)),null!==r&&i.push(r||{missing:!0,plugin:n.name}),t.code};let a=!1,h=!0;return e.pluginDriver.hookReduceArg0("renderChunk",[r,n,s],o).then(n=>(h=!1,e.pluginDriver.hookReduceArg0("transformChunk",[n,s,t],o))).then(n=>(a=!0,e.pluginDriver.hookReduceArg0("transformBundle",[n,s,t],o))).catch(e=>{if(h)throw e;So(e,{code:a?"BAD_BUNDLE_TRANSFORMER":"BAD_CHUNK_TRANSFORMER",message:`Error transforming ${(a?"bundle":"chunk")+(e.plugin?` with '${e.plugin}' plugin`:"")}: ${e.message}`,plugin:e.plugin});})}({chunk:this,code:h,graph:this.graph,options:e,renderChunk:n,sourcemapChain:c}).then(t=>{if(e.sourcemap){let t;if(Da("sourcemap",3),t=e.file?ft(e.sourcemapFile||e.file):e.dir?ft(e.dir,this.id):ft(this.id),this.graph.pluginDriver.hasLoadersOrTransforms){const n=a.generateDecodedMap({});u=function(e,t,n,r,i,s){function o(t,n){return n.missing&&(e.graph.warn({code:"SOURCEMAP_BROKEN",message:`Sourcemap is likely to be incorrect: a plugin${n.plugin?` ('${n.plugin}')`:""} was used to transform files, but didn't generate a sourcemap for the transformation. Consult the plugin documentation for help`,plugin:n.plugin,url:"https://rollupjs.org/guide/en#warning-sourcemap-is-likely-to-be-incorrect"}),n={mappings:"",names:[]}),new Ga(n,[t])}const a=r.filter(e=>!e.excludeFromSourcemap).map(e=>{let t,n=e.sourcemapChain;const r=e.originalSourcemap;if(r){const i=r.sources,s=r.sourcesContent||[];if(null==i||i.length<=1&&null==i[0])t=new qa(e.id,s[0]),n=[r].concat(n);else{const n=lt(e.id)||".",o=r.sourceRoot||".",a=i.map((e,t)=>new qa(ft(n,o,e),s[t]));t=new Ga(r,a);}}else t=new qa(e.id,e.originalCode);return t=n.reduce(o,t)});let h=new Ga(n,a);h=i.reduce(o,h);let{sources:u,sourcesContent:c,names:l,mappings:p}=h.traceMappings();if(t){const e=lt(t);u=u.map(t=>dt(e,t)),t=ct(t);}return new L({file:t,sources:u,sourcesContent:c=s?null:c,names:l,mappings:p})}(this,t,n,this.usedModules,c,e.sourcemapExcludeSources);}else u=a.generateMap({file:t,includeContent:!e.sourcemapExcludeSources});u.sources=u.sources.map(t=>ut(e.sourcemapPathTransform?e.sourcemapPathTransform(t):t)),La("sourcemap",3);}return !0!==e.compact&&"\n"!==t[t.length-1]&&(t+="\n"),{code:t,map:u}})}turnIntoFacade(e){this.dependencies=[e.chunk],this.dynamicDependencies=[],this.facadeModule=e,e.facadeChunk=this;for(const t of e.getAllExports()){const n=e.getVariableForExportName(t);this.exports.add(n),this.exportNames[t]=n;}}visitDependencies(e){const t=[this],n=new Set;for(const r of t)if(e(r),!(r instanceof mt))for(const e of r.dependencies.concat(r.dynamicDependencies))n.has(e)||(n.add(e),t.push(e));}visitStaticDependenciesUntilCondition(e){const t=new Set;return function n(r){if(!t.has(r)){if(t.add(r),r instanceof oh)for(const e of r.dependencies)if(n(e))return !0;return !0===e(r)}}(this)}addChunksFromDependencies(e,t){for(const n of e){if(n.chunk===this)continue;let e;if(n instanceof Fa)e=n.chunk;else{if(!n.used&&!n.moduleSideEffects)continue;e=n;}t.add(e);}}computeChunkName(){if(this.manualChunkAlias)return rh(this.manualChunkAlias);if(null!==this.facadeModule)return rh(this.facadeModule.chunkAlias||_o(this.facadeModule.id));for(const e of this.orderedModules)if(e.chunkAlias)return rh(e.chunkAlias);return "chunk"}computeContentHashWithDependencies(e,t){const n=C();return n.update([e.intro,e.outro,e.banner,e.footer].map(e=>e||"").join(":")),n.update(t.format),this.visitDependencies(e=>{e instanceof mt?n.update(":"+e.renderPath):n.update(e.getRenderedHash());}),n.digest("hex").substr(0,8)}finaliseDynamicImports(e){for(let t=0;t<this.orderedModules.length;t++){const n=this.orderedModules[t],r=this.renderedModuleSources[t];for(const{node:t,resolution:i}of n.dynamicImports)if(i)if(i instanceof Fa){if(i.chunk!==this&&sh(i.chunk)){const n=i.facadeChunk||i.chunk;let s=ut(dt(lt(this.id),n.id));s.startsWith("../")||(s="./"+s),t.renderFinalResolution(r,`'${s}'`,e);}}else if(i instanceof mt){let n=i.id;i.renormalizeRenderPath&&((n=ut(dt(lt(this.id),i.renderPath))).startsWith("../")||(n="./"+n)),t.renderFinalResolution(r,`'${n}'`,e);}else t.renderFinalResolution(r,i,e);}}finaliseImportMetas(e){let t=!1;for(let n=0;n<this.orderedModules.length;n++){const r=this.orderedModules[n],i=this.renderedModuleSources[n];for(const n of r.importMetas)n.renderFinalMechanism(i,this.id,e.format,this.graph.pluginDriver)&&(t=!0);}return t}getChunkDependencyDeclarations(e){const t=new Map;for(let e of this.getExportNames()){let n,r,i=!1;if("*"===e[0])n=this.graph.moduleById.get(e.substr(1)),r=e="*";else{const t=this.exportNames[e],s=t.module;if(!s||s.chunk===this)continue;s instanceof Fa?(n=s.chunk,r=s.chunk.getVariableExportName(t),i=t.isReassigned):(n=s,r=t.name,i=!0);}let s=t.get(n);s||t.set(n,s=[]),s.push({imported:r,reexported:e,needsLiveBinding:i});}const n=new Set,r=[];for(const i of this.dependencies){const s=[];for(const e of this.imports){const t=e instanceof Qs?e.getOriginalVariable():e;if((e.module instanceof Fa?e.module.chunk===i:e.module===i)&&!n.has(t)){n.add(t);const r=e.getName(),i=e.module instanceof mt?e.name:e.module.chunk.getVariableExportName(e);s.push({local:r,imported:i});}}const o=t.get(i);let a,h,u=!0;i instanceof mt?(a=i.exportsNames||i.exportsNamespace,h="default"in i.declarations):(a=!0,h=!1,u="default"!==i.exportMode);let c=void 0,l=void 0;i instanceof mt&&(c=i.renderPath,"umd"!==e.format&&"iife"!==e.format||(l=ih(i,e.globals,this.graph,a||h))),r.push({exportsDefault:h,exportsNames:a,globalName:l,id:c,imports:s.length>0?s:null,isChunk:!i.isExternal,name:i.variableName,namedExportsMode:u,reexports:o});}return r}getChunkExportDeclarations(){const e=[];for(const t of this.getExportNames()){if("*"===t[0])continue;const n=this.exportNames[t],r=n.module;if(r&&r.chunk!==this)continue;let i=!1,s=!1;if(n instanceof xt){n.init===we&&(s=!0);for(const e of n.declarations)if(e.parent instanceof Hs||e instanceof Ys&&e.declaration instanceof Hs){i=!0;break}}else n instanceof oo&&(i=!0);const o=n.getName();e.push({exported:"*"===t?o:t,hoisted:i,local:o,uninitialized:s});}return e}getVariableExportNamesForModule(e){const t=new Map;for(const n of e.getAllExports()){const r=e.getVariableForExportName(n);if(!r||!r.included&&!r.isExternal)continue;const i=t.get(r);i?i.push(n):t.set(r,[n]);const s=r.module;s&&s.chunk&&s.chunk!==this&&s.chunk.exports.add(r);}return t}inlineChunkDependencies(e,t){for(const n of e.dependencies)if(n instanceof mt)-1===this.dependencies.indexOf(n)&&this.dependencies.push(n);else{if(n===this||-1!==this.dependencies.indexOf(n))continue;n.isEmpty||this.dependencies.push(n),t&&this.inlineChunkDependencies(n,!0);}}prepareDynamicImports(){for(const e of this.orderedModules)for(const{node:t,resolution:n}of e.dynamicImports)if(n)if(n instanceof Fa)if(n.chunk===this){const e=n.getOrCreateNamespace();t.setResolution(!1,e.getName());}else t.setResolution(!1);else t.setResolution(!1);}setExternalRenderPaths(e,t){for(const n of this.dependencies.concat(this.dynamicDependencies))n instanceof mt&&n.setRenderPath(e,t);}setIdentifierRenderResolutions(e){for(const t of this.getExportNames()){const n=this.exportNames[t];n&&(n instanceof eo&&(this.needsExportsShim=!0),n.exportName=t,"es"===e.format||"system"===e.format||!n.isReassigned||n.isId||n instanceof Qs&&n.hasId?n.setRenderNames(null,null):n.setRenderNames("exports",t));}const t=Object.create(null);this.needsExportsShim&&(t[Js]=!0),Ka(this.orderedModules,this.dependencies,this.imports,t,e.format,!1!==e.interop,this.graph.preserveModules);}setUpModuleImports(e){for(const t of e.imports)t.module.chunk!==this&&(this.imports.add(t),t.module instanceof Fa&&t.module.chunk.exports.add(t));if(e.getOrCreateNamespace().included)for(const t of Object.keys(e.reexports)){const n=e.reexports[t],r=n.module.getVariableForExportName(n.localName);r.module.chunk!==this&&(this.imports.add(r),r.module instanceof Fa&&r.module.chunk.exports.add(r));}for(const{node:t,resolution:n}of e.dynamicImports)t.included&&(this.hasDynamicImport=!0,n instanceof Fa&&n.chunk===this&&n.getOrCreateNamespace().include());}}var ah={3:"abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",5:"class enum extends super const export import",6:"enum",strict:"implements interface let package private protected public static yield",strictBind:"eval arguments"},hh="break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this",uh={5:hh,6:hh+" const class extends export import super"},ch=/^in(stanceof)?$/,lh="ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙՠ-ֈא-תׯ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࡠ-ࡪࢠ-ࢴࢶ-ࢽऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱৼਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚౠౡಀಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൔ-ൖൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡸᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᲀ-ᲈᲐ-ᲺᲽ-Ჿᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄯㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿯ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞹꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꣾꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭥꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ",ph="‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߽߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛࣓-ࣣ࣡-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯৾ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ૺ-૿ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఄా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഀ-ഃ഻഼ാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ංඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ູົຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭ᳲ-᳴᳷-᳹᷀-᷹᷻-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-ꣅ꣐-꣙꣠-꣱ꣿ-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︯︳︴﹍-﹏０-９＿",dh=new RegExp("["+lh+"]"),fh=new RegExp("["+lh+ph+"]");lh=ph=null;var mh=[0,11,2,25,2,18,2,1,2,14,3,13,35,122,70,52,268,28,4,48,48,31,14,29,6,37,11,29,3,35,5,7,2,4,43,157,19,35,5,35,5,39,9,51,157,310,10,21,11,7,153,5,3,0,2,43,2,1,4,0,3,22,11,22,10,30,66,18,2,1,11,21,11,25,71,55,7,1,65,0,16,3,2,2,2,28,43,28,4,28,36,7,2,27,28,53,11,21,11,18,14,17,111,72,56,50,14,50,14,35,477,28,11,0,9,21,190,52,76,44,33,24,27,35,30,0,12,34,4,0,13,47,15,3,22,0,2,0,36,17,2,24,85,6,2,0,2,3,2,14,2,9,8,46,39,7,3,1,3,21,2,6,2,1,2,4,4,0,19,0,13,4,159,52,19,3,54,47,21,1,2,0,185,46,42,3,37,47,21,0,60,42,86,26,230,43,117,63,32,0,257,0,11,39,8,0,22,0,12,39,3,3,20,0,35,56,264,8,2,36,18,0,50,29,113,6,2,1,2,37,22,0,26,5,2,1,2,31,15,0,328,18,270,921,103,110,18,195,2749,1070,4050,582,8634,568,8,30,114,29,19,47,17,3,32,20,6,18,689,63,129,68,12,0,67,12,65,1,31,6129,15,754,9486,286,82,395,2309,106,6,12,4,8,8,9,5991,84,2,70,2,1,3,0,3,1,3,3,2,11,2,0,2,6,2,64,2,3,3,7,2,6,2,27,2,3,2,4,2,0,4,6,2,339,3,24,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,7,4149,196,60,67,1213,3,2,26,2,1,2,0,3,0,2,9,2,3,2,0,2,0,7,0,5,0,2,0,2,0,2,2,2,1,2,0,3,0,2,0,2,0,2,0,2,0,2,1,2,0,3,3,2,6,2,3,2,3,2,0,2,9,2,16,6,2,2,4,2,16,4421,42710,42,4148,12,221,3,5761,15,7472,3104,541],gh=[509,0,227,0,150,4,294,9,1368,2,2,1,6,3,41,2,5,0,166,1,574,3,9,9,525,10,176,2,54,14,32,9,16,3,46,10,54,9,7,2,37,13,2,9,6,1,45,0,13,2,49,13,9,3,4,9,83,11,7,0,161,11,6,9,7,3,56,1,2,6,3,1,3,2,10,0,11,1,3,6,4,4,193,17,10,9,5,0,82,19,13,9,214,6,3,8,28,1,83,16,16,9,82,12,9,9,84,14,5,9,243,14,166,9,280,9,41,6,2,3,9,0,10,10,47,15,406,7,2,7,17,9,57,21,2,13,123,5,4,0,2,1,2,6,2,0,9,9,49,4,2,1,2,4,9,9,330,3,19306,9,135,4,60,6,26,9,1016,45,17,3,19723,1,5319,4,4,5,9,7,3,6,31,3,149,2,1418,49,513,54,5,49,9,0,15,0,23,4,2,14,1361,6,2,16,3,6,2,1,2,4,2214,6,110,6,6,9,792487,239];function yh(e,t){for(var n=65536,r=0;r<t.length;r+=2){if((n+=t[r])>e)return !1;if((n+=t[r+1])>=e)return !0}}function xh(e,t){return e<65?36===e:e<91||(e<97?95===e:e<123||(e<=65535?e>=170&&dh.test(String.fromCharCode(e)):!1!==t&&yh(e,mh)))}function vh(e,t){return e<48?36===e:e<58||!(e<65)&&(e<91||(e<97?95===e:e<123||(e<=65535?e>=170&&fh.test(String.fromCharCode(e)):!1!==t&&(yh(e,mh)||yh(e,gh)))))}var Eh=function(e,t){void 0===t&&(t={}),this.label=e,this.keyword=t.keyword,this.beforeExpr=!!t.beforeExpr,this.startsExpr=!!t.startsExpr,this.isLoop=!!t.isLoop,this.isAssign=!!t.isAssign,this.prefix=!!t.prefix,this.postfix=!!t.postfix,this.binop=t.binop||null,this.updateContext=null;};function _h(e,t){return new Eh(e,{beforeExpr:!0,binop:t})}var bh={beforeExpr:!0},Ah={startsExpr:!0},Sh={};function Ih(e,t){return void 0===t&&(t={}),t.keyword=e,Sh[e]=new Eh(e,t)}var wh={num:new Eh("num",Ah),regexp:new Eh("regexp",Ah),string:new Eh("string",Ah),name:new Eh("name",Ah),eof:new Eh("eof"),bracketL:new Eh("[",{beforeExpr:!0,startsExpr:!0}),bracketR:new Eh("]"),braceL:new Eh("{",{beforeExpr:!0,startsExpr:!0}),braceR:new Eh("}"),parenL:new Eh("(",{beforeExpr:!0,startsExpr:!0}),parenR:new Eh(")"),comma:new Eh(",",bh),semi:new Eh(";",bh),colon:new Eh(":",bh),dot:new Eh("."),question:new Eh("?",bh),arrow:new Eh("=>",bh),template:new Eh("template"),invalidTemplate:new Eh("invalidTemplate"),ellipsis:new Eh("...",bh),backQuote:new Eh("`",Ah),dollarBraceL:new Eh("${",{beforeExpr:!0,startsExpr:!0}),eq:new Eh("=",{beforeExpr:!0,isAssign:!0}),assign:new Eh("_=",{beforeExpr:!0,isAssign:!0}),incDec:new Eh("++/--",{prefix:!0,postfix:!0,startsExpr:!0}),prefix:new Eh("!/~",{beforeExpr:!0,prefix:!0,startsExpr:!0}),logicalOR:_h("||",1),logicalAND:_h("&&",2),bitwiseOR:_h("|",3),bitwiseXOR:_h("^",4),bitwiseAND:_h("&",5),equality:_h("==/!=/===/!==",6),relational:_h("</>/<=/>=",7),bitShift:_h("<</>>/>>>",8),plusMin:new Eh("+/-",{beforeExpr:!0,binop:9,prefix:!0,startsExpr:!0}),modulo:_h("%",10),star:_h("*",10),slash:_h("/",10),starstar:new Eh("**",{beforeExpr:!0}),_break:Ih("break"),_case:Ih("case",bh),_catch:Ih("catch"),_continue:Ih("continue"),_debugger:Ih("debugger"),_default:Ih("default",bh),_do:Ih("do",{isLoop:!0,beforeExpr:!0}),_else:Ih("else",bh),_finally:Ih("finally"),_for:Ih("for",{isLoop:!0}),_function:Ih("function",Ah),_if:Ih("if"),_return:Ih("return",bh),_switch:Ih("switch"),_throw:Ih("throw",bh),_try:Ih("try"),_var:Ih("var"),_const:Ih("const"),_while:Ih("while",{isLoop:!0}),_with:Ih("with"),_new:Ih("new",{beforeExpr:!0,startsExpr:!0}),_this:Ih("this",Ah),_super:Ih("super",Ah),_class:Ih("class",Ah),_extends:Ih("extends",bh),_export:Ih("export"),_import:Ih("import"),_null:Ih("null",Ah),_true:Ih("true",Ah),_false:Ih("false",Ah),_in:Ih("in",{beforeExpr:!0,binop:7}),_instanceof:Ih("instanceof",{beforeExpr:!0,binop:7}),_typeof:Ih("typeof",{beforeExpr:!0,prefix:!0,startsExpr:!0}),_void:Ih("void",{beforeExpr:!0,prefix:!0,startsExpr:!0}),_delete:Ih("delete",{beforeExpr:!0,prefix:!0,startsExpr:!0})},Ph=/\r\n?|\n|\u2028|\u2029/,kh=new RegExp(Ph.source,"g");function Ch(e,t){return 10===e||13===e||!t&&(8232===e||8233===e)}var Nh=/[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/,$h=/(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g,Rh=Object.prototype,Oh=Rh.hasOwnProperty,Mh=Rh.toString;function Th(e,t){return Oh.call(e,t)}var Dh=Array.isArray||function(e){return "[object Array]"===Mh.call(e)};function Lh(e){return new RegExp("^(?:"+e.replace(/ /g,"|")+")$")}var Vh=function(e,t){this.line=e,this.column=t;};Vh.prototype.offset=function(e){return new Vh(this.line,this.column+e)};var Bh=function(e,t,n){this.start=t,this.end=n,null!==e.sourceFile&&(this.source=e.sourceFile);};function zh(e,t){for(var n=1,r=0;;){kh.lastIndex=r;var i=kh.exec(e);if(!(i&&i.index<t))return new Vh(n,t-r);++n,r=i.index+i[0].length;}}var jh={ecmaVersion:9,sourceType:"script",onInsertedSemicolon:null,onTrailingComma:null,allowReserved:null,allowReturnOutsideFunction:!1,allowImportExportEverywhere:!1,allowAwaitOutsideFunction:!1,allowHashBang:!1,locations:!1,onToken:null,onComment:null,ranges:!1,program:null,sourceFile:null,directSourceFile:null,preserveParens:!1};function Wh(e){var t={};for(var n in jh)t[n]=e&&Th(e,n)?e[n]:jh[n];if(t.ecmaVersion>=2015&&(t.ecmaVersion-=2009),null==t.allowReserved&&(t.allowReserved=t.ecmaVersion<5),Dh(t.onToken)){var r=t.onToken;t.onToken=function(e){return r.push(e)};}return Dh(t.onComment)&&(t.onComment=function(e,t){return function(n,r,i,s,o,a){var h={type:n?"Block":"Line",value:r,start:i,end:s};e.locations&&(h.loc=new Bh(this,o,a)),e.ranges&&(h.range=[i,s]),t.push(h);}}(t,t.onComment)),t}var Uh=2,Fh=1|Uh,qh=4,Gh=8;function Hh(e,t){return Uh|(e?qh:0)|(t?Gh:0)}var Kh=function(e,t,n){this.options=e=Wh(e),this.sourceFile=e.sourceFile,this.keywords=Lh(uh[e.ecmaVersion>=6?6:5]);var r="";if(!e.allowReserved){for(var i=e.ecmaVersion;!(r=ah[i]);i--);"module"===e.sourceType&&(r+=" await");}this.reservedWords=Lh(r);var s=(r?r+" ":"")+ah.strict;this.reservedWordsStrict=Lh(s),this.reservedWordsStrictBind=Lh(s+" "+ah.strictBind),this.input=String(t),this.containsEsc=!1,n?(this.pos=n,this.lineStart=this.input.lastIndexOf("\n",n-1)+1,this.curLine=this.input.slice(0,this.lineStart).split(Ph).length):(this.pos=this.lineStart=0,this.curLine=1),this.type=wh.eof,this.value=null,this.start=this.end=this.pos,this.startLoc=this.endLoc=this.curPosition(),this.lastTokEndLoc=this.lastTokStartLoc=null,this.lastTokStart=this.lastTokEnd=this.pos,this.context=this.initialContext(),this.exprAllowed=!0,this.inModule="module"===e.sourceType,this.strict=this.inModule||this.strictDirective(this.pos),this.potentialArrowAt=-1,this.yieldPos=this.awaitPos=this.awaitIdentPos=0,this.labels=[],this.undefinedExports={},0===this.pos&&e.allowHashBang&&"#!"===this.input.slice(0,2)&&this.skipLineComment(2),this.scopeStack=[],this.enterScope(1),this.regexpState=null;},Yh={inFunction:{configurable:!0},inGenerator:{configurable:!0},inAsync:{configurable:!0},allowSuper:{configurable:!0},allowDirectSuper:{configurable:!0},treatFunctionsAsVar:{configurable:!0}};Kh.prototype.parse=function(){var e=this.options.program||this.startNode();return this.nextToken(),this.parseTopLevel(e)},Yh.inFunction.get=function(){return (this.currentVarScope().flags&Uh)>0},Yh.inGenerator.get=function(){return (this.currentVarScope().flags&Gh)>0},Yh.inAsync.get=function(){return (this.currentVarScope().flags&qh)>0},Yh.allowSuper.get=function(){return (64&this.currentThisScope().flags)>0},Yh.allowDirectSuper.get=function(){return (128&this.currentThisScope().flags)>0},Yh.treatFunctionsAsVar.get=function(){return this.treatFunctionsAsVarInScope(this.currentScope())},Kh.prototype.inNonArrowFunction=function(){return (this.currentThisScope().flags&Uh)>0},Kh.extend=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];for(var n=this,r=0;r<e.length;r++)n=e[r](n);return n},Kh.parse=function(e,t){return new this(t,e).parse()},Kh.parseExpressionAt=function(e,t,n){var r=new this(n,e,t);return r.nextToken(),r.parseExpression()},Kh.tokenizer=function(e,t){return new this(t,e)},Object.defineProperties(Kh.prototype,Yh);var Xh=Kh.prototype,Qh=/^(?:'((?:\\.|[^'])*?)'|"((?:\\.|[^"])*?)")/;function Jh(){this.shorthandAssign=this.trailingComma=this.parenthesizedAssign=this.parenthesizedBind=this.doubleProto=-1;}Xh.strictDirective=function(e){for(;;){$h.lastIndex=e,e+=$h.exec(this.input)[0].length;var t=Qh.exec(this.input.slice(e));if(!t)return !1;if("use strict"===(t[1]||t[2]))return !0;e+=t[0].length,$h.lastIndex=e,e+=$h.exec(this.input)[0].length,";"===this.input[e]&&e++;}},Xh.eat=function(e){return this.type===e&&(this.next(),!0)},Xh.isContextual=function(e){return this.type===wh.name&&this.value===e&&!this.containsEsc},Xh.eatContextual=function(e){return !!this.isContextual(e)&&(this.next(),!0)},Xh.expectContextual=function(e){this.eatContextual(e)||this.unexpected();},Xh.canInsertSemicolon=function(){return this.type===wh.eof||this.type===wh.braceR||Ph.test(this.input.slice(this.lastTokEnd,this.start))},Xh.insertSemicolon=function(){if(this.canInsertSemicolon())return this.options.onInsertedSemicolon&&this.options.onInsertedSemicolon(this.lastTokEnd,this.lastTokEndLoc),!0},Xh.semicolon=function(){this.eat(wh.semi)||this.insertSemicolon()||this.unexpected();},Xh.afterTrailingComma=function(e,t){if(this.type===e)return this.options.onTrailingComma&&this.options.onTrailingComma(this.lastTokStart,this.lastTokStartLoc),t||this.next(),!0},Xh.expect=function(e){this.eat(e)||this.unexpected();},Xh.unexpected=function(e){this.raise(null!=e?e:this.start,"Unexpected token");},Xh.checkPatternErrors=function(e,t){if(e){e.trailingComma>-1&&this.raiseRecoverable(e.trailingComma,"Comma is not permitted after the rest element");var n=t?e.parenthesizedAssign:e.parenthesizedBind;n>-1&&this.raiseRecoverable(n,"Parenthesized pattern");}},Xh.checkExpressionErrors=function(e,t){if(!e)return !1;var n=e.shorthandAssign,r=e.doubleProto;if(!t)return n>=0||r>=0;n>=0&&this.raise(n,"Shorthand property assignments are valid only in destructuring patterns"),r>=0&&this.raiseRecoverable(r,"Redefinition of __proto__ property");},Xh.checkYieldAwaitInDefaultParams=function(){this.yieldPos&&(!this.awaitPos||this.yieldPos<this.awaitPos)&&this.raise(this.yieldPos,"Yield expression cannot be a default value"),this.awaitPos&&this.raise(this.awaitPos,"Await expression cannot be a default value");},Xh.isSimpleAssignTarget=function(e){return "ParenthesizedExpression"===e.type?this.isSimpleAssignTarget(e.expression):"Identifier"===e.type||"MemberExpression"===e.type};var Zh=Kh.prototype;Zh.parseTopLevel=function(e){var t={};for(e.body||(e.body=[]);this.type!==wh.eof;){var n=this.parseStatement(null,!0,t);e.body.push(n);}if(this.inModule)for(var r=0,i=Object.keys(this.undefinedExports);r<i.length;r+=1){var s=i[r];this.raiseRecoverable(this.undefinedExports[s].start,"Export '"+s+"' is not defined");}return this.adaptDirectivePrologue(e.body),this.next(),this.options.ecmaVersion>=6&&(e.sourceType=this.options.sourceType),this.finishNode(e,"Program")};var eu={kind:"loop"},tu={kind:"switch"};Zh.isLet=function(e){if(this.options.ecmaVersion<6||!this.isContextual("let"))return !1;$h.lastIndex=this.pos;var t=$h.exec(this.input),n=this.pos+t[0].length,r=this.input.charCodeAt(n);if(91===r)return !0;if(e)return !1;if(123===r)return !0;if(xh(r,!0)){for(var i=n+1;vh(this.input.charCodeAt(i),!0);)++i;var s=this.input.slice(n,i);if(!ch.test(s))return !0}return !1},Zh.isAsyncFunction=function(){if(this.options.ecmaVersion<8||!this.isContextual("async"))return !1;$h.lastIndex=this.pos;var e=$h.exec(this.input),t=this.pos+e[0].length;return !(Ph.test(this.input.slice(this.pos,t))||"function"!==this.input.slice(t,t+8)||t+8!==this.input.length&&vh(this.input.charAt(t+8)))},Zh.parseStatement=function(e,t,n){var r,i=this.type,s=this.startNode();switch(this.isLet(e)&&(i=wh._var,r="let"),i){case wh._break:case wh._continue:return this.parseBreakContinueStatement(s,i.keyword);case wh._debugger:return this.parseDebuggerStatement(s);case wh._do:return this.parseDoStatement(s);case wh._for:return this.parseForStatement(s);case wh._function:return e&&(this.strict||"if"!==e&&"label"!==e)&&this.options.ecmaVersion>=6&&this.unexpected(),this.parseFunctionStatement(s,!1,!e);case wh._class:return e&&this.unexpected(),this.parseClass(s,!0);case wh._if:return this.parseIfStatement(s);case wh._return:return this.parseReturnStatement(s);case wh._switch:return this.parseSwitchStatement(s);case wh._throw:return this.parseThrowStatement(s);case wh._try:return this.parseTryStatement(s);case wh._const:case wh._var:return r=r||this.value,e&&"var"!==r&&this.unexpected(),this.parseVarStatement(s,r);case wh._while:return this.parseWhileStatement(s);case wh._with:return this.parseWithStatement(s);case wh.braceL:return this.parseBlock(!0,s);case wh.semi:return this.parseEmptyStatement(s);case wh._export:case wh._import:return this.options.allowImportExportEverywhere||(t||this.raise(this.start,"'import' and 'export' may only appear at the top level"),this.inModule||this.raise(this.start,"'import' and 'export' may appear only with 'sourceType: module'")),i===wh._import?this.parseImport(s):this.parseExport(s,n);default:if(this.isAsyncFunction())return e&&this.unexpected(),this.next(),this.parseFunctionStatement(s,!0,!e);var o=this.value,a=this.parseExpression();return i===wh.name&&"Identifier"===a.type&&this.eat(wh.colon)?this.parseLabeledStatement(s,o,a,e):this.parseExpressionStatement(s,a)}},Zh.parseBreakContinueStatement=function(e,t){var n="break"===t;this.next(),this.eat(wh.semi)||this.insertSemicolon()?e.label=null:this.type!==wh.name?this.unexpected():(e.label=this.parseIdent(),this.semicolon());for(var r=0;r<this.labels.length;++r){var i=this.labels[r];if(null==e.label||i.name===e.label.name){if(null!=i.kind&&(n||"loop"===i.kind))break;if(e.label&&n)break}}return r===this.labels.length&&this.raise(e.start,"Unsyntactic "+t),this.finishNode(e,n?"BreakStatement":"ContinueStatement")},Zh.parseDebuggerStatement=function(e){return this.next(),this.semicolon(),this.finishNode(e,"DebuggerStatement")},Zh.parseDoStatement=function(e){return this.next(),this.labels.push(eu),e.body=this.parseStatement("do"),this.labels.pop(),this.expect(wh._while),e.test=this.parseParenExpression(),this.options.ecmaVersion>=6?this.eat(wh.semi):this.semicolon(),this.finishNode(e,"DoWhileStatement")},Zh.parseForStatement=function(e){this.next();var t=this.options.ecmaVersion>=9&&(this.inAsync||!this.inFunction&&this.options.allowAwaitOutsideFunction)&&this.eatContextual("await")?this.lastTokStart:-1;if(this.labels.push(eu),this.enterScope(0),this.expect(wh.parenL),this.type===wh.semi)return t>-1&&this.unexpected(t),this.parseFor(e,null);var n=this.isLet();if(this.type===wh._var||this.type===wh._const||n){var r=this.startNode(),i=n?"let":this.value;return this.next(),this.parseVar(r,!0,i),this.finishNode(r,"VariableDeclaration"),!(this.type===wh._in||this.options.ecmaVersion>=6&&this.isContextual("of"))||1!==r.declarations.length||"var"!==i&&r.declarations[0].init?(t>-1&&this.unexpected(t),this.parseFor(e,r)):(this.options.ecmaVersion>=9&&(this.type===wh._in?t>-1&&this.unexpected(t):e.await=t>-1),this.parseForIn(e,r))}var s=new Jh,o=this.parseExpression(!0,s);return this.type===wh._in||this.options.ecmaVersion>=6&&this.isContextual("of")?(this.options.ecmaVersion>=9&&(this.type===wh._in?t>-1&&this.unexpected(t):e.await=t>-1),this.toAssignable(o,!1,s),this.checkLVal(o),this.parseForIn(e,o)):(this.checkExpressionErrors(s,!0),t>-1&&this.unexpected(t),this.parseFor(e,o))},Zh.parseFunctionStatement=function(e,t,n){return this.next(),this.parseFunction(e,ru|(n?0:iu),!1,t)},Zh.parseIfStatement=function(e){return this.next(),e.test=this.parseParenExpression(),e.consequent=this.parseStatement("if"),e.alternate=this.eat(wh._else)?this.parseStatement("if"):null,this.finishNode(e,"IfStatement")},Zh.parseReturnStatement=function(e){return this.inFunction||this.options.allowReturnOutsideFunction||this.raise(this.start,"'return' outside of function"),this.next(),this.eat(wh.semi)||this.insertSemicolon()?e.argument=null:(e.argument=this.parseExpression(),this.semicolon()),this.finishNode(e,"ReturnStatement")},Zh.parseSwitchStatement=function(e){var t;this.next(),e.discriminant=this.parseParenExpression(),e.cases=[],this.expect(wh.braceL),this.labels.push(tu),this.enterScope(0);for(var n=!1;this.type!==wh.braceR;)if(this.type===wh._case||this.type===wh._default){var r=this.type===wh._case;t&&this.finishNode(t,"SwitchCase"),e.cases.push(t=this.startNode()),t.consequent=[],this.next(),r?t.test=this.parseExpression():(n&&this.raiseRecoverable(this.lastTokStart,"Multiple default clauses"),n=!0,t.test=null),this.expect(wh.colon);}else t||this.unexpected(),t.consequent.push(this.parseStatement(null));return this.exitScope(),t&&this.finishNode(t,"SwitchCase"),this.next(),this.labels.pop(),this.finishNode(e,"SwitchStatement")},Zh.parseThrowStatement=function(e){return this.next(),Ph.test(this.input.slice(this.lastTokEnd,this.start))&&this.raise(this.lastTokEnd,"Illegal newline after throw"),e.argument=this.parseExpression(),this.semicolon(),this.finishNode(e,"ThrowStatement")};var nu=[];Zh.parseTryStatement=function(e){if(this.next(),e.block=this.parseBlock(),e.handler=null,this.type===wh._catch){var t=this.startNode();if(this.next(),this.eat(wh.parenL)){t.param=this.parseBindingAtom();var n="Identifier"===t.param.type;this.enterScope(n?32:0),this.checkLVal(t.param,n?4:2),this.expect(wh.parenR);}else this.options.ecmaVersion<10&&this.unexpected(),t.param=null,this.enterScope(0);t.body=this.parseBlock(!1),this.exitScope(),e.handler=this.finishNode(t,"CatchClause");}return e.finalizer=this.eat(wh._finally)?this.parseBlock():null,e.handler||e.finalizer||this.raise(e.start,"Missing catch or finally clause"),this.finishNode(e,"TryStatement")},Zh.parseVarStatement=function(e,t){return this.next(),this.parseVar(e,!1,t),this.semicolon(),this.finishNode(e,"VariableDeclaration")},Zh.parseWhileStatement=function(e){return this.next(),e.test=this.parseParenExpression(),this.labels.push(eu),e.body=this.parseStatement("while"),this.labels.pop(),this.finishNode(e,"WhileStatement")},Zh.parseWithStatement=function(e){return this.strict&&this.raise(this.start,"'with' in strict mode"),this.next(),e.object=this.parseParenExpression(),e.body=this.parseStatement("with"),this.finishNode(e,"WithStatement")},Zh.parseEmptyStatement=function(e){return this.next(),this.finishNode(e,"EmptyStatement")},Zh.parseLabeledStatement=function(e,t,n,r){for(var i=0,s=this.labels;i<s.length;i+=1){s[i].name===t&&this.raise(n.start,"Label '"+t+"' is already declared");}for(var o=this.type.isLoop?"loop":this.type===wh._switch?"switch":null,a=this.labels.length-1;a>=0;a--){var h=this.labels[a];if(h.statementStart!==e.start)break;h.statementStart=this.start,h.kind=o;}return this.labels.push({name:t,kind:o,statementStart:this.start}),e.body=this.parseStatement(r?-1===r.indexOf("label")?r+"label":r:"label"),this.labels.pop(),e.label=n,this.finishNode(e,"LabeledStatement")},Zh.parseExpressionStatement=function(e,t){return e.expression=t,this.semicolon(),this.finishNode(e,"ExpressionStatement")},Zh.parseBlock=function(e,t){for(void 0===e&&(e=!0),void 0===t&&(t=this.startNode()),t.body=[],this.expect(wh.braceL),e&&this.enterScope(0);!this.eat(wh.braceR);){var n=this.parseStatement(null);t.body.push(n);}return e&&this.exitScope(),this.finishNode(t,"BlockStatement")},Zh.parseFor=function(e,t){return e.init=t,this.expect(wh.semi),e.test=this.type===wh.semi?null:this.parseExpression(),this.expect(wh.semi),e.update=this.type===wh.parenR?null:this.parseExpression(),this.expect(wh.parenR),e.body=this.parseStatement("for"),this.exitScope(),this.labels.pop(),this.finishNode(e,"ForStatement")},Zh.parseForIn=function(e,t){var n=this.type===wh._in?"ForInStatement":"ForOfStatement";return this.next(),"ForInStatement"===n&&("AssignmentPattern"===t.type||"VariableDeclaration"===t.type&&null!=t.declarations[0].init&&(this.strict||"Identifier"!==t.declarations[0].id.type))&&this.raise(t.start,"Invalid assignment in for-in loop head"),e.left=t,e.right="ForInStatement"===n?this.parseExpression():this.parseMaybeAssign(),this.expect(wh.parenR),e.body=this.parseStatement("for"),this.exitScope(),this.labels.pop(),this.finishNode(e,n)},Zh.parseVar=function(e,t,n){for(e.declarations=[],e.kind=n;;){var r=this.startNode();if(this.parseVarId(r,n),this.eat(wh.eq)?r.init=this.parseMaybeAssign(t):"const"!==n||this.type===wh._in||this.options.ecmaVersion>=6&&this.isContextual("of")?"Identifier"===r.id.type||t&&(this.type===wh._in||this.isContextual("of"))?r.init=null:this.raise(this.lastTokEnd,"Complex binding patterns require an initialization value"):this.unexpected(),e.declarations.push(this.finishNode(r,"VariableDeclarator")),!this.eat(wh.comma))break}return e},Zh.parseVarId=function(e,t){"const"!==t&&"let"!==t||!this.isContextual("let")||this.raiseRecoverable(this.start,"let is disallowed as a lexically bound name"),e.id=this.parseBindingAtom(),this.checkLVal(e.id,"var"===t?1:2,!1);};var ru=1,iu=2;Zh.parseFunction=function(e,t,n,r){this.initFunction(e),(this.options.ecmaVersion>=9||this.options.ecmaVersion>=6&&!r)&&(this.type===wh.star&&t&iu&&this.unexpected(),e.generator=this.eat(wh.star)),this.options.ecmaVersion>=8&&(e.async=!!r),t&ru&&(e.id=4&t&&this.type!==wh.name?null:this.parseIdent(),!e.id||t&iu||this.checkLVal(e.id,this.strict||e.generator||e.async?this.treatFunctionsAsVar?1:2:3));var i=this.yieldPos,s=this.awaitPos,o=this.awaitIdentPos;return this.yieldPos=0,this.awaitPos=0,this.awaitIdentPos=0,this.enterScope(Hh(e.async,e.generator)),t&ru||(e.id=this.type===wh.name?this.parseIdent():null),this.parseFunctionParams(e),this.parseFunctionBody(e,n,!1),this.yieldPos=i,this.awaitPos=s,this.awaitIdentPos=o,this.finishNode(e,t&ru?"FunctionDeclaration":"FunctionExpression")},Zh.parseFunctionParams=function(e){this.expect(wh.parenL),e.params=this.parseBindingList(wh.parenR,!1,this.options.ecmaVersion>=8),this.checkYieldAwaitInDefaultParams();},Zh.parseClass=function(e,t){this.next();var n=this.strict;this.strict=!0,this.parseClassId(e,t),this.parseClassSuper(e);var r=this.startNode(),i=!1;for(r.body=[],this.expect(wh.braceL);!this.eat(wh.braceR);){var s=this.parseClassElement(null!==e.superClass);s&&(r.body.push(s),"MethodDefinition"===s.type&&"constructor"===s.kind&&(i&&this.raise(s.start,"Duplicate constructor in the same class"),i=!0));}return e.body=this.finishNode(r,"ClassBody"),this.strict=n,this.finishNode(e,t?"ClassDeclaration":"ClassExpression")},Zh.parseClassElement=function(e){var t=this;if(this.eat(wh.semi))return null;var n=this.startNode(),r=function(e,r){void 0===r&&(r=!1);var i=t.start,s=t.startLoc;return !!t.eatContextual(e)&&(!(t.type===wh.parenL||r&&t.canInsertSemicolon())||(n.key&&t.unexpected(),n.computed=!1,n.key=t.startNodeAt(i,s),n.key.name=e,t.finishNode(n.key,"Identifier"),!1))};n.kind="method",n.static=r("static");var i=this.eat(wh.star),s=!1;i||(this.options.ecmaVersion>=8&&r("async",!0)?(s=!0,i=this.options.ecmaVersion>=9&&this.eat(wh.star)):r("get")?n.kind="get":r("set")&&(n.kind="set")),n.key||this.parsePropertyName(n);var o=n.key,a=!1;return n.computed||n.static||!("Identifier"===o.type&&"constructor"===o.name||"Literal"===o.type&&"constructor"===o.value)?n.static&&"Identifier"===o.type&&"prototype"===o.name&&this.raise(o.start,"Classes may not have a static property named prototype"):("method"!==n.kind&&this.raise(o.start,"Constructor can't have get/set modifier"),i&&this.raise(o.start,"Constructor can't be a generator"),s&&this.raise(o.start,"Constructor can't be an async method"),n.kind="constructor",a=e),this.parseClassMethod(n,i,s,a),"get"===n.kind&&0!==n.value.params.length&&this.raiseRecoverable(n.value.start,"getter should have no params"),"set"===n.kind&&1!==n.value.params.length&&this.raiseRecoverable(n.value.start,"setter should have exactly one param"),"set"===n.kind&&"RestElement"===n.value.params[0].type&&this.raiseRecoverable(n.value.params[0].start,"Setter cannot use rest params"),n},Zh.parseClassMethod=function(e,t,n,r){return e.value=this.parseMethod(t,n,r),this.finishNode(e,"MethodDefinition")},Zh.parseClassId=function(e,t){this.type===wh.name?(e.id=this.parseIdent(),t&&this.checkLVal(e.id,2,!1)):(!0===t&&this.unexpected(),e.id=null);},Zh.parseClassSuper=function(e){e.superClass=this.eat(wh._extends)?this.parseExprSubscripts():null;},Zh.parseExport=function(e,t){if(this.next(),this.eat(wh.star))return this.expectContextual("from"),this.type!==wh.string&&this.unexpected(),e.source=this.parseExprAtom(),this.semicolon(),this.finishNode(e,"ExportAllDeclaration");if(this.eat(wh._default)){var n;if(this.checkExport(t,"default",this.lastTokStart),this.type===wh._function||(n=this.isAsyncFunction())){var r=this.startNode();this.next(),n&&this.next(),e.declaration=this.parseFunction(r,4|ru,!1,n);}else if(this.type===wh._class){var i=this.startNode();e.declaration=this.parseClass(i,"nullableID");}else e.declaration=this.parseMaybeAssign(),this.semicolon();return this.finishNode(e,"ExportDefaultDeclaration")}if(this.shouldParseExportStatement())e.declaration=this.parseStatement(null),"VariableDeclaration"===e.declaration.type?this.checkVariableExport(t,e.declaration.declarations):this.checkExport(t,e.declaration.id.name,e.declaration.id.start),e.specifiers=[],e.source=null;else{if(e.declaration=null,e.specifiers=this.parseExportSpecifiers(t),this.eatContextual("from"))this.type!==wh.string&&this.unexpected(),e.source=this.parseExprAtom();else{for(var s=0,o=e.specifiers;s<o.length;s+=1){var a=o[s];this.checkUnreserved(a.local),this.checkLocalExport(a.local);}e.source=null;}this.semicolon();}return this.finishNode(e,"ExportNamedDeclaration")},Zh.checkExport=function(e,t,n){e&&(Th(e,t)&&this.raiseRecoverable(n,"Duplicate export '"+t+"'"),e[t]=!0);},Zh.checkPatternExport=function(e,t){var n=t.type;if("Identifier"===n)this.checkExport(e,t.name,t.start);else if("ObjectPattern"===n)for(var r=0,i=t.properties;r<i.length;r+=1){var s=i[r];this.checkPatternExport(e,s);}else if("ArrayPattern"===n)for(var o=0,a=t.elements;o<a.length;o+=1){var h=a[o];h&&this.checkPatternExport(e,h);}else"Property"===n?this.checkPatternExport(e,t.value):"AssignmentPattern"===n?this.checkPatternExport(e,t.left):"RestElement"===n?this.checkPatternExport(e,t.argument):"ParenthesizedExpression"===n&&this.checkPatternExport(e,t.expression);},Zh.checkVariableExport=function(e,t){if(e)for(var n=0,r=t;n<r.length;n+=1){var i=r[n];this.checkPatternExport(e,i.id);}},Zh.shouldParseExportStatement=function(){return "var"===this.type.keyword||"const"===this.type.keyword||"class"===this.type.keyword||"function"===this.type.keyword||this.isLet()||this.isAsyncFunction()},Zh.parseExportSpecifiers=function(e){var t=[],n=!0;for(this.expect(wh.braceL);!this.eat(wh.braceR);){if(n)n=!1;else if(this.expect(wh.comma),this.afterTrailingComma(wh.braceR))break;var r=this.startNode();r.local=this.parseIdent(!0),r.exported=this.eatContextual("as")?this.parseIdent(!0):r.local,this.checkExport(e,r.exported.name,r.exported.start),t.push(this.finishNode(r,"ExportSpecifier"));}return t},Zh.parseImport=function(e){return this.next(),this.type===wh.string?(e.specifiers=nu,e.source=this.parseExprAtom()):(e.specifiers=this.parseImportSpecifiers(),this.expectContextual("from"),e.source=this.type===wh.string?this.parseExprAtom():this.unexpected()),this.semicolon(),this.finishNode(e,"ImportDeclaration")},Zh.parseImportSpecifiers=function(){var e=[],t=!0;if(this.type===wh.name){var n=this.startNode();if(n.local=this.parseIdent(),this.checkLVal(n.local,2),e.push(this.finishNode(n,"ImportDefaultSpecifier")),!this.eat(wh.comma))return e}if(this.type===wh.star){var r=this.startNode();return this.next(),this.expectContextual("as"),r.local=this.parseIdent(),this.checkLVal(r.local,2),e.push(this.finishNode(r,"ImportNamespaceSpecifier")),e}for(this.expect(wh.braceL);!this.eat(wh.braceR);){if(t)t=!1;else if(this.expect(wh.comma),this.afterTrailingComma(wh.braceR))break;var i=this.startNode();i.imported=this.parseIdent(!0),this.eatContextual("as")?i.local=this.parseIdent():(this.checkUnreserved(i.imported),i.local=i.imported),this.checkLVal(i.local,2),e.push(this.finishNode(i,"ImportSpecifier"));}return e},Zh.adaptDirectivePrologue=function(e){for(var t=0;t<e.length&&this.isDirectiveCandidate(e[t]);++t)e[t].directive=e[t].expression.raw.slice(1,-1);},Zh.isDirectiveCandidate=function(e){return "ExpressionStatement"===e.type&&"Literal"===e.expression.type&&"string"==typeof e.expression.value&&('"'===this.input[e.start]||"'"===this.input[e.start])};var su=Kh.prototype;su.toAssignable=function(e,t,n){if(this.options.ecmaVersion>=6&&e)switch(e.type){case"Identifier":this.inAsync&&"await"===e.name&&this.raise(e.start,"Cannot use 'await' as identifier inside an async function");break;case"ObjectPattern":case"ArrayPattern":case"RestElement":break;case"ObjectExpression":e.type="ObjectPattern",n&&this.checkPatternErrors(n,!0);for(var r=0,i=e.properties;r<i.length;r+=1){var s=i[r];this.toAssignable(s,t),"RestElement"!==s.type||"ArrayPattern"!==s.argument.type&&"ObjectPattern"!==s.argument.type||this.raise(s.argument.start,"Unexpected token");}break;case"Property":"init"!==e.kind&&this.raise(e.key.start,"Object pattern can't contain getter or setter"),this.toAssignable(e.value,t);break;case"ArrayExpression":e.type="ArrayPattern",n&&this.checkPatternErrors(n,!0),this.toAssignableList(e.elements,t);break;case"SpreadElement":e.type="RestElement",this.toAssignable(e.argument,t),"AssignmentPattern"===e.argument.type&&this.raise(e.argument.start,"Rest elements cannot have a default value");break;case"AssignmentExpression":"="!==e.operator&&this.raise(e.left.end,"Only '=' operator can be used for specifying default value."),e.type="AssignmentPattern",delete e.operator,this.toAssignable(e.left,t);case"AssignmentPattern":break;case"ParenthesizedExpression":this.toAssignable(e.expression,t,n);break;case"MemberExpression":if(!t)break;default:this.raise(e.start,"Assigning to rvalue");}else n&&this.checkPatternErrors(n,!0);return e},su.toAssignableList=function(e,t){for(var n=e.length,r=0;r<n;r++){var i=e[r];i&&this.toAssignable(i,t);}if(n){var s=e[n-1];6===this.options.ecmaVersion&&t&&s&&"RestElement"===s.type&&"Identifier"!==s.argument.type&&this.unexpected(s.argument.start);}return e},su.parseSpread=function(e){var t=this.startNode();return this.next(),t.argument=this.parseMaybeAssign(!1,e),this.finishNode(t,"SpreadElement")},su.parseRestBinding=function(){var e=this.startNode();return this.next(),6===this.options.ecmaVersion&&this.type!==wh.name&&this.unexpected(),e.argument=this.parseBindingAtom(),this.finishNode(e,"RestElement")},su.parseBindingAtom=function(){if(this.options.ecmaVersion>=6)switch(this.type){case wh.bracketL:var e=this.startNode();return this.next(),e.elements=this.parseBindingList(wh.bracketR,!0,!0),this.finishNode(e,"ArrayPattern");case wh.braceL:return this.parseObj(!0)}return this.parseIdent()},su.parseBindingList=function(e,t,n){for(var r=[],i=!0;!this.eat(e);)if(i?i=!1:this.expect(wh.comma),t&&this.type===wh.comma)r.push(null);else{if(n&&this.afterTrailingComma(e))break;if(this.type===wh.ellipsis){var s=this.parseRestBinding();this.parseBindingListItem(s),r.push(s),this.type===wh.comma&&this.raise(this.start,"Comma is not permitted after the rest element"),this.expect(e);break}var o=this.parseMaybeDefault(this.start,this.startLoc);this.parseBindingListItem(o),r.push(o);}return r},su.parseBindingListItem=function(e){return e},su.parseMaybeDefault=function(e,t,n){if(n=n||this.parseBindingAtom(),this.options.ecmaVersion<6||!this.eat(wh.eq))return n;var r=this.startNodeAt(e,t);return r.left=n,r.right=this.parseMaybeAssign(),this.finishNode(r,"AssignmentPattern")},su.checkLVal=function(e,t,n){switch(void 0===t&&(t=0),e.type){case"Identifier":this.strict&&this.reservedWordsStrictBind.test(e.name)&&this.raiseRecoverable(e.start,(t?"Binding ":"Assigning to ")+e.name+" in strict mode"),n&&(Th(n,e.name)&&this.raiseRecoverable(e.start,"Argument name clash"),n[e.name]=!0),0!==t&&5!==t&&this.declareName(e.name,t,e.start);break;case"MemberExpression":t&&this.raiseRecoverable(e.start,"Binding member expression");break;case"ObjectPattern":for(var r=0,i=e.properties;r<i.length;r+=1){var s=i[r];this.checkLVal(s,t,n);}break;case"Property":this.checkLVal(e.value,t,n);break;case"ArrayPattern":for(var o=0,a=e.elements;o<a.length;o+=1){var h=a[o];h&&this.checkLVal(h,t,n);}break;case"AssignmentPattern":this.checkLVal(e.left,t,n);break;case"RestElement":this.checkLVal(e.argument,t,n);break;case"ParenthesizedExpression":this.checkLVal(e.expression,t,n);break;default:this.raise(e.start,(t?"Binding":"Assigning to")+" rvalue");}};var ou=Kh.prototype;ou.checkPropClash=function(e,t,n){if(!(this.options.ecmaVersion>=9&&"SpreadElement"===e.type||this.options.ecmaVersion>=6&&(e.computed||e.method||e.shorthand))){var r,i=e.key;switch(i.type){case"Identifier":r=i.name;break;case"Literal":r=String(i.value);break;default:return}var s=e.kind;if(this.options.ecmaVersion>=6)"__proto__"===r&&"init"===s&&(t.proto&&(n&&n.doubleProto<0?n.doubleProto=i.start:this.raiseRecoverable(i.start,"Redefinition of __proto__ property")),t.proto=!0);else{var o=t[r="$"+r];if(o)("init"===s?this.strict&&o.init||o.get||o.set:o.init||o[s])&&this.raiseRecoverable(i.start,"Redefinition of property");else o=t[r]={init:!1,get:!1,set:!1};o[s]=!0;}}},ou.parseExpression=function(e,t){var n=this.start,r=this.startLoc,i=this.parseMaybeAssign(e,t);if(this.type===wh.comma){var s=this.startNodeAt(n,r);for(s.expressions=[i];this.eat(wh.comma);)s.expressions.push(this.parseMaybeAssign(e,t));return this.finishNode(s,"SequenceExpression")}return i},ou.parseMaybeAssign=function(e,t,n){if(this.isContextual("yield")){if(this.inGenerator)return this.parseYield(e);this.exprAllowed=!1;}var r=!1,i=-1,s=-1,o=-1;t?(i=t.parenthesizedAssign,s=t.trailingComma,o=t.shorthandAssign,t.parenthesizedAssign=t.trailingComma=t.shorthandAssign=-1):(t=new Jh,r=!0);var a=this.start,h=this.startLoc;this.type!==wh.parenL&&this.type!==wh.name||(this.potentialArrowAt=this.start);var u=this.parseMaybeConditional(e,t);if(n&&(u=n.call(this,u,a,h)),this.type.isAssign){var c=this.startNodeAt(a,h);return c.operator=this.value,c.left=this.type===wh.eq?this.toAssignable(u,!1,t):u,r||Jh.call(t),t.shorthandAssign=-1,this.checkLVal(u),this.next(),c.right=this.parseMaybeAssign(e),this.finishNode(c,"AssignmentExpression")}return r&&this.checkExpressionErrors(t,!0),i>-1&&(t.parenthesizedAssign=i),s>-1&&(t.trailingComma=s),o>-1&&(t.shorthandAssign=o),u},ou.parseMaybeConditional=function(e,t){var n=this.start,r=this.startLoc,i=this.parseExprOps(e,t);if(this.checkExpressionErrors(t))return i;if(this.eat(wh.question)){var s=this.startNodeAt(n,r);return s.test=i,s.consequent=this.parseMaybeAssign(),this.expect(wh.colon),s.alternate=this.parseMaybeAssign(e),this.finishNode(s,"ConditionalExpression")}return i},ou.parseExprOps=function(e,t){var n=this.start,r=this.startLoc,i=this.parseMaybeUnary(t,!1);return this.checkExpressionErrors(t)?i:i.start===n&&"ArrowFunctionExpression"===i.type?i:this.parseExprOp(i,n,r,-1,e)},ou.parseExprOp=function(e,t,n,r,i){var s=this.type.binop;if(null!=s&&(!i||this.type!==wh._in)&&s>r){var o=this.type===wh.logicalOR||this.type===wh.logicalAND,a=this.value;this.next();var h=this.start,u=this.startLoc,c=this.parseExprOp(this.parseMaybeUnary(null,!1),h,u,s,i),l=this.buildBinary(t,n,e,c,a,o);return this.parseExprOp(l,t,n,r,i)}return e},ou.buildBinary=function(e,t,n,r,i,s){var o=this.startNodeAt(e,t);return o.left=n,o.operator=i,o.right=r,this.finishNode(o,s?"LogicalExpression":"BinaryExpression")},ou.parseMaybeUnary=function(e,t){var n,r=this.start,i=this.startLoc;if(this.isContextual("await")&&(this.inAsync||!this.inFunction&&this.options.allowAwaitOutsideFunction))n=this.parseAwait(),t=!0;else if(this.type.prefix){var s=this.startNode(),o=this.type===wh.incDec;s.operator=this.value,s.prefix=!0,this.next(),s.argument=this.parseMaybeUnary(null,!0),this.checkExpressionErrors(e,!0),o?this.checkLVal(s.argument):this.strict&&"delete"===s.operator&&"Identifier"===s.argument.type?this.raiseRecoverable(s.start,"Deleting local variable in strict mode"):t=!0,n=this.finishNode(s,o?"UpdateExpression":"UnaryExpression");}else{if(n=this.parseExprSubscripts(e),this.checkExpressionErrors(e))return n;for(;this.type.postfix&&!this.canInsertSemicolon();){var a=this.startNodeAt(r,i);a.operator=this.value,a.prefix=!1,a.argument=n,this.checkLVal(n),this.next(),n=this.finishNode(a,"UpdateExpression");}}return !t&&this.eat(wh.starstar)?this.buildBinary(r,i,n,this.parseMaybeUnary(null,!1),"**",!1):n},ou.parseExprSubscripts=function(e){var t=this.start,n=this.startLoc,r=this.parseExprAtom(e),i="ArrowFunctionExpression"===r.type&&")"!==this.input.slice(this.lastTokStart,this.lastTokEnd);if(this.checkExpressionErrors(e)||i)return r;var s=this.parseSubscripts(r,t,n);return e&&"MemberExpression"===s.type&&(e.parenthesizedAssign>=s.start&&(e.parenthesizedAssign=-1),e.parenthesizedBind>=s.start&&(e.parenthesizedBind=-1)),s},ou.parseSubscripts=function(e,t,n,r){for(var i=this.options.ecmaVersion>=8&&"Identifier"===e.type&&"async"===e.name&&this.lastTokEnd===e.end&&!this.canInsertSemicolon()&&"async"===this.input.slice(e.start,e.end);;){var s=this.parseSubscript(e,t,n,r,i);if(s===e||"ArrowFunctionExpression"===s.type)return s;e=s;}},ou.parseSubscript=function(e,t,n,r,i){var s=this.eat(wh.bracketL);if(s||this.eat(wh.dot)){var o=this.startNodeAt(t,n);o.object=e,o.property=s?this.parseExpression():this.parseIdent(!0),o.computed=!!s,s&&this.expect(wh.bracketR),e=this.finishNode(o,"MemberExpression");}else if(!r&&this.eat(wh.parenL)){var a=new Jh,h=this.yieldPos,u=this.awaitPos,c=this.awaitIdentPos;this.yieldPos=0,this.awaitPos=0,this.awaitIdentPos=0;var l=this.parseExprList(wh.parenR,this.options.ecmaVersion>=8,!1,a);if(i&&!this.canInsertSemicolon()&&this.eat(wh.arrow))return this.checkPatternErrors(a,!1),this.checkYieldAwaitInDefaultParams(),this.awaitIdentPos>0&&this.raise(this.awaitIdentPos,"Cannot use 'await' as identifier inside an async function"),this.yieldPos=h,this.awaitPos=u,this.awaitIdentPos=c,this.parseArrowExpression(this.startNodeAt(t,n),l,!0);this.checkExpressionErrors(a,!0),this.yieldPos=h||this.yieldPos,this.awaitPos=u||this.awaitPos,this.awaitIdentPos=c||this.awaitIdentPos;var p=this.startNodeAt(t,n);p.callee=e,p.arguments=l,e=this.finishNode(p,"CallExpression");}else if(this.type===wh.backQuote){var d=this.startNodeAt(t,n);d.tag=e,d.quasi=this.parseTemplate({isTagged:!0}),e=this.finishNode(d,"TaggedTemplateExpression");}return e},ou.parseExprAtom=function(e){this.type===wh.slash&&this.readRegexp();var t,n=this.potentialArrowAt===this.start;switch(this.type){case wh._super:return this.allowSuper||this.raise(this.start,"'super' keyword outside a method"),t=this.startNode(),this.next(),this.type!==wh.parenL||this.allowDirectSuper||this.raise(t.start,"super() call outside constructor of a subclass"),this.type!==wh.dot&&this.type!==wh.bracketL&&this.type!==wh.parenL&&this.unexpected(),this.finishNode(t,"Super");case wh._this:return t=this.startNode(),this.next(),this.finishNode(t,"ThisExpression");case wh.name:var r=this.start,i=this.startLoc,s=this.containsEsc,o=this.parseIdent(!1);if(this.options.ecmaVersion>=8&&!s&&"async"===o.name&&!this.canInsertSemicolon()&&this.eat(wh._function))return this.parseFunction(this.startNodeAt(r,i),0,!1,!0);if(n&&!this.canInsertSemicolon()){if(this.eat(wh.arrow))return this.parseArrowExpression(this.startNodeAt(r,i),[o],!1);if(this.options.ecmaVersion>=8&&"async"===o.name&&this.type===wh.name&&!s)return o=this.parseIdent(!1),!this.canInsertSemicolon()&&this.eat(wh.arrow)||this.unexpected(),this.parseArrowExpression(this.startNodeAt(r,i),[o],!0)}return o;case wh.regexp:var a=this.value;return (t=this.parseLiteral(a.value)).regex={pattern:a.pattern,flags:a.flags},t;case wh.num:case wh.string:return this.parseLiteral(this.value);case wh._null:case wh._true:case wh._false:return (t=this.startNode()).value=this.type===wh._null?null:this.type===wh._true,t.raw=this.type.keyword,this.next(),this.finishNode(t,"Literal");case wh.parenL:var h=this.start,u=this.parseParenAndDistinguishExpression(n);return e&&(e.parenthesizedAssign<0&&!this.isSimpleAssignTarget(u)&&(e.parenthesizedAssign=h),e.parenthesizedBind<0&&(e.parenthesizedBind=h)),u;case wh.bracketL:return t=this.startNode(),this.next(),t.elements=this.parseExprList(wh.bracketR,!0,!0,e),this.finishNode(t,"ArrayExpression");case wh.braceL:return this.parseObj(!1,e);case wh._function:return t=this.startNode(),this.next(),this.parseFunction(t,0);case wh._class:return this.parseClass(this.startNode(),!1);case wh._new:return this.parseNew();case wh.backQuote:return this.parseTemplate();default:this.unexpected();}},ou.parseLiteral=function(e){var t=this.startNode();return t.value=e,t.raw=this.input.slice(this.start,this.end),this.next(),this.finishNode(t,"Literal")},ou.parseParenExpression=function(){this.expect(wh.parenL);var e=this.parseExpression();return this.expect(wh.parenR),e},ou.parseParenAndDistinguishExpression=function(e){var t,n=this.start,r=this.startLoc,i=this.options.ecmaVersion>=8;if(this.options.ecmaVersion>=6){this.next();var s,o=this.start,a=this.startLoc,h=[],u=!0,c=!1,l=new Jh,p=this.yieldPos,d=this.awaitPos;for(this.yieldPos=0,this.awaitPos=0;this.type!==wh.parenR;){if(u?u=!1:this.expect(wh.comma),i&&this.afterTrailingComma(wh.parenR,!0)){c=!0;break}if(this.type===wh.ellipsis){s=this.start,h.push(this.parseParenItem(this.parseRestBinding())),this.type===wh.comma&&this.raise(this.start,"Comma is not permitted after the rest element");break}h.push(this.parseMaybeAssign(!1,l,this.parseParenItem));}var f=this.start,m=this.startLoc;if(this.expect(wh.parenR),e&&!this.canInsertSemicolon()&&this.eat(wh.arrow))return this.checkPatternErrors(l,!1),this.checkYieldAwaitInDefaultParams(),this.yieldPos=p,this.awaitPos=d,this.parseParenArrowList(n,r,h);h.length&&!c||this.unexpected(this.lastTokStart),s&&this.unexpected(s),this.checkExpressionErrors(l,!0),this.yieldPos=p||this.yieldPos,this.awaitPos=d||this.awaitPos,h.length>1?((t=this.startNodeAt(o,a)).expressions=h,this.finishNodeAt(t,"SequenceExpression",f,m)):t=h[0];}else t=this.parseParenExpression();if(this.options.preserveParens){var g=this.startNodeAt(n,r);return g.expression=t,this.finishNode(g,"ParenthesizedExpression")}return t},ou.parseParenItem=function(e){return e},ou.parseParenArrowList=function(e,t,n){return this.parseArrowExpression(this.startNodeAt(e,t),n)};var au=[];ou.parseNew=function(){var e=this.startNode(),t=this.parseIdent(!0);if(this.options.ecmaVersion>=6&&this.eat(wh.dot)){e.meta=t;var n=this.containsEsc;return e.property=this.parseIdent(!0),("target"!==e.property.name||n)&&this.raiseRecoverable(e.property.start,"The only valid meta property for new is new.target"),this.inNonArrowFunction()||this.raiseRecoverable(e.start,"new.target can only be used in functions"),this.finishNode(e,"MetaProperty")}var r=this.start,i=this.startLoc;return e.callee=this.parseSubscripts(this.parseExprAtom(),r,i,!0),this.eat(wh.parenL)?e.arguments=this.parseExprList(wh.parenR,this.options.ecmaVersion>=8,!1):e.arguments=au,this.finishNode(e,"NewExpression")},ou.parseTemplateElement=function(e){var t=e.isTagged,n=this.startNode();return this.type===wh.invalidTemplate?(t||this.raiseRecoverable(this.start,"Bad escape sequence in untagged template literal"),n.value={raw:this.value,cooked:null}):n.value={raw:this.input.slice(this.start,this.end).replace(/\r\n?/g,"\n"),cooked:this.value},this.next(),n.tail=this.type===wh.backQuote,this.finishNode(n,"TemplateElement")},ou.parseTemplate=function(e){void 0===e&&(e={});var t=e.isTagged;void 0===t&&(t=!1);var n=this.startNode();this.next(),n.expressions=[];var r=this.parseTemplateElement({isTagged:t});for(n.quasis=[r];!r.tail;)this.type===wh.eof&&this.raise(this.pos,"Unterminated template literal"),this.expect(wh.dollarBraceL),n.expressions.push(this.parseExpression()),this.expect(wh.braceR),n.quasis.push(r=this.parseTemplateElement({isTagged:t}));return this.next(),this.finishNode(n,"TemplateLiteral")},ou.isAsyncProp=function(e){return !e.computed&&"Identifier"===e.key.type&&"async"===e.key.name&&(this.type===wh.name||this.type===wh.num||this.type===wh.string||this.type===wh.bracketL||this.type.keyword||this.options.ecmaVersion>=9&&this.type===wh.star)&&!Ph.test(this.input.slice(this.lastTokEnd,this.start))},ou.parseObj=function(e,t){var n=this.startNode(),r=!0,i={};for(n.properties=[],this.next();!this.eat(wh.braceR);){if(r)r=!1;else if(this.expect(wh.comma),this.afterTrailingComma(wh.braceR))break;var s=this.parseProperty(e,t);e||this.checkPropClash(s,i,t),n.properties.push(s);}return this.finishNode(n,e?"ObjectPattern":"ObjectExpression")},ou.parseProperty=function(e,t){var n,r,i,s,o=this.startNode();if(this.options.ecmaVersion>=9&&this.eat(wh.ellipsis))return e?(o.argument=this.parseIdent(!1),this.type===wh.comma&&this.raise(this.start,"Comma is not permitted after the rest element"),this.finishNode(o,"RestElement")):(this.type===wh.parenL&&t&&(t.parenthesizedAssign<0&&(t.parenthesizedAssign=this.start),t.parenthesizedBind<0&&(t.parenthesizedBind=this.start)),o.argument=this.parseMaybeAssign(!1,t),this.type===wh.comma&&t&&t.trailingComma<0&&(t.trailingComma=this.start),this.finishNode(o,"SpreadElement"));this.options.ecmaVersion>=6&&(o.method=!1,o.shorthand=!1,(e||t)&&(i=this.start,s=this.startLoc),e||(n=this.eat(wh.star)));var a=this.containsEsc;return this.parsePropertyName(o),!e&&!a&&this.options.ecmaVersion>=8&&!n&&this.isAsyncProp(o)?(r=!0,n=this.options.ecmaVersion>=9&&this.eat(wh.star),this.parsePropertyName(o,t)):r=!1,this.parsePropertyValue(o,e,n,r,i,s,t,a),this.finishNode(o,"Property")},ou.parsePropertyValue=function(e,t,n,r,i,s,o,a){if((n||r)&&this.type===wh.colon&&this.unexpected(),this.eat(wh.colon))e.value=t?this.parseMaybeDefault(this.start,this.startLoc):this.parseMaybeAssign(!1,o),e.kind="init";else if(this.options.ecmaVersion>=6&&this.type===wh.parenL)t&&this.unexpected(),e.kind="init",e.method=!0,e.value=this.parseMethod(n,r);else if(t||a||!(this.options.ecmaVersion>=5)||e.computed||"Identifier"!==e.key.type||"get"!==e.key.name&&"set"!==e.key.name||this.type===wh.comma||this.type===wh.braceR)this.options.ecmaVersion>=6&&!e.computed&&"Identifier"===e.key.type?((n||r)&&this.unexpected(),this.checkUnreserved(e.key),"await"!==e.key.name||this.awaitIdentPos||(this.awaitIdentPos=i),e.kind="init",t?e.value=this.parseMaybeDefault(i,s,e.key):this.type===wh.eq&&o?(o.shorthandAssign<0&&(o.shorthandAssign=this.start),e.value=this.parseMaybeDefault(i,s,e.key)):e.value=e.key,e.shorthand=!0):this.unexpected();else{(n||r)&&this.unexpected(),e.kind=e.key.name,this.parsePropertyName(e),e.value=this.parseMethod(!1);var h="get"===e.kind?0:1;if(e.value.params.length!==h){var u=e.value.start;"get"===e.kind?this.raiseRecoverable(u,"getter should have no params"):this.raiseRecoverable(u,"setter should have exactly one param");}else"set"===e.kind&&"RestElement"===e.value.params[0].type&&this.raiseRecoverable(e.value.params[0].start,"Setter cannot use rest params");}},ou.parsePropertyName=function(e){if(this.options.ecmaVersion>=6){if(this.eat(wh.bracketL))return e.computed=!0,e.key=this.parseMaybeAssign(),this.expect(wh.bracketR),e.key;e.computed=!1;}return e.key=this.type===wh.num||this.type===wh.string?this.parseExprAtom():this.parseIdent(!0)},ou.initFunction=function(e){e.id=null,this.options.ecmaVersion>=6&&(e.generator=e.expression=!1),this.options.ecmaVersion>=8&&(e.async=!1);},ou.parseMethod=function(e,t,n){var r=this.startNode(),i=this.yieldPos,s=this.awaitPos,o=this.awaitIdentPos;return this.initFunction(r),this.options.ecmaVersion>=6&&(r.generator=e),this.options.ecmaVersion>=8&&(r.async=!!t),this.yieldPos=0,this.awaitPos=0,this.awaitIdentPos=0,this.enterScope(64|Hh(t,r.generator)|(n?128:0)),this.expect(wh.parenL),r.params=this.parseBindingList(wh.parenR,!1,this.options.ecmaVersion>=8),this.checkYieldAwaitInDefaultParams(),this.parseFunctionBody(r,!1,!0),this.yieldPos=i,this.awaitPos=s,this.awaitIdentPos=o,this.finishNode(r,"FunctionExpression")},ou.parseArrowExpression=function(e,t,n){var r=this.yieldPos,i=this.awaitPos,s=this.awaitIdentPos;return this.enterScope(16|Hh(n,!1)),this.initFunction(e),this.options.ecmaVersion>=8&&(e.async=!!n),this.yieldPos=0,this.awaitPos=0,this.awaitIdentPos=0,e.params=this.toAssignableList(t,!0),this.parseFunctionBody(e,!0,!1),this.yieldPos=r,this.awaitPos=i,this.awaitIdentPos=s,this.finishNode(e,"ArrowFunctionExpression")},ou.parseFunctionBody=function(e,t,n){var r=t&&this.type!==wh.braceL,i=this.strict,s=!1;if(r)e.body=this.parseMaybeAssign(),e.expression=!0,this.checkParams(e,!1);else{var o=this.options.ecmaVersion>=7&&!this.isSimpleParamList(e.params);i&&!o||(s=this.strictDirective(this.end))&&o&&this.raiseRecoverable(e.start,"Illegal 'use strict' directive in function with non-simple parameter list");var a=this.labels;this.labels=[],s&&(this.strict=!0),this.checkParams(e,!i&&!s&&!t&&!n&&this.isSimpleParamList(e.params)),e.body=this.parseBlock(!1),e.expression=!1,this.adaptDirectivePrologue(e.body.body),this.labels=a;}this.exitScope(),this.strict&&e.id&&this.checkLVal(e.id,5),this.strict=i;},ou.isSimpleParamList=function(e){for(var t=0,n=e;t<n.length;t+=1){if("Identifier"!==n[t].type)return !1}return !0},ou.checkParams=function(e,t){for(var n={},r=0,i=e.params;r<i.length;r+=1){var s=i[r];this.checkLVal(s,1,t?null:n);}},ou.parseExprList=function(e,t,n,r){for(var i=[],s=!0;!this.eat(e);){if(s)s=!1;else if(this.expect(wh.comma),t&&this.afterTrailingComma(e))break;var o=void 0;n&&this.type===wh.comma?o=null:this.type===wh.ellipsis?(o=this.parseSpread(r),r&&this.type===wh.comma&&r.trailingComma<0&&(r.trailingComma=this.start)):o=this.parseMaybeAssign(!1,r),i.push(o);}return i},ou.checkUnreserved=function(e){var t=e.start,n=e.end,r=e.name;(this.inGenerator&&"yield"===r&&this.raiseRecoverable(t,"Cannot use 'yield' as identifier inside a generator"),this.inAsync&&"await"===r&&this.raiseRecoverable(t,"Cannot use 'await' as identifier inside an async function"),this.keywords.test(r)&&this.raise(t,"Unexpected keyword '"+r+"'"),this.options.ecmaVersion<6&&-1!==this.input.slice(t,n).indexOf("\\"))||(this.strict?this.reservedWordsStrict:this.reservedWords).test(r)&&(this.inAsync||"await"!==r||this.raiseRecoverable(t,"Cannot use keyword 'await' outside an async function"),this.raiseRecoverable(t,"The keyword '"+r+"' is reserved"));},ou.parseIdent=function(e,t){var n=this.startNode();return e&&"never"===this.options.allowReserved&&(e=!1),this.type===wh.name?n.name=this.value:this.type.keyword?(n.name=this.type.keyword,"class"!==n.name&&"function"!==n.name||this.lastTokEnd===this.lastTokStart+1&&46===this.input.charCodeAt(this.lastTokStart)||this.context.pop()):this.unexpected(),this.next(),this.finishNode(n,"Identifier"),e||(this.checkUnreserved(n),"await"!==n.name||this.awaitIdentPos||(this.awaitIdentPos=n.start)),n},ou.parseYield=function(e){this.yieldPos||(this.yieldPos=this.start);var t=this.startNode();return this.next(),this.type===wh.semi||this.canInsertSemicolon()||this.type!==wh.star&&!this.type.startsExpr?(t.delegate=!1,t.argument=null):(t.delegate=this.eat(wh.star),t.argument=this.parseMaybeAssign(e)),this.finishNode(t,"YieldExpression")},ou.parseAwait=function(){this.awaitPos||(this.awaitPos=this.start);var e=this.startNode();return this.next(),e.argument=this.parseMaybeUnary(null,!0),this.finishNode(e,"AwaitExpression")};var hu=Kh.prototype;hu.raise=function(e,t){var n=zh(this.input,e);t+=" ("+n.line+":"+n.column+")";var r=new SyntaxError(t);throw r.pos=e,r.loc=n,r.raisedAt=this.pos,r},hu.raiseRecoverable=hu.raise,hu.curPosition=function(){if(this.options.locations)return new Vh(this.curLine,this.pos-this.lineStart)};var uu=Kh.prototype,cu=function(e){this.flags=e,this.var=[],this.lexical=[],this.functions=[];};uu.enterScope=function(e){this.scopeStack.push(new cu(e));},uu.exitScope=function(){this.scopeStack.pop();},uu.treatFunctionsAsVarInScope=function(e){return e.flags&Uh||!this.inModule&&1&e.flags},uu.declareName=function(e,t,n){var r=!1;if(2===t){var i=this.currentScope();r=i.lexical.indexOf(e)>-1||i.functions.indexOf(e)>-1||i.var.indexOf(e)>-1,i.lexical.push(e),this.inModule&&1&i.flags&&delete this.undefinedExports[e];}else if(4===t){this.currentScope().lexical.push(e);}else if(3===t){var s=this.currentScope();r=this.treatFunctionsAsVar?s.lexical.indexOf(e)>-1:s.lexical.indexOf(e)>-1||s.var.indexOf(e)>-1,s.functions.push(e);}else for(var o=this.scopeStack.length-1;o>=0;--o){var a=this.scopeStack[o];if(a.lexical.indexOf(e)>-1&&!(32&a.flags&&a.lexical[0]===e)||!this.treatFunctionsAsVarInScope(a)&&a.functions.indexOf(e)>-1){r=!0;break}if(a.var.push(e),this.inModule&&1&a.flags&&delete this.undefinedExports[e],a.flags&Fh)break}r&&this.raiseRecoverable(n,"Identifier '"+e+"' has already been declared");},uu.checkLocalExport=function(e){-1===this.scopeStack[0].lexical.indexOf(e.name)&&-1===this.scopeStack[0].var.indexOf(e.name)&&(this.undefinedExports[e.name]=e);},uu.currentScope=function(){return this.scopeStack[this.scopeStack.length-1]},uu.currentVarScope=function(){for(var e=this.scopeStack.length-1;;e--){var t=this.scopeStack[e];if(t.flags&Fh)return t}},uu.currentThisScope=function(){for(var e=this.scopeStack.length-1;;e--){var t=this.scopeStack[e];if(t.flags&Fh&&!(16&t.flags))return t}};var lu=function(e,t,n){this.type="",this.start=t,this.end=0,e.options.locations&&(this.loc=new Bh(e,n)),e.options.directSourceFile&&(this.sourceFile=e.options.directSourceFile),e.options.ranges&&(this.range=[t,0]);},pu=Kh.prototype;function du(e,t,n,r){return e.type=t,e.end=n,this.options.locations&&(e.loc.end=r),this.options.ranges&&(e.range[1]=n),e}pu.startNode=function(){return new lu(this,this.start,this.startLoc)},pu.startNodeAt=function(e,t){return new lu(this,e,t)},pu.finishNode=function(e,t){return du.call(this,e,t,this.lastTokEnd,this.lastTokEndLoc)},pu.finishNodeAt=function(e,t,n,r){return du.call(this,e,t,n,r)};var fu=function(e,t,n,r,i){this.token=e,this.isExpr=!!t,this.preserveSpace=!!n,this.override=r,this.generator=!!i;},mu={b_stat:new fu("{",!1),b_expr:new fu("{",!0),b_tmpl:new fu("${",!1),p_stat:new fu("(",!1),p_expr:new fu("(",!0),q_tmpl:new fu("`",!0,!0,function(e){return e.tryReadTemplateToken()}),f_stat:new fu("function",!1),f_expr:new fu("function",!0),f_expr_gen:new fu("function",!0,!1,null,!0),f_gen:new fu("function",!1,!1,null,!0)},gu=Kh.prototype;gu.initialContext=function(){return [mu.b_stat]},gu.braceIsBlock=function(e){var t=this.curContext();return t===mu.f_expr||t===mu.f_stat||(e!==wh.colon||t!==mu.b_stat&&t!==mu.b_expr?e===wh._return||e===wh.name&&this.exprAllowed?Ph.test(this.input.slice(this.lastTokEnd,this.start)):e===wh._else||e===wh.semi||e===wh.eof||e===wh.parenR||e===wh.arrow||(e===wh.braceL?t===mu.b_stat:e!==wh._var&&e!==wh._const&&e!==wh.name&&!this.exprAllowed):!t.isExpr)},gu.inGeneratorContext=function(){for(var e=this.context.length-1;e>=1;e--){var t=this.context[e];if("function"===t.token)return t.generator}return !1},gu.updateContext=function(e){var t,n=this.type;n.keyword&&e===wh.dot?this.exprAllowed=!1:(t=n.updateContext)?t.call(this,e):this.exprAllowed=n.beforeExpr;},wh.parenR.updateContext=wh.braceR.updateContext=function(){if(1!==this.context.length){var e=this.context.pop();e===mu.b_stat&&"function"===this.curContext().token&&(e=this.context.pop()),this.exprAllowed=!e.isExpr;}else this.exprAllowed=!0;},wh.braceL.updateContext=function(e){this.context.push(this.braceIsBlock(e)?mu.b_stat:mu.b_expr),this.exprAllowed=!0;},wh.dollarBraceL.updateContext=function(){this.context.push(mu.b_tmpl),this.exprAllowed=!0;},wh.parenL.updateContext=function(e){var t=e===wh._if||e===wh._for||e===wh._with||e===wh._while;this.context.push(t?mu.p_stat:mu.p_expr),this.exprAllowed=!0;},wh.incDec.updateContext=function(){},wh._function.updateContext=wh._class.updateContext=function(e){!e.beforeExpr||e===wh.semi||e===wh._else||e===wh._return&&Ph.test(this.input.slice(this.lastTokEnd,this.start))||(e===wh.colon||e===wh.braceL)&&this.curContext()===mu.b_stat?this.context.push(mu.f_stat):this.context.push(mu.f_expr),this.exprAllowed=!1;},wh.backQuote.updateContext=function(){this.curContext()===mu.q_tmpl?this.context.pop():this.context.push(mu.q_tmpl),this.exprAllowed=!1;},wh.star.updateContext=function(e){if(e===wh._function){var t=this.context.length-1;this.context[t]===mu.f_expr?this.context[t]=mu.f_expr_gen:this.context[t]=mu.f_gen;}this.exprAllowed=!0;},wh.name.updateContext=function(e){var t=!1;this.options.ecmaVersion>=6&&e!==wh.dot&&("of"===this.value&&!this.exprAllowed||"yield"===this.value&&this.inGeneratorContext())&&(t=!0),this.exprAllowed=t;};var yu="ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS",xu={9:yu,10:yu+" Extended_Pictographic"},vu="Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu",Eu="Adlam Adlm Ahom Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb",_u={9:Eu,10:Eu+" Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd"},bu={};function Au(e){var t=bu[e]={binary:Lh(xu[e]+" "+vu),nonBinary:{General_Category:Lh(vu),Script:Lh(_u[e])}};t.nonBinary.Script_Extensions=t.nonBinary.Script,t.nonBinary.gc=t.nonBinary.General_Category,t.nonBinary.sc=t.nonBinary.Script,t.nonBinary.scx=t.nonBinary.Script_Extensions;}Au(9),Au(10);var Su=Kh.prototype,Iu=function(e){this.parser=e,this.validFlags="gim"+(e.options.ecmaVersion>=6?"uy":"")+(e.options.ecmaVersion>=9?"s":""),this.unicodeProperties=bu[e.options.ecmaVersion>=10?10:e.options.ecmaVersion],this.source="",this.flags="",this.start=0,this.switchU=!1,this.switchN=!1,this.pos=0,this.lastIntValue=0,this.lastStringValue="",this.lastAssertionIsQuantifiable=!1,this.numCapturingParens=0,this.maxBackReference=0,this.groupNames=[],this.backReferenceNames=[];};function wu(e){return e<=65535?String.fromCharCode(e):(e-=65536,String.fromCharCode(55296+(e>>10),56320+(1023&e)))}function Pu(e){return 36===e||e>=40&&e<=43||46===e||63===e||e>=91&&e<=94||e>=123&&e<=125}function ku(e){return e>=65&&e<=90||e>=97&&e<=122}function Cu(e){return ku(e)||95===e}function Nu(e){return Cu(e)||$u(e)}function $u(e){return e>=48&&e<=57}function Ru(e){return e>=48&&e<=57||e>=65&&e<=70||e>=97&&e<=102}function Ou(e){return e>=65&&e<=70?e-65+10:e>=97&&e<=102?e-97+10:e-48}function Mu(e){return e>=48&&e<=55}Iu.prototype.reset=function(e,t,n){var r=-1!==n.indexOf("u");this.start=0|e,this.source=t+"",this.flags=n,this.switchU=r&&this.parser.options.ecmaVersion>=6,this.switchN=r&&this.parser.options.ecmaVersion>=9;},Iu.prototype.raise=function(e){this.parser.raiseRecoverable(this.start,"Invalid regular expression: /"+this.source+"/: "+e);},Iu.prototype.at=function(e){var t=this.source,n=t.length;if(e>=n)return -1;var r=t.charCodeAt(e);return !this.switchU||r<=55295||r>=57344||e+1>=n?r:(r<<10)+t.charCodeAt(e+1)-56613888},Iu.prototype.nextIndex=function(e){var t=this.source,n=t.length;if(e>=n)return n;var r=t.charCodeAt(e);return !this.switchU||r<=55295||r>=57344||e+1>=n?e+1:e+2},Iu.prototype.current=function(){return this.at(this.pos)},Iu.prototype.lookahead=function(){return this.at(this.nextIndex(this.pos))},Iu.prototype.advance=function(){this.pos=this.nextIndex(this.pos);},Iu.prototype.eat=function(e){return this.current()===e&&(this.advance(),!0)},Su.validateRegExpFlags=function(e){for(var t=e.validFlags,n=e.flags,r=0;r<n.length;r++){var i=n.charAt(r);-1===t.indexOf(i)&&this.raise(e.start,"Invalid regular expression flag"),n.indexOf(i,r+1)>-1&&this.raise(e.start,"Duplicate regular expression flag");}},Su.validateRegExpPattern=function(e){this.regexp_pattern(e),!e.switchN&&this.options.ecmaVersion>=9&&e.groupNames.length>0&&(e.switchN=!0,this.regexp_pattern(e));},Su.regexp_pattern=function(e){e.pos=0,e.lastIntValue=0,e.lastStringValue="",e.lastAssertionIsQuantifiable=!1,e.numCapturingParens=0,e.maxBackReference=0,e.groupNames.length=0,e.backReferenceNames.length=0,this.regexp_disjunction(e),e.pos!==e.source.length&&(e.eat(41)&&e.raise("Unmatched ')'"),(e.eat(93)||e.eat(125))&&e.raise("Lone quantifier brackets")),e.maxBackReference>e.numCapturingParens&&e.raise("Invalid escape");for(var t=0,n=e.backReferenceNames;t<n.length;t+=1){var r=n[t];-1===e.groupNames.indexOf(r)&&e.raise("Invalid named capture referenced");}},Su.regexp_disjunction=function(e){for(this.regexp_alternative(e);e.eat(124);)this.regexp_alternative(e);this.regexp_eatQuantifier(e,!0)&&e.raise("Nothing to repeat"),e.eat(123)&&e.raise("Lone quantifier brackets");},Su.regexp_alternative=function(e){for(;e.pos<e.source.length&&this.regexp_eatTerm(e););},Su.regexp_eatTerm=function(e){return this.regexp_eatAssertion(e)?(e.lastAssertionIsQuantifiable&&this.regexp_eatQuantifier(e)&&e.switchU&&e.raise("Invalid quantifier"),!0):!(e.switchU?!this.regexp_eatAtom(e):!this.regexp_eatExtendedAtom(e))&&(this.regexp_eatQuantifier(e),!0)},Su.regexp_eatAssertion=function(e){var t=e.pos;if(e.lastAssertionIsQuantifiable=!1,e.eat(94)||e.eat(36))return !0;if(e.eat(92)){if(e.eat(66)||e.eat(98))return !0;e.pos=t;}if(e.eat(40)&&e.eat(63)){var n=!1;if(this.options.ecmaVersion>=9&&(n=e.eat(60)),e.eat(61)||e.eat(33))return this.regexp_disjunction(e),e.eat(41)||e.raise("Unterminated group"),e.lastAssertionIsQuantifiable=!n,!0}return e.pos=t,!1},Su.regexp_eatQuantifier=function(e,t){return void 0===t&&(t=!1),!!this.regexp_eatQuantifierPrefix(e,t)&&(e.eat(63),!0)},Su.regexp_eatQuantifierPrefix=function(e,t){return e.eat(42)||e.eat(43)||e.eat(63)||this.regexp_eatBracedQuantifier(e,t)},Su.regexp_eatBracedQuantifier=function(e,t){var n=e.pos;if(e.eat(123)){var r=0,i=-1;if(this.regexp_eatDecimalDigits(e)&&(r=e.lastIntValue,e.eat(44)&&this.regexp_eatDecimalDigits(e)&&(i=e.lastIntValue),e.eat(125)))return -1!==i&&i<r&&!t&&e.raise("numbers out of order in {} quantifier"),!0;e.switchU&&!t&&e.raise("Incomplete quantifier"),e.pos=n;}return !1},Su.regexp_eatAtom=function(e){return this.regexp_eatPatternCharacters(e)||e.eat(46)||this.regexp_eatReverseSolidusAtomEscape(e)||this.regexp_eatCharacterClass(e)||this.regexp_eatUncapturingGroup(e)||this.regexp_eatCapturingGroup(e)},Su.regexp_eatReverseSolidusAtomEscape=function(e){var t=e.pos;if(e.eat(92)){if(this.regexp_eatAtomEscape(e))return !0;e.pos=t;}return !1},Su.regexp_eatUncapturingGroup=function(e){var t=e.pos;if(e.eat(40)){if(e.eat(63)&&e.eat(58)){if(this.regexp_disjunction(e),e.eat(41))return !0;e.raise("Unterminated group");}e.pos=t;}return !1},Su.regexp_eatCapturingGroup=function(e){if(e.eat(40)){if(this.options.ecmaVersion>=9?this.regexp_groupSpecifier(e):63===e.current()&&e.raise("Invalid group"),this.regexp_disjunction(e),e.eat(41))return e.numCapturingParens+=1,!0;e.raise("Unterminated group");}return !1},Su.regexp_eatExtendedAtom=function(e){return e.eat(46)||this.regexp_eatReverseSolidusAtomEscape(e)||this.regexp_eatCharacterClass(e)||this.regexp_eatUncapturingGroup(e)||this.regexp_eatCapturingGroup(e)||this.regexp_eatInvalidBracedQuantifier(e)||this.regexp_eatExtendedPatternCharacter(e)},Su.regexp_eatInvalidBracedQuantifier=function(e){return this.regexp_eatBracedQuantifier(e,!0)&&e.raise("Nothing to repeat"),!1},Su.regexp_eatSyntaxCharacter=function(e){var t=e.current();return !!Pu(t)&&(e.lastIntValue=t,e.advance(),!0)},Su.regexp_eatPatternCharacters=function(e){for(var t=e.pos,n=0;-1!==(n=e.current())&&!Pu(n);)e.advance();return e.pos!==t},Su.regexp_eatExtendedPatternCharacter=function(e){var t=e.current();return !(-1===t||36===t||t>=40&&t<=43||46===t||63===t||91===t||94===t||124===t)&&(e.advance(),!0)},Su.regexp_groupSpecifier=function(e){if(e.eat(63)){if(this.regexp_eatGroupName(e))return -1!==e.groupNames.indexOf(e.lastStringValue)&&e.raise("Duplicate capture group name"),void e.groupNames.push(e.lastStringValue);e.raise("Invalid group");}},Su.regexp_eatGroupName=function(e){if(e.lastStringValue="",e.eat(60)){if(this.regexp_eatRegExpIdentifierName(e)&&e.eat(62))return !0;e.raise("Invalid capture group name");}return !1},Su.regexp_eatRegExpIdentifierName=function(e){if(e.lastStringValue="",this.regexp_eatRegExpIdentifierStart(e)){for(e.lastStringValue+=wu(e.lastIntValue);this.regexp_eatRegExpIdentifierPart(e);)e.lastStringValue+=wu(e.lastIntValue);return !0}return !1},Su.regexp_eatRegExpIdentifierStart=function(e){var t=e.pos,n=e.current();return e.advance(),92===n&&this.regexp_eatRegExpUnicodeEscapeSequence(e)&&(n=e.lastIntValue),function(e){return xh(e,!0)||36===e||95===e}(n)?(e.lastIntValue=n,!0):(e.pos=t,!1)},Su.regexp_eatRegExpIdentifierPart=function(e){var t=e.pos,n=e.current();return e.advance(),92===n&&this.regexp_eatRegExpUnicodeEscapeSequence(e)&&(n=e.lastIntValue),function(e){return vh(e,!0)||36===e||95===e||8204===e||8205===e}(n)?(e.lastIntValue=n,!0):(e.pos=t,!1)},Su.regexp_eatAtomEscape=function(e){return !!(this.regexp_eatBackReference(e)||this.regexp_eatCharacterClassEscape(e)||this.regexp_eatCharacterEscape(e)||e.switchN&&this.regexp_eatKGroupName(e))||(e.switchU&&(99===e.current()&&e.raise("Invalid unicode escape"),e.raise("Invalid escape")),!1)},Su.regexp_eatBackReference=function(e){var t=e.pos;if(this.regexp_eatDecimalEscape(e)){var n=e.lastIntValue;if(e.switchU)return n>e.maxBackReference&&(e.maxBackReference=n),!0;if(n<=e.numCapturingParens)return !0;e.pos=t;}return !1},Su.regexp_eatKGroupName=function(e){if(e.eat(107)){if(this.regexp_eatGroupName(e))return e.backReferenceNames.push(e.lastStringValue),!0;e.raise("Invalid named reference");}return !1},Su.regexp_eatCharacterEscape=function(e){return this.regexp_eatControlEscape(e)||this.regexp_eatCControlLetter(e)||this.regexp_eatZero(e)||this.regexp_eatHexEscapeSequence(e)||this.regexp_eatRegExpUnicodeEscapeSequence(e)||!e.switchU&&this.regexp_eatLegacyOctalEscapeSequence(e)||this.regexp_eatIdentityEscape(e)},Su.regexp_eatCControlLetter=function(e){var t=e.pos;if(e.eat(99)){if(this.regexp_eatControlLetter(e))return !0;e.pos=t;}return !1},Su.regexp_eatZero=function(e){return 48===e.current()&&!$u(e.lookahead())&&(e.lastIntValue=0,e.advance(),!0)},Su.regexp_eatControlEscape=function(e){var t=e.current();return 116===t?(e.lastIntValue=9,e.advance(),!0):110===t?(e.lastIntValue=10,e.advance(),!0):118===t?(e.lastIntValue=11,e.advance(),!0):102===t?(e.lastIntValue=12,e.advance(),!0):114===t&&(e.lastIntValue=13,e.advance(),!0)},Su.regexp_eatControlLetter=function(e){var t=e.current();return !!ku(t)&&(e.lastIntValue=t%32,e.advance(),!0)},Su.regexp_eatRegExpUnicodeEscapeSequence=function(e){var t,n=e.pos;if(e.eat(117)){if(this.regexp_eatFixedHexDigits(e,4)){var r=e.lastIntValue;if(e.switchU&&r>=55296&&r<=56319){var i=e.pos;if(e.eat(92)&&e.eat(117)&&this.regexp_eatFixedHexDigits(e,4)){var s=e.lastIntValue;if(s>=56320&&s<=57343)return e.lastIntValue=1024*(r-55296)+(s-56320)+65536,!0}e.pos=i,e.lastIntValue=r;}return !0}if(e.switchU&&e.eat(123)&&this.regexp_eatHexDigits(e)&&e.eat(125)&&((t=e.lastIntValue)>=0&&t<=1114111))return !0;e.switchU&&e.raise("Invalid unicode escape"),e.pos=n;}return !1},Su.regexp_eatIdentityEscape=function(e){if(e.switchU)return !!this.regexp_eatSyntaxCharacter(e)||!!e.eat(47)&&(e.lastIntValue=47,!0);var t=e.current();return !(99===t||e.switchN&&107===t)&&(e.lastIntValue=t,e.advance(),!0)},Su.regexp_eatDecimalEscape=function(e){e.lastIntValue=0;var t=e.current();if(t>=49&&t<=57){do{e.lastIntValue=10*e.lastIntValue+(t-48),e.advance();}while((t=e.current())>=48&&t<=57);return !0}return !1},Su.regexp_eatCharacterClassEscape=function(e){var t=e.current();if(function(e){return 100===e||68===e||115===e||83===e||119===e||87===e}(t))return e.lastIntValue=-1,e.advance(),!0;if(e.switchU&&this.options.ecmaVersion>=9&&(80===t||112===t)){if(e.lastIntValue=-1,e.advance(),e.eat(123)&&this.regexp_eatUnicodePropertyValueExpression(e)&&e.eat(125))return !0;e.raise("Invalid property name");}return !1},Su.regexp_eatUnicodePropertyValueExpression=function(e){var t=e.pos;if(this.regexp_eatUnicodePropertyName(e)&&e.eat(61)){var n=e.lastStringValue;if(this.regexp_eatUnicodePropertyValue(e)){var r=e.lastStringValue;return this.regexp_validateUnicodePropertyNameAndValue(e,n,r),!0}}if(e.pos=t,this.regexp_eatLoneUnicodePropertyNameOrValue(e)){var i=e.lastStringValue;return this.regexp_validateUnicodePropertyNameOrValue(e,i),!0}return !1},Su.regexp_validateUnicodePropertyNameAndValue=function(e,t,n){Th(e.unicodeProperties.nonBinary,t)||e.raise("Invalid property name"),e.unicodeProperties.nonBinary[t].test(n)||e.raise("Invalid property value");},Su.regexp_validateUnicodePropertyNameOrValue=function(e,t){e.unicodeProperties.binary.test(t)||e.raise("Invalid property name");},Su.regexp_eatUnicodePropertyName=function(e){var t=0;for(e.lastStringValue="";Cu(t=e.current());)e.lastStringValue+=wu(t),e.advance();return ""!==e.lastStringValue},Su.regexp_eatUnicodePropertyValue=function(e){var t=0;for(e.lastStringValue="";Nu(t=e.current());)e.lastStringValue+=wu(t),e.advance();return ""!==e.lastStringValue},Su.regexp_eatLoneUnicodePropertyNameOrValue=function(e){return this.regexp_eatUnicodePropertyValue(e)},Su.regexp_eatCharacterClass=function(e){if(e.eat(91)){if(e.eat(94),this.regexp_classRanges(e),e.eat(93))return !0;e.raise("Unterminated character class");}return !1},Su.regexp_classRanges=function(e){for(;this.regexp_eatClassAtom(e);){var t=e.lastIntValue;if(e.eat(45)&&this.regexp_eatClassAtom(e)){var n=e.lastIntValue;!e.switchU||-1!==t&&-1!==n||e.raise("Invalid character class"),-1!==t&&-1!==n&&t>n&&e.raise("Range out of order in character class");}}},Su.regexp_eatClassAtom=function(e){var t=e.pos;if(e.eat(92)){if(this.regexp_eatClassEscape(e))return !0;if(e.switchU){var n=e.current();(99===n||Mu(n))&&e.raise("Invalid class escape"),e.raise("Invalid escape");}e.pos=t;}var r=e.current();return 93!==r&&(e.lastIntValue=r,e.advance(),!0)},Su.regexp_eatClassEscape=function(e){var t=e.pos;if(e.eat(98))return e.lastIntValue=8,!0;if(e.switchU&&e.eat(45))return e.lastIntValue=45,!0;if(!e.switchU&&e.eat(99)){if(this.regexp_eatClassControlLetter(e))return !0;e.pos=t;}return this.regexp_eatCharacterClassEscape(e)||this.regexp_eatCharacterEscape(e)},Su.regexp_eatClassControlLetter=function(e){var t=e.current();return !(!$u(t)&&95!==t)&&(e.lastIntValue=t%32,e.advance(),!0)},Su.regexp_eatHexEscapeSequence=function(e){var t=e.pos;if(e.eat(120)){if(this.regexp_eatFixedHexDigits(e,2))return !0;e.switchU&&e.raise("Invalid escape"),e.pos=t;}return !1},Su.regexp_eatDecimalDigits=function(e){var t=e.pos,n=0;for(e.lastIntValue=0;$u(n=e.current());)e.lastIntValue=10*e.lastIntValue+(n-48),e.advance();return e.pos!==t},Su.regexp_eatHexDigits=function(e){var t=e.pos,n=0;for(e.lastIntValue=0;Ru(n=e.current());)e.lastIntValue=16*e.lastIntValue+Ou(n),e.advance();return e.pos!==t},Su.regexp_eatLegacyOctalEscapeSequence=function(e){if(this.regexp_eatOctalDigit(e)){var t=e.lastIntValue;if(this.regexp_eatOctalDigit(e)){var n=e.lastIntValue;t<=3&&this.regexp_eatOctalDigit(e)?e.lastIntValue=64*t+8*n+e.lastIntValue:e.lastIntValue=8*t+n;}else e.lastIntValue=t;return !0}return !1},Su.regexp_eatOctalDigit=function(e){var t=e.current();return Mu(t)?(e.lastIntValue=t-48,e.advance(),!0):(e.lastIntValue=0,!1)},Su.regexp_eatFixedHexDigits=function(e,t){var n=e.pos;e.lastIntValue=0;for(var r=0;r<t;++r){var i=e.current();if(!Ru(i))return e.pos=n,!1;e.lastIntValue=16*e.lastIntValue+Ou(i),e.advance();}return !0};var Tu=function(e){this.type=e.type,this.value=e.value,this.start=e.start,this.end=e.end,e.options.locations&&(this.loc=new Bh(e,e.startLoc,e.endLoc)),e.options.ranges&&(this.range=[e.start,e.end]);},Du=Kh.prototype;function Lu(e){return e<=65535?String.fromCharCode(e):(e-=65536,String.fromCharCode(55296+(e>>10),56320+(1023&e)))}Du.next=function(){this.options.onToken&&this.options.onToken(new Tu(this)),this.lastTokEnd=this.end,this.lastTokStart=this.start,this.lastTokEndLoc=this.endLoc,this.lastTokStartLoc=this.startLoc,this.nextToken();},Du.getToken=function(){return this.next(),new Tu(this)},"undefined"!=typeof Symbol&&(Du[Symbol.iterator]=function(){var e=this;return {next:function(){var t=e.getToken();return {done:t.type===wh.eof,value:t}}}}),Du.curContext=function(){return this.context[this.context.length-1]},Du.nextToken=function(){var e=this.curContext();return e&&e.preserveSpace||this.skipSpace(),this.start=this.pos,this.options.locations&&(this.startLoc=this.curPosition()),this.pos>=this.input.length?this.finishToken(wh.eof):e.override?e.override(this):void this.readToken(this.fullCharCodeAtPos())},Du.readToken=function(e){return xh(e,this.options.ecmaVersion>=6)||92===e?this.readWord():this.getTokenFromCode(e)},Du.fullCharCodeAtPos=function(){var e=this.input.charCodeAt(this.pos);return e<=55295||e>=57344?e:(e<<10)+this.input.charCodeAt(this.pos+1)-56613888},Du.skipBlockComment=function(){var e,t=this.options.onComment&&this.curPosition(),n=this.pos,r=this.input.indexOf("*/",this.pos+=2);if(-1===r&&this.raise(this.pos-2,"Unterminated comment"),this.pos=r+2,this.options.locations)for(kh.lastIndex=n;(e=kh.exec(this.input))&&e.index<this.pos;)++this.curLine,this.lineStart=e.index+e[0].length;this.options.onComment&&this.options.onComment(!0,this.input.slice(n+2,r),n,this.pos,t,this.curPosition());},Du.skipLineComment=function(e){for(var t=this.pos,n=this.options.onComment&&this.curPosition(),r=this.input.charCodeAt(this.pos+=e);this.pos<this.input.length&&!Ch(r);)r=this.input.charCodeAt(++this.pos);this.options.onComment&&this.options.onComment(!1,this.input.slice(t+e,this.pos),t,this.pos,n,this.curPosition());},Du.skipSpace=function(){e:for(;this.pos<this.input.length;){var e=this.input.charCodeAt(this.pos);switch(e){case 32:case 160:++this.pos;break;case 13:10===this.input.charCodeAt(this.pos+1)&&++this.pos;case 10:case 8232:case 8233:++this.pos,this.options.locations&&(++this.curLine,this.lineStart=this.pos);break;case 47:switch(this.input.charCodeAt(this.pos+1)){case 42:this.skipBlockComment();break;case 47:this.skipLineComment(2);break;default:break e}break;default:if(!(e>8&&e<14||e>=5760&&Nh.test(String.fromCharCode(e))))break e;++this.pos;}}},Du.finishToken=function(e,t){this.end=this.pos,this.options.locations&&(this.endLoc=this.curPosition());var n=this.type;this.type=e,this.value=t,this.updateContext(n);},Du.readToken_dot=function(){var e=this.input.charCodeAt(this.pos+1);if(e>=48&&e<=57)return this.readNumber(!0);var t=this.input.charCodeAt(this.pos+2);return this.options.ecmaVersion>=6&&46===e&&46===t?(this.pos+=3,this.finishToken(wh.ellipsis)):(++this.pos,this.finishToken(wh.dot))},Du.readToken_slash=function(){var e=this.input.charCodeAt(this.pos+1);return this.exprAllowed?(++this.pos,this.readRegexp()):61===e?this.finishOp(wh.assign,2):this.finishOp(wh.slash,1)},Du.readToken_mult_modulo_exp=function(e){var t=this.input.charCodeAt(this.pos+1),n=1,r=42===e?wh.star:wh.modulo;return this.options.ecmaVersion>=7&&42===e&&42===t&&(++n,r=wh.starstar,t=this.input.charCodeAt(this.pos+2)),61===t?this.finishOp(wh.assign,n+1):this.finishOp(r,n)},Du.readToken_pipe_amp=function(e){var t=this.input.charCodeAt(this.pos+1);return t===e?this.finishOp(124===e?wh.logicalOR:wh.logicalAND,2):61===t?this.finishOp(wh.assign,2):this.finishOp(124===e?wh.bitwiseOR:wh.bitwiseAND,1)},Du.readToken_caret=function(){return 61===this.input.charCodeAt(this.pos+1)?this.finishOp(wh.assign,2):this.finishOp(wh.bitwiseXOR,1)},Du.readToken_plus_min=function(e){var t=this.input.charCodeAt(this.pos+1);return t===e?45!==t||this.inModule||62!==this.input.charCodeAt(this.pos+2)||0!==this.lastTokEnd&&!Ph.test(this.input.slice(this.lastTokEnd,this.pos))?this.finishOp(wh.incDec,2):(this.skipLineComment(3),this.skipSpace(),this.nextToken()):61===t?this.finishOp(wh.assign,2):this.finishOp(wh.plusMin,1)},Du.readToken_lt_gt=function(e){var t=this.input.charCodeAt(this.pos+1),n=1;return t===e?(n=62===e&&62===this.input.charCodeAt(this.pos+2)?3:2,61===this.input.charCodeAt(this.pos+n)?this.finishOp(wh.assign,n+1):this.finishOp(wh.bitShift,n)):33!==t||60!==e||this.inModule||45!==this.input.charCodeAt(this.pos+2)||45!==this.input.charCodeAt(this.pos+3)?(61===t&&(n=2),this.finishOp(wh.relational,n)):(this.skipLineComment(4),this.skipSpace(),this.nextToken())},Du.readToken_eq_excl=function(e){var t=this.input.charCodeAt(this.pos+1);return 61===t?this.finishOp(wh.equality,61===this.input.charCodeAt(this.pos+2)?3:2):61===e&&62===t&&this.options.ecmaVersion>=6?(this.pos+=2,this.finishToken(wh.arrow)):this.finishOp(61===e?wh.eq:wh.prefix,1)},Du.getTokenFromCode=function(e){switch(e){case 46:return this.readToken_dot();case 40:return ++this.pos,this.finishToken(wh.parenL);case 41:return ++this.pos,this.finishToken(wh.parenR);case 59:return ++this.pos,this.finishToken(wh.semi);case 44:return ++this.pos,this.finishToken(wh.comma);case 91:return ++this.pos,this.finishToken(wh.bracketL);case 93:return ++this.pos,this.finishToken(wh.bracketR);case 123:return ++this.pos,this.finishToken(wh.braceL);case 125:return ++this.pos,this.finishToken(wh.braceR);case 58:return ++this.pos,this.finishToken(wh.colon);case 63:return ++this.pos,this.finishToken(wh.question);case 96:if(this.options.ecmaVersion<6)break;return ++this.pos,this.finishToken(wh.backQuote);case 48:var t=this.input.charCodeAt(this.pos+1);if(120===t||88===t)return this.readRadixNumber(16);if(this.options.ecmaVersion>=6){if(111===t||79===t)return this.readRadixNumber(8);if(98===t||66===t)return this.readRadixNumber(2)}case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:return this.readNumber(!1);case 34:case 39:return this.readString(e);case 47:return this.readToken_slash();case 37:case 42:return this.readToken_mult_modulo_exp(e);case 124:case 38:return this.readToken_pipe_amp(e);case 94:return this.readToken_caret();case 43:case 45:return this.readToken_plus_min(e);case 60:case 62:return this.readToken_lt_gt(e);case 61:case 33:return this.readToken_eq_excl(e);case 126:return this.finishOp(wh.prefix,1)}this.raise(this.pos,"Unexpected character '"+Lu(e)+"'");},Du.finishOp=function(e,t){var n=this.input.slice(this.pos,this.pos+t);return this.pos+=t,this.finishToken(e,n)},Du.readRegexp=function(){for(var e,t,n=this.pos;;){this.pos>=this.input.length&&this.raise(n,"Unterminated regular expression");var r=this.input.charAt(this.pos);if(Ph.test(r)&&this.raise(n,"Unterminated regular expression"),e)e=!1;else{if("["===r)t=!0;else if("]"===r&&t)t=!1;else if("/"===r&&!t)break;e="\\"===r;}++this.pos;}var i=this.input.slice(n,this.pos);++this.pos;var s=this.pos,o=this.readWord1();this.containsEsc&&this.unexpected(s);var a=this.regexpState||(this.regexpState=new Iu(this));a.reset(n,i,o),this.validateRegExpFlags(a),this.validateRegExpPattern(a);var h=null;try{h=new RegExp(i,o);}catch(e){}return this.finishToken(wh.regexp,{pattern:i,flags:o,value:h})},Du.readInt=function(e,t){for(var n=this.pos,r=0,i=0,s=null==t?1/0:t;i<s;++i){var o=this.input.charCodeAt(this.pos),a=void 0;if((a=o>=97?o-97+10:o>=65?o-65+10:o>=48&&o<=57?o-48:1/0)>=e)break;++this.pos,r=r*e+a;}return this.pos===n||null!=t&&this.pos-n!==t?null:r},Du.readRadixNumber=function(e){this.pos+=2;var t=this.readInt(e);return null==t&&this.raise(this.start+2,"Expected number in radix "+e),xh(this.fullCharCodeAtPos())&&this.raise(this.pos,"Identifier directly after number"),this.finishToken(wh.num,t)},Du.readNumber=function(e){var t=this.pos;e||null!==this.readInt(10)||this.raise(t,"Invalid number");var n=this.pos-t>=2&&48===this.input.charCodeAt(t);n&&this.strict&&this.raise(t,"Invalid number"),n&&/[89]/.test(this.input.slice(t,this.pos))&&(n=!1);var r=this.input.charCodeAt(this.pos);46!==r||n||(++this.pos,this.readInt(10),r=this.input.charCodeAt(this.pos)),69!==r&&101!==r||n||(43!==(r=this.input.charCodeAt(++this.pos))&&45!==r||++this.pos,null===this.readInt(10)&&this.raise(t,"Invalid number")),xh(this.fullCharCodeAtPos())&&this.raise(this.pos,"Identifier directly after number");var i=this.input.slice(t,this.pos),s=n?parseInt(i,8):parseFloat(i);return this.finishToken(wh.num,s)},Du.readCodePoint=function(){var e;if(123===this.input.charCodeAt(this.pos)){this.options.ecmaVersion<6&&this.unexpected();var t=++this.pos;e=this.readHexChar(this.input.indexOf("}",this.pos)-this.pos),++this.pos,e>1114111&&this.invalidStringToken(t,"Code point out of bounds");}else e=this.readHexChar(4);return e},Du.readString=function(e){for(var t="",n=++this.pos;;){this.pos>=this.input.length&&this.raise(this.start,"Unterminated string constant");var r=this.input.charCodeAt(this.pos);if(r===e)break;92===r?(t+=this.input.slice(n,this.pos),t+=this.readEscapedChar(!1),n=this.pos):(Ch(r,this.options.ecmaVersion>=10)&&this.raise(this.start,"Unterminated string constant"),++this.pos);}return t+=this.input.slice(n,this.pos++),this.finishToken(wh.string,t)};var Vu={};Du.tryReadTemplateToken=function(){this.inTemplateElement=!0;try{this.readTmplToken();}catch(e){if(e!==Vu)throw e;this.readInvalidTemplateToken();}this.inTemplateElement=!1;},Du.invalidStringToken=function(e,t){if(this.inTemplateElement&&this.options.ecmaVersion>=9)throw Vu;this.raise(e,t);},Du.readTmplToken=function(){for(var e="",t=this.pos;;){this.pos>=this.input.length&&this.raise(this.start,"Unterminated template");var n=this.input.charCodeAt(this.pos);if(96===n||36===n&&123===this.input.charCodeAt(this.pos+1))return this.pos!==this.start||this.type!==wh.template&&this.type!==wh.invalidTemplate?(e+=this.input.slice(t,this.pos),this.finishToken(wh.template,e)):36===n?(this.pos+=2,this.finishToken(wh.dollarBraceL)):(++this.pos,this.finishToken(wh.backQuote));if(92===n)e+=this.input.slice(t,this.pos),e+=this.readEscapedChar(!0),t=this.pos;else if(Ch(n)){switch(e+=this.input.slice(t,this.pos),++this.pos,n){case 13:10===this.input.charCodeAt(this.pos)&&++this.pos;case 10:e+="\n";break;default:e+=String.fromCharCode(n);}this.options.locations&&(++this.curLine,this.lineStart=this.pos),t=this.pos;}else++this.pos;}},Du.readInvalidTemplateToken=function(){for(;this.pos<this.input.length;this.pos++)switch(this.input[this.pos]){case"\\":++this.pos;break;case"$":if("{"!==this.input[this.pos+1])break;case"`":return this.finishToken(wh.invalidTemplate,this.input.slice(this.start,this.pos))}this.raise(this.start,"Unterminated template");},Du.readEscapedChar=function(e){var t=this.input.charCodeAt(++this.pos);switch(++this.pos,t){case 110:return "\n";case 114:return "\r";case 120:return String.fromCharCode(this.readHexChar(2));case 117:return Lu(this.readCodePoint());case 116:return "\t";case 98:return "\b";case 118:return "\v";case 102:return "\f";case 13:10===this.input.charCodeAt(this.pos)&&++this.pos;case 10:return this.options.locations&&(this.lineStart=this.pos,++this.curLine),"";default:if(t>=48&&t<=55){var n=this.input.substr(this.pos-1,3).match(/^[0-7]+/)[0],r=parseInt(n,8);return r>255&&(n=n.slice(0,-1),r=parseInt(n,8)),this.pos+=n.length-1,t=this.input.charCodeAt(this.pos),"0"===n&&56!==t&&57!==t||!this.strict&&!e||this.invalidStringToken(this.pos-1-n.length,e?"Octal literal in template string":"Octal literal in strict mode"),String.fromCharCode(r)}return Ch(t)?"":String.fromCharCode(t)}},Du.readHexChar=function(e){var t=this.pos,n=this.readInt(16,e);return null===n&&this.invalidStringToken(t,"Bad character escape sequence"),n},Du.readWord1=function(){this.containsEsc=!1;for(var e="",t=!0,n=this.pos,r=this.options.ecmaVersion>=6;this.pos<this.input.length;){var i=this.fullCharCodeAtPos();if(vh(i,r))this.pos+=i<=65535?1:2;else{if(92!==i)break;this.containsEsc=!0,e+=this.input.slice(n,this.pos);var s=this.pos;117!==this.input.charCodeAt(++this.pos)&&this.invalidStringToken(this.pos,"Expecting Unicode escape sequence \\uXXXX"),++this.pos;var o=this.readCodePoint();(t?xh:vh)(o,r)||this.invalidStringToken(s,"Invalid Unicode escape"),e+=Lu(o),n=this.pos;}t=!1;}return e+this.input.slice(n,this.pos)},Du.readWord=function(){var e=this.readWord1(),t=wh.name;return this.keywords.test(e)&&(this.containsEsc&&this.raiseRecoverable(this.start,"Escape sequence in keyword "+e),t=Sh[e]),this.finishToken(t,e)};var Bu=function(e){return e&&e.default||e}(Object.freeze({version:"6.1.1",parse:function(e,t){return Kh.parse(e,t)},parseExpressionAt:function(e,t,n){return Kh.parseExpressionAt(e,t,n)},tokenizer:function(e,t){return Kh.tokenizer(e,t)},Parser:Kh,defaultOptions:jh,Position:Vh,SourceLocation:Bh,getLineInfo:zh,Node:lu,TokenType:Eh,tokTypes:wh,keywordTypes:Sh,TokContext:fu,tokContexts:mu,isIdentifierChar:vh,isIdentifierStart:xh,Token:Tu,isNewLine:Ch,lineBreak:Ph,lineBreakG:kh,nonASCIIwhitespace:Nh}));const zu=Bu.tokTypes,ju=Bu.isIdentifierStart;var Wu=function(e){return class extends e{parseLiteral(e){const t=super.parseLiteral(e);return 110==t.raw.charCodeAt(t.raw.length-1)&&(t.bigint=this.getNumberInput(t.start,t.end)),t}readRadixNumber(e){let t=this.pos;this.pos+=2;let n=this.readInt(e);if(null===n&&this.raise(this.start+2,`Expected number in radix ${e}`),110==this.input.charCodeAt(this.pos)){let e=this.getNumberInput(t,this.pos);n="undefined"!=typeof BigInt?BigInt(e):null,++this.pos;}else ju(this.fullCharCodeAtPos())&&this.raise(this.pos,"Identifier directly after number");return this.finishToken(zu.num,n)}readNumber(e){let t=this.pos;if(e)return super.readNumber(e);if(48===this.input.charCodeAt(t)&&110!==this.input.charCodeAt(t+1))return super.readNumber(e);if(null===this.readInt(10)&&this.raise(t,"Invalid number"),110!=this.input.charCodeAt(this.pos))return this.pos=t,super.readNumber(e);let n=this.getNumberInput(t,this.pos),r="undefined"!=typeof BigInt?BigInt(n):null;return ++this.pos,this.finishToken(zu.num,r)}getNumberInput(e,t){return super.getNumberInput?super.getNumberInput(e,t):this.input.slice(e,t)}}};const Uu="Import";function Fu(e){return class extends e{parseStatement(e,t,n){return this.type===wh._import&&function(){return /^(\s|\/\/.*|\/\*[^]*?\*\/)*\(/.test(this.input.slice(this.pos))}.call(this)?this.parseExpressionStatement(this.startNode(),this.parseExpression()):super.parseStatement(e,t,n)}parseExprAtom(e){return this.type===wh._import?function(){const e=this.startNode();return this.next(),this.type!==wh.parenL&&this.unexpected(),this.finishNode(e,Uu)}.call(this):super.parseExprAtom(e)}}}wh._import.startsExpr=!0;const qu=Bu.tokTypes,Gu=/(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g,Hu=e=>{Gu.lastIndex=e.pos;let t=Gu.exec(e.input),n=e.pos+t[0].length;return "."===e.input.slice(n,n+1)};var Ku=function(e){return class extends e{parseExprAtom(e){if(this.type!==qu._import||!Hu(this))return super.parseExprAtom(e);this.options.allowImportExportEverywhere||this.inModule||this.raise(this.start,"'import' and 'export' may appear only with 'sourceType: module'");let t=this.startNode();return t.meta=this.parseIdent(!0),this.expect(qu.dot),t.property=this.parseIdent(!0),"meta"!==t.property.name&&this.raiseRecoverable(t.property.start,"The only valid meta property for import is import.meta"),this.containsEsc&&this.raiseRecoverable(t.property.start,'"meta" in import.meta must not contain escape sequences'),this.finishNode(t,"MetaProperty")}parseStatement(e,t,n){if(this.type!==qu._import||!Hu(this))return super.parseStatement(e,t,n);let r=this.startNode(),i=this.parseExpression();return this.parseExpressionStatement(r,i)}}};class Yu extends Qe{constructor(){super("undefined");}getLiteralValueAtPath(){}}class Xu extends vt{constructor(){super(),this.variables.undefined=new Yu;}findVariable(e){return this.variables[e]?this.variables[e]:this.variables[e]=new oo(e)}}const Qu=()=>({paths:Object.create(null),tracked:!1,unknownPath:null});class Ju{constructor(){this.entityPaths=new Map;}track(e,t){let n=this.entityPaths.get(e);n||(n=Qu(),this.entityPaths.set(e,n));let r,i=0;for(;i<t.length;){const e=t[i];"string"==typeof e?(r=n.paths[e])||(r=Qu(),n.paths[e]=r):(r=n.unknownPath)||(r=Qu(),n.unknownPath=r),n=r,i++;}const s=n.tracked;return n.tracked=!0,s}}function Zu(e,t,n){let r;do{const e=C();r?e.update(r):e.update(n),r=e.digest("hex").substr(0,8);}while(t.has(r));return t.set(r,e),r}function ec(e,t,n){return void 0===e.source&&So(function(e){return {code:wo.ASSET_SOURCE_MISSING,message:`Plugin error creating asset "${e.name}" - no asset source set.`}}(e)),e.fileName?e.fileName:nh(th(n,"assetFileNames",t=>{switch(t){case"hash":const n=C();return n.update(t),n.update(":"),n.update(e.source),n.digest("hex").substr(0,8);case"name":return e.name.substr(0,e.name.length-pt(e.name).length);case"extname":return pt(e.name);case"ext":return pt(e.name).substr(1)}}),t)}function tc(e,t,n){return {emitAsset(r,i){"string"==typeof r&&Ao(r)||So(function(e){return {code:wo.INVALID_ASSET_NAME,message:`Plugin error creating asset, name "${e}" is not a plain (non relative or absolute URL) string name.`}}(r));const s={name:r,source:i,fileName:void 0};return t&&void 0!==i&&nc(s,t,n),Zu(s,e,r)},setAssetSource(r,i){const s=e.get(r);return s?void 0!==s.source?So(function(e){return {code:wo.ASSET_SOURCE_ALREADY_SET,message:`Plugin error - Unable to set the source for asset "${e.name}", source already set.`}}(s)):"string"==typeof i||i?(s.source=i,void(t&&nc(s,t,n))):So(function(e){return {code:wo.ASSET_SOURCE_MISSING,message:`Plugin error creating asset "${e.name}", setAssetSource call without a source.`}}(s)):So(function(e){return {code:wo.ASSET_NOT_FOUND,message:`Plugin error - Unable to set the source for unknown asset "${e}".`}}(r))},getAssetFileName(t){const n=e.get(t);return n?void 0===n.fileName?So(function(e){return {code:wo.ASSET_NOT_FINALISED,message:`Plugin error - Unable to get file name for asset "${e.name}". Ensure that the source is set and that generate is called first.`}}(n)):n.fileName:So(function(e){return {code:wo.ASSET_NOT_FOUND,message:`Plugin error - Unable to get file name for unknown asset "${e}".`}}(t))}}}function nc(e,t,n){const r=ec(e,t,n);e.fileName=r,t[r]={fileName:r,isAsset:!0,source:e.source};}var rc;!function(e){e[e.LOAD_AND_PARSE=0]="LOAD_AND_PARSE",e[e.ANALYSE=1]="ANALYSE",e[e.GENERATE=2]="GENERATE";}(rc||(rc={}));const ic=e=>(...t)=>{throw new Error(`Cannot use fs.${e} inside browser`)},sc=ic("lstatSync"),oc=ic("readdirSync"),ac=ic("readFileSync"),hc=ic("realpathSync"),uc=ic("writeFile");function cc(e,t){try{const n=sc(e);if(!t&&n.isSymbolicLink())return cc(hc(e),t);if(t&&n.isSymbolicLink()||n.isFile()){const t=ct(e);if(-1!==oc(lt(e)).indexOf(t))return e}}catch(e){}}function lc(e){return function(t,n){return "undefined"==typeof process&&So({code:"MISSING_PROCESS",message:"It looks like you're using Rollup in a non-Node.js environment. This means you must supply a plugin with custom resolveId and load functions",url:"https://rollupjs.org/guide/en#a-simple-example"}),void 0===n||at(t)||"."===t[0]?function(e,t){let n=cc(e,t);return n||((n=cc(e+".mjs",t))?n:n=cc(e+".js",t))}(ft(n?lt(n):ft(),t),e):null}}const pc=(e,t="URL")=>`new ${t}(${e}).href`,dc=e=>`(document.currentScript && document.currentScript.src || new URL('${e}', document.baseURI).href)`,fc=e=>(t,n)=>{const r=e(n);return null===t?`({ url: ${r} })`:"url"===t?r:"undefined"},mc={amd:fc(()=>pc("module.uri, document.baseURI")),cjs:fc(e=>`(typeof document === 'undefined' ? ${pc("'file:' + __filename","(require('u' + 'rl').URL)")} : ${dc(e)})`),iife:fc(e=>dc(e)),system:e=>null===e?"module.meta":`module.meta.${e}`,umd:fc(e=>`(typeof document === 'undefined' ? ${pc("'file:' + __filename","(require('u' + 'rl').URL)")} : ${dc(e)})`)},gc=e=>pc(`(document.currentScript && document.currentScript.src || document.baseURI) + '/../${e}'`),yc={amd:e=>pc(`module.uri + '/../${e}', document.baseURI`),cjs:e=>`(typeof document === 'undefined' ? ${pc(`'file:' + __dirname + '/${e}'`,"(require('u' + 'rl').URL)")} : ${gc(e)})`,es:e=>pc(`'${e}', import.meta.url`),iife:e=>gc(e),system:e=>pc(`'${e}', module.meta.url`),umd:e=>`(typeof document === 'undefined' ? ${pc(`'file:' + __dirname + '/${e}'`,"(require('u' + 'rl').URL)")} : ${gc(e)})`},xc={ongenerate:"generateBundle",onwrite:"generateBundle",transformBundle:"renderChunk",transformChunk:"renderChunk"};function vc(e,n,r,i){const s=[...n.plugins||[],(o=n.preserveSymlinks,{name:"Rollup Core",resolveId:lc(o),load:e=>ac(e,"utf-8"),resolveFileUrl:({relativePath:e,format:t})=>yc[t](e),resolveImportMeta(e,{chunkId:t,format:n}){const r=mc[n]&&mc[n](e,t);if(r)return r}})];var o;const{emitAsset:a,getAssetFileName:h,setAssetSource:u}=tc(e.assetsById),c={};let l=!1;const p=s.map((n,s)=>{let o,p=!0;if("string"!=typeof n.cacheKey&&("string"!=typeof n.name||c[n.name]?p=!1:c[n.name]=!0),!l&&(n.load||n.transform||n.transformBundle||n.transformChunk)&&(l=!0),r)if(p){const e=n.cacheKey||n.name;o=function(e){return {has(t){const n=e[t];return !!n&&(n[0]=0,!0)},get(t){const n=e[t];if(n)return n[0]=0,n[1]},set(t,n){e[t]=[0,n];},delete:t=>delete e[t]}}(r[e]||(r[e]=Object.create(null)));}else o=bc(n.name);else o=Ec;let d=!1;function f(e,t){return d||(m.warn({code:"PLUGIN_WATCHER_DEPRECATED",message:"this.watcher usage is deprecated in plugins. Use the watchChange plugin hook and this.addWatchFile() instead."}),d=!0),i.on(e,t)}const m={addWatchFile(t){e.phase>=rc.GENERATE&&this.error({code:wo.INVALID_ROLLUP_PHASE,message:"Cannot call addWatchFile after the build has finished."}),e.watchFiles[t]=!0;},cache:o,emitAsset:a,emitChunk(t,n){return e.phase>rc.LOAD_AND_PARSE&&this.error({code:wo.INVALID_ROLLUP_PHASE,message:"Cannot call emitChunk after module loading has finished."}),e.moduleLoader.addEntryModuleAndGetReferenceId({alias:n&&n.name||null,unresolvedId:t})},error:e=>("string"==typeof e&&(e={message:e}),e.code&&(e.pluginCode=e.code),e.code="PLUGIN_ERROR",e.plugin=n.name||`Plugin at position ${s+1}`,So(e)),isExternal:(t,n,r=!1)=>e.moduleLoader.isExternal(t,n,r),getAssetFileName:h,getChunkFileName:t=>e.moduleLoader.getChunkFileName(t),getModuleInfo(t){const n=e.moduleById.get(t);if(null==n)throw new Error(`Unable to find module ${t}`);return {hasModuleSideEffects:n.moduleSideEffects,id:n.id,importedIds:n instanceof mt?[]:n.sources.map(e=>n.resolvedIds[e].id),isEntry:n instanceof Fa&&n.isEntryPoint,isExternal:n instanceof mt}},meta:{rollupVersion:t},get moduleIds(){return e.moduleById.keys()},parse:e.contextParse,resolveId:(t,n)=>e.moduleLoader.resolveId(t,n).then(e=>e&&e.id),resolve:(t,n,r)=>e.moduleLoader.resolveId(t,n,r&&r.skipSelf?s:null),setAssetSource:u,warn(t){"string"==typeof t&&(t={message:t}),t.code&&(t.pluginCode=t.code),t.code="PLUGIN_WARNING",t.plugin=n.name||`Plugin at position ${s+1}`,e.warn(t);},watcher:i?Object.assign({},i,{addListener:f,on:f}):void 0};return m});function d(e,t,n,r=!1,i){const o=s[n];let a=p[n];const h=o[e];if(!h)return;const u=xc[e];if(u&&a.warn(Ac(e,u,o,n)),i&&(!(a=i(a,o))||a===p[n]))throw new Error("Internal Rollup error: hookContext must return a new context object.");try{if("function"!=typeof h){if(r)return h;So({code:"INVALID_PLUGIN_HOOK",message:`Error running plugin hook ${e} for ${o.name||`Plugin at position ${n+1}`}, expected a function hook.`});}return h.apply(a,t)}catch(t){"string"==typeof t&&(t={message:t}),"PLUGIN_ERROR"!==t.code&&(t.code&&(t.pluginCode=t.code),t.code="PLUGIN_ERROR"),t.plugin=o.name||`Plugin at position ${n+1}`,t.hook=e,So(t);}}function f(e,t,n,r=!1,i){const o=s[n];let a=p[n];const h=o[e];if(!h)return;const u=xc[e];if(u&&a.warn(Ac(e,u,o,n)),i&&(!(a=i(a,o))||a===p[n]))throw new Error("Internal Rollup error: hookContext must return a new context object.");return Promise.resolve().then(()=>{if("function"!=typeof h){if(r)return h;So({code:"INVALID_PLUGIN_HOOK",message:`Error running plugin hook ${e} for ${o.name||`Plugin at position ${n+1}`}, expected a function hook.`});}return h.apply(a,t)}).catch(t=>{"string"==typeof t&&(t={message:t}),"PLUGIN_ERROR"!==t.code&&(t.code&&(t.pluginCode=t.code),t.code="PLUGIN_ERROR"),t.plugin=o.name||`Plugin at position ${n+1}`,t.hook=e,So(t);})}return {emitAsset:a,getAssetFileName:h,hasLoadersOrTransforms:l,hookSeq(e,t,n){let r=Promise.resolve();for(let i=0;i<s.length;i++)r=r.then(()=>f(e,t,i,!1,n));return r},hookSeqSync(e,t,n){for(let r=0;r<s.length;r++)d(e,t,r,!1,n);},hookFirst(e,t,n,r){let i=Promise.resolve();for(let o=0;o<s.length;o++)r!==o&&(i=i.then(r=>null!=r?r:f(e,t,o,!1,n)));return i},hookFirstSync(e,t,n){for(let r=0;r<s.length;r++){const i=d(e,t,r,!1,n);if(null!=i)return i}return null},hookParallel(e,t,n){const r=[];for(let i=0;i<s.length;i++){const s=f(e,t,i,!1,n);s&&r.push(s);}return Promise.all(r).then(()=>{})},hookReduceArg0(e,[t,...n],r,i){let o=Promise.resolve(t);for(let t=0;t<s.length;t++)o=o.then(o=>{const a=f(e,[o,...n],t,!1,i);return a?a.then(e=>r.call(p[t],o,e,s[t])):o});return o},hookReduceArg0Sync(e,[t,...n],r,i){for(let o=0;o<s.length;o++){const a=d(e,[t,...n],o,!1,i);t=r.call(p[o],t,a,s[o]);}return t},hookReduceValue(e,t,n,r,i){let o=Promise.resolve(t);for(let t=0;t<s.length;t++)o=o.then(o=>{const a=f(e,n,t,!0,i);return a?a.then(e=>r.call(p[t],o,e,s[t])):o});return o}}}const Ec={has:()=>!1,get(){},set(){},delete:()=>!1};function _c(e){So(e?{code:"DUPLICATE_PLUGIN_NAME",message:`The plugin name ${e} is being used twice in the same build. Plugin names must be distinct or provide a cacheKey (please post an issue to the plugin if you are a plugin user).`}:{code:"ANONYMOUS_PLUGIN_CACHE",message:"A plugin is trying to use the Rollup cache but is not declaring a plugin name or cacheKey."});}const bc=e=>({has:()=>(_c(e),!1),get(){_c(e);},set(){_c(e);},delete:()=>(_c(e),!1)});function Ac(e,t,n,r){return {code:e.toUpperCase()+"_HOOK_DEPRECATED",message:`The ${e} hook used by plugin ${n.name||`at position ${r+1}`} is deprecated. The ${t} hook should be used instead.`}}function Sc(e,t){return ht(t)?ft(e,"..",t):t}function Ic(e){if(!0===e)return ()=>!0;if("function"==typeof e)return (t,...n)=>!t.startsWith("\0")&&e(t,...n)||!1;if(e){const t=new Set(Array.isArray(e)?e:e?[e]:[]);return e=>t.has(e)}return ()=>!1}function wc(e,t,n){if("boolean"==typeof e)return ()=>e;if("no-external"===e)return (e,t)=>!t;if("function"==typeof e)return (t,n)=>!!t.startsWith("\0")||!1!==e(t,n);if(Array.isArray(e)){const t=new Set(e);return e=>t.has(e)}var r,i;e&&n.warn((r="treeshake.moduleSideEffects",i='please use one of false, "no-external", a function or an array',{code:wo.INVALID_OPTION,message:`Invalid value for option "${r}" - ${i}.`}));const s=Ic(t);return (e,t)=>!(t&&s(e))}class Pc{constructor(e,t,n,r,i,s,o){this.entriesByReferenceId=new Map,this.entryModules=[],this.latestLoadModulesPromise=Promise.resolve(),this.manualChunkModules={},this.loadEntryModule=(({alias:e,unresolvedId:t},n)=>this.pluginDriver.hookFirst("resolveId",[t,void 0]).then(r=>{if(!1===r||r&&"object"==typeof r&&r.external)return So(function(e){return {code:wo.UNRESOLVED_ENTRY,message:`Entry module cannot be external (${bo(e)}).`}}(t));const i=r&&"object"==typeof r?r.id:r;return "string"==typeof i?this.fetchModule(i,void 0,!0,n).then(t=>{if(null!==e){if(null!==t.chunkAlias&&t.chunkAlias!==e)return So(Po(t.id,e,t.chunkAlias));t.chunkAlias=e;}return t}):So(function(e){return {code:wo.UNRESOLVED_ENTRY,message:`Could not resolve entry module (${bo(e)}).`}}(t))})),this.graph=e,this.modulesById=t,this.pluginDriver=n,this.isExternal=Ic(r),this.hasModuleSideEffects=wc(s,o,e),this.getManualChunk="function"==typeof i?i:()=>null;}addEntryModuleAndGetReferenceId(e){const t={module:null,name:e.unresolvedId},n=Zu(t,this.entriesByReferenceId,e.unresolvedId);return this.addEntryModules([e],!1).then(({newEntryModules:[e]})=>{t.module=e;}).catch(()=>{}),n}addEntryModules(e,t){const n=Promise.all(e.map(e=>this.loadEntryModule(e,!0))).then(e=>{for(const n of e){n.isUserDefinedEntryPoint=n.isUserDefinedEntryPoint||t,this.entryModules.find(e=>e.id===n.id)||this.entryModules.push(n);}return e});return this.awaitLoadModulesPromise(n).then(e=>({entryModules:this.entryModules,manualChunkModulesByAlias:this.manualChunkModules,newEntryModules:e}))}addManualChunks(e){const t=[];for(const n of Object.keys(e)){const r=e[n];for(const e of r)t.push({alias:null,unresolvedId:e,manualChunkAlias:n});}const n=Promise.all(t.map(e=>this.loadEntryModule(e,!1))).then(e=>{for(let n=0;n<e.length;n++)this.addToManualChunk(t[n].manualChunkAlias,e[n]);});return this.awaitLoadModulesPromise(n)}getChunkFileName(e){const t=this.entriesByReferenceId.get(e);if(!t)return So((n=e,{code:wo.CHUNK_NOT_FOUND,message:`Plugin error - Unable to get file name for unknown chunk "${n}".`}));var n;const r=t.module&&(t.module.facadeChunk?t.module.facadeChunk.id:t.module.chunk.id);return r||So((i=t,{code:wo.CHUNK_NOT_GENERATED,message:`Plugin error - Unable to get file name for chunk "${i.name}". Ensure that generate is called first.`}));var i;}resolveId(e,t,n){return Promise.resolve(this.isExternal(e,t,!1)?{id:e,external:!0}:this.pluginDriver.hookFirst("resolveId",[e,t],null,n)).then(n=>this.normalizeResolveIdResult(n,t,e))}addToManualChunk(e,t){null!==t.manualChunkAlias&&t.manualChunkAlias!==e&&So(Po(t.id,e,t.manualChunkAlias)),t.manualChunkAlias=e,this.manualChunkModules[e]||(this.manualChunkModules[e]=[]),this.manualChunkModules[e].push(t);}awaitLoadModulesPromise(e){this.latestLoadModulesPromise=Promise.all([e,this.latestLoadModulesPromise]);const t=()=>{const e=this.latestLoadModulesPromise;return e.then(()=>{if(this.latestLoadModulesPromise!==e)return t()})};return t().then(()=>e)}fetchAllDependencies(e){const t=Promise.all(e.getDynamicImportExpressions().map((t,n)=>this.resolveDynamicImport(t,e.id).then(t=>{if(null===t)return;const r=e.dynamicImports[n];if("string"!=typeof t)return this.fetchResolvedDependency(bo(t.id),e.id,t).then(e=>{r.resolution=e;});r.resolution=t;})));return t.catch(()=>{}),Promise.all(e.sources.map(t=>this.resolveAndFetchDependency(e,t))).then(()=>t)}fetchModule(e,t,n,r){const i=this.modulesById.get(e);if(i){if(i instanceof mt)throw new Error(`Cannot fetch external module ${e}`);return i.isEntryPoint=i.isEntryPoint||r,Promise.resolve(i)}const s=new Fa(this.graph,e,n,r);this.modulesById.set(e,s);const o=this.getManualChunk(e);return "string"==typeof o&&this.addToManualChunk(o,s),Da("load modules",3),Promise.resolve(this.pluginDriver.hookFirst("load",[e])).catch(n=>{La("load modules",3);let r=`Could not load ${e}`;throw t&&(r+=` (imported by ${t})`),r+=`: ${n.message}`,n.message=r,n}).then(t=>(La("load modules",3),"string"==typeof t?{code:t}:t&&"object"==typeof t&&"string"==typeof t.code?t:So(function(e){return {code:wo.BAD_LOADER,message:`Error loading ${bo(e)}: plugin load hook should return a string, a { code, map } object, or nothing/null`}}(e)))).then(t=>{const n=this.graph.cachedModules.get(e);if(n&&!n.customTransformCache&&n.originalCode===t.code){if(n.transformAssets)for(const e of n.transformAssets)this.pluginDriver.emitAsset(e.name,e.source);return n}return "boolean"==typeof t.moduleSideEffects&&(s.moduleSideEffects=t.moduleSideEffects),function(e,t,n){const r=n.id,i=[],s="string"==typeof t.map?JSON.parse(t.map):t.map;s&&"string"==typeof s.mappings&&(s.mappings=O(s.mappings));const o=e.pluginDriver.emitAsset,a=t.code;let h,u,c,l,p=t.ast,d=!1,f=null;const m=t.code;let g;return e.pluginDriver.hookReduceArg0("transform",[m,r],function(t,s,o){if(!d&&c.used&&(d=!0),d){if(s&&"object"==typeof s&&Array.isArray(s.dependencies))for(const t of s.dependencies){const n=ft(lt(r),t);e.watchFiles[n]||(e.watchFiles[n]=!0);}}else if(u.length&&(n.transformAssets=u),s&&"object"==typeof s&&Array.isArray(s.dependencies)){l.warnedTransformDependencies||this.warn({code:"TRANSFORM_DEPENDENCIES_DEPRECATED",message:'Returning "dependencies" from plugin transform hook is deprecated for using this.addWatchFile() instead.'}),l.warnedTransformDependencies=!0,h||(h=[]);for(const e of s.dependencies)h.push(ft(lt(r),e));}if("string"==typeof s)s={ast:void 0,code:s,map:void 0};else{if(!s||"object"!=typeof s)return t;"string"==typeof s.map&&(s.map=JSON.parse(s.map)),"boolean"==typeof s.moduleSideEffects&&(f=s.moduleSideEffects);}return s.map&&"string"==typeof s.map.mappings&&(s.map.mappings=O(s.map.mappings)),null!==s.map&&i.push(s.map||{missing:!0,plugin:o.name}),p=s.ast,s.code},(t,n)=>{let i;return (l=n).cacheKey?d=!0:c=function(e){const t={used:!1,cache:void 0};return t.cache={has:n=>(t.used=!0,e.has(n)),get:n=>(t.used=!0,e.get(n)),set:(n,r)=>(t.used=!0,e.set(n,r)),delete:n=>(t.used=!0,e.delete(n))},t}(t.cache),({assets:u,emitAsset:i}=function(e,t){const n=[];return {assets:n,emitAsset:(r,i)=>{const s=t(r,i),o=e.get(s);return n.push({fileName:void 0,name:o.name,source:o.source}),s}}}(e.assetsById,o)),Object.assign({},t,{cache:c?c.cache:t.cache,warn(e,n){"string"==typeof e&&(e={message:e}),n&&Io(e,n,m,r),e.id=r,e.hook="transform",t.warn(e);},error:(e,n)=>("string"==typeof e&&(e={message:e}),n&&Io(e,n,m,r),e.id=r,e.hook="transform",t.error(e)),emitAsset:i,addWatchFile(e){h||(h=[]),h.push(e),t.addWatchFile(e);},setAssetSource(e,n){if(t.setAssetSource(e,n),!d&&!g)try{this.error({code:"INVALID_SETASSETSOURCE",message:"setAssetSource cannot be called in transform for caching reasons. Use emitAsset with a source, or call setAssetSource in another hook."});}catch(e){g=e;}}})}).catch(e=>{"string"==typeof e&&(e={message:e}),"PLUGIN_ERROR"!==e.code&&(e.code&&(e.pluginCode=e.code),e.code="PLUGIN_ERROR"),e.id=r,So(e);}).then(e=>{if(!d&&g)throw g;return {ast:p,code:e,customTransformCache:d,moduleSideEffects:f,originalCode:a,originalSourcemap:s,sourcemapChain:i,transformDependencies:h}})}(this.graph,t,s)}).then(t=>(s.setSource(t),this.modulesById.set(e,s),this.fetchAllDependencies(s).then(()=>{for(const e in s.exports)"default"!==e&&(s.exportsAll[e]=s.id);return s.exportAllSources.forEach(e=>{const t=s.resolvedIds[e].id,n=this.modulesById.get(t);if(!(n instanceof mt))for(const e in n.exportsAll)e in s.exportsAll?this.graph.warn(ko(e,s,n)):s.exportsAll[e]=n.exportsAll[e];}),s})))}fetchResolvedDependency(e,t,n){if(n.external){this.modulesById.has(n.id)||this.modulesById.set(n.id,new mt(this.graph,n.id,n.moduleSideEffects));const r=this.modulesById.get(n.id);return r instanceof mt?Promise.resolve(r):So(function(e,t){return {code:wo.INVALID_EXTERNAL_ID,message:`'${e}' is imported as an external by ${bo(t)}, but is already an existing non-external module id.`}}(e,t))}return this.fetchModule(n.id,t,n.moduleSideEffects,!1)}handleMissingImports(e,t,n){return null===e?(ht(t)&&So(function(e,t){return {code:wo.UNRESOLVED_IMPORT,message:`Could not resolve '${e}' from ${bo(t)}`}}(t,n)),this.graph.warn(function(e,t){return {code:wo.UNRESOLVED_IMPORT,importer:bo(t),message:`'${e}' is imported by ${bo(t)}, but could not be resolved – treating it as an external dependency`,source:e,url:"https://rollupjs.org/guide/en#warning-treating-module-as-external-dependency"}}(t,n)),{id:t,external:!0,moduleSideEffects:!0}):e}normalizeResolveIdResult(e,t,n){let r="",i=!1,s=null;if(e)"object"==typeof e?(r=e.id,e.external&&(i=!0),"boolean"==typeof e.moduleSideEffects&&(s=e.moduleSideEffects)):(r=e,this.isExternal(r,t,!0)&&(i=!0)),i&&(r=Sc(t,r));else{if(r=Sc(t,n),!1!==e&&!this.isExternal(r,t,!0))return null;i=!0;}return {external:i,id:r,moduleSideEffects:"boolean"==typeof s?s:this.hasModuleSideEffects(r,i)}}resolveAndFetchDependency(e,t){return Promise.resolve(e.resolvedIds[t]||this.resolveId(t,e.id).then(n=>this.handleMissingImports(n,t,e.id))).then(n=>(e.resolvedIds[t]=n,this.fetchResolvedDependency(t,e.id,n)))}resolveDynamicImport(e,t){return this.pluginDriver.hookFirst("resolveDynamicImport",[e,t]).then(n=>"string"!=typeof e?"string"==typeof n?n:n?Object.assign({external:!1,moduleSideEffects:!0},n):null:null==n?this.resolveId(e,t).then(n=>this.handleMissingImports(n,e,t)):this.handleMissingImports(this.normalizeResolveIdResult(n,t,e),e,t))}}const kc=97,Cc=48;function Nc(e){return e<10?String.fromCharCode(Cc+e):String.fromCharCode(kc+(e-10))}function $c(e){let t="";for(let n=0;n<e.length;n++){const r=e[n];t+=Nc(r>>4),t+=Nc(15&r);}return t}function Rc(e){const t=new Uint8Array(e);for(let e=0;e<t.length;e++)t[e]=512*Math.random();return t}function Oc(e){return "string"==typeof e?[{alias:null,unresolvedId:e}]:Array.isArray(e)?e.map(e=>({alias:null,unresolvedId:e})):Object.keys(e).map(t=>({alias:t,unresolvedId:e[t]}))}class Mc{constructor(e,t){if(this.assetsById=new Map,this.curChunkIndex=0,this.moduleById=new Map,this.needsTreeshakingPass=!1,this.phase=rc.LOAD_AND_PARSE,this.watchFiles=Object.create(null),this.externalModules=[],this.modules=[],this.curChunkIndex=0,this.deoptimizationTracker=new Ju,this.cachedModules=new Map,e.cache&&e.cache.modules)for(const t of e.cache.modules)this.cachedModules.set(t.id,t);if(!1!==e.cache){this.pluginCache=e.cache&&e.cache.plugins||Object.create(null);for(const e in this.pluginCache){const t=this.pluginCache[e];for(const e of Object.keys(t))t[e][0]++;}}if(this.preserveModules=e.preserveModules,this.cacheExpiry=e.experimentalCacheExpiry,this.treeshake=!1!==e.treeshake,this.treeshake&&(this.treeshakingOptions=e.treeshake?{annotations:!1!==e.treeshake.annotations,moduleSideEffects:e.treeshake.moduleSideEffects,propertyReadSideEffects:!1!==e.treeshake.propertyReadSideEffects,pureExternalModules:e.treeshake.pureExternalModules}:{annotations:!0,moduleSideEffects:!0,propertyReadSideEffects:!0,pureExternalModules:!1}),this.contextParse=((e,t={})=>this.acornParser.parse(e,Object.assign({},ja,t,this.acornOptions))),this.pluginDriver=vc(this,e,this.pluginCache,t),t){const e=e=>this.pluginDriver.hookSeqSync("watchChange",[e]);t.on("change",e),t.once("restart",()=>{t.removeListener("change",e);});}this.shimMissingExports=e.shimMissingExports,this.scope=new Xu,this.context=String(e.context);const n=e.moduleContext;if("function"==typeof n)this.getModuleContext=(e=>n(e)||this.context);else if("object"==typeof n){const e=new Map;for(const t in n)e.set(ft(t),n[t]);this.getModuleContext=(t=>e.get(t)||this.context);}else this.getModuleContext=(()=>this.context);this.onwarn=e.onwarn||function(){const e=Object.create(null);return t=>{const n=t.toString();n in e||(console.error(n),e[n]=!0);}}(),this.acornOptions=e.acorn||{};const r=[];r.push(Fu),r.push(Ku),r.push(Wu),e.experimentalTopLevelAwait&&(this.acornOptions.allowAwaitOutsideFunction=!0);const i=e.acornInjectPlugins;r.push(...Array.isArray(i)?i:i?[i]:[]),this.acornParser=Kh.extend(...r),this.moduleLoader=new Pc(this,this.moduleById,this.pluginDriver,e.external,"function"==typeof e.manualChunks&&e.manualChunks,this.treeshake?this.treeshakingOptions.moduleSideEffects:null,!!this.treeshake&&this.treeshakingOptions.pureExternalModules);}build(e,t,n){return Da("parse modules",2),Promise.all([this.moduleLoader.addEntryModules(Oc(e),!0),t&&"object"==typeof t&&this.moduleLoader.addManualChunks(t)]).then(([{entryModules:e,manualChunkModulesByAlias:t}])=>{if(0===e.length)throw new Error("You must supply options.input to rollup");for(const e of this.moduleById.values())e instanceof Fa?(this.modules.push(e),this.watchFiles[e.id]=!0):this.externalModules.push(e);if(La("parse modules",2),this.phase=rc.ANALYSE,Da("analyse dependency graph",2),this.link(e),La("analyse dependency graph",2),Da("mark included statements",2),n&&e.length>1)throw new Error("Internal Error: can only inline dynamic imports for single-file builds.");for(const t of e)t.includeAllExports();this.includeMarked(this.modules);for(const e of this.externalModules)e.warnUnusedImports();La("mark included statements",2),Da("generate chunks",2),this.preserveModules||n||function(e,t){let n,r,i;const s=new Set,o=[],a=e=>{n.manualChunkAlias?(e.manualChunkAlias=n.manualChunkAlias,e.entryPointsHash=r):function(e,t){for(let n=0;n<e.length;n++)e[n]=e[n]^t[n];}(e.entryPointsHash,r);for(const t of e.dependencies)t instanceof mt||i.has(t.id)||(i.add(t.id),s.has(t.id)||t.manualChunkAlias||a(t));for(const{resolution:t}of e.dynamicImports)t instanceof Fa&&t.dynamicallyImportedBy.length>0&&!t.manualChunkAlias&&o.push(t);};if(t)for(const e of Object.keys(t))for(n of(r=Rc(10),t[e]))i=new Set(n.id),a(n);for(n of e)s.add(n.id),r=Rc(10),i=new Set(n.id),n.manualChunkAlias||a(n);for(n of o)s.has(n.id)||(s.add(n.id),r=Rc(10),i=new Set(n.id),a(n));}(e,t);let r=[];if(this.preserveModules)for(const e of this.modules){const t=new oh(this,[e]);!e.isEntryPoint&&t.isEmpty||(t.entryModules=[e]),r.push(t);}else{const e={};for(const t of this.modules){const n=$c(t.entryPointsHash),r=e[n];r?r.push(t):e[n]=[t];}for(const t in e){const n=e[t];Ja(n);const i=new oh(this,n);r.push(i);}}for(const e of r)e.link();r=r.filter(sh);for(const e of r)(this.preserveModules||e.entryModules.length>0)&&e.generateEntryExportsOrMarkAsTainted();const i=[];if(!this.preserveModules)for(const e of r)for(const t of e.entryModules)if(e.facadeModule!==t){const e=new oh(this,[]);e.turnIntoFacade(t),i.push(e);}return La("generate chunks",2),this.phase=rc.GENERATE,r.concat(i)})}finaliseAssets(e){const t=Object.create(null);return this.assetsById.forEach(n=>{void 0!==n.source&&nc(n,t,e);}),t}getCache(){for(const e in this.pluginCache){const t=this.pluginCache[e];let n=!0;for(const e of Object.keys(t))t[e][0]>=this.cacheExpiry?delete t[e]:n=!1;n&&delete this.pluginCache[e];}return {modules:this.modules.map(e=>e.toJSON()),plugins:this.pluginCache}}includeMarked(e){if(this.treeshake){let t=1;do{Da(`treeshaking pass ${t}`,3),this.needsTreeshakingPass=!1;for(const t of e)t.isExecuted&&t.include();La(`treeshaking pass ${t++}`,3);}while(this.needsTreeshakingPass)}else for(const t of e)t.includeAllInBundle();}warn(e){e.toString=(()=>{let t="";return e.plugin&&(t+=`(${e.plugin} plugin) `),e.loc&&(t+=`${bo(e.loc.file)} (${e.loc.line}:${e.loc.column}) `),t+=e.message}),this.onwarn(e);}link(e){for(const e of this.modules)e.linkDependencies();const{orderedModules:t,cyclePaths:n}=function(e){let t=0;const n=[],r={},i=[],s=[],o={},a=e=>{if(!r[e.id]){if(e instanceof mt)return e.execIndex=t++,void(r[e.id]=!0);for(const t of e.dependencies)t.id in o?r[t.id]||n.push(Za(t.id,e.id,o)):(o[t.id]=e.id,a(t));for(const{resolution:t}of e.dynamicImports)t instanceof Fa&&-1===s.indexOf(t)&&s.push(t);e.execIndex=t++,r[e.id]=!0,i.push(e);}};for(const t of e)o[t.id]||(o[t.id]=null,a(t));for(const e of s)o[e.id]||(o[e.id]=null,a(e));return {orderedModules:i,cyclePaths:n}}(e);for(const e of n)this.warn({code:"CIRCULAR_DEPENDENCY",importer:e[0],message:`Circular dependency: ${e.join(" -> ")}`});this.modules=t;for(const e of this.modules)e.bindReferences();this.warnForMissingExports();}warnForMissingExports(){for(const e of this.modules)for(const t of Object.keys(e.importDescriptions)){const n=e.importDescriptions[t];"*"===n.name||n.module.getVariableForExportName(n.name)||e.warn({code:"NON_EXISTENT_EXPORT",message:`Non-existent export '${n.name}' is imported from ${bo(n.module.id)}`,name:n.name,source:n.module.id},n.start);}}}function Tc(e){switch(typeof e){case"function":return e();case"string":return e;default:return ""}}const Dc=(e,t)=>t?`${e}\n${t}`:e,Lc=(e,t)=>t?`${e}\n\n${t}`:e;function Vc(e,t){So({code:"INVALID_EXPORT_OPTION",message:`'${e}' was specified for output.exports, but entry module has following exports: ${t.join(", ")}`});}function Bc(e,{exports:t,name:n,format:r}){const i=e.getExportNames();return "default"===t?1===i.length&&"default"===i[0]||Vc("default",i):"none"===t&&i.length&&Vc("none",i),t&&"auto"!==t||(0===i.length?t="none":1===i.length&&"default"===i[0]?t="default":(null!==e.facadeModule&&e.facadeModule.isEntryPoint&&"es"!==r&&-1!==i.indexOf("default")&&e.graph.warn({code:"MIXED_EXPORTS",message:`Using named and default exports together. Consumers of your bundle will have to use ${n||"bundle"}['default'] to access the default export, which may not be what you want. Use \`output.exports: 'named'\` to disable this warning`,url:"https://rollupjs.org/guide/en#output-exports"}),t="named")),/(?:default|named|none)/.test(t)||So({code:"INVALID_EXPORT_OPTION",message:"output.exports must be 'default', 'named', 'none', 'auto', or left unspecified (defaults to 'auto')",url:"https://rollupjs.org/guide/en#output-exports"}),t}const zc=(e,t)=>(n,r)=>void 0!==t[n]?t[n]:void 0!==e[n]?e[n]:r,jc=e=>e&&"object"!=typeof e?{}:e,Wc=(e,t,n)=>{const r=jc(t[n]),i=jc(e[n]);return void 0!==r?r&&i?Object.assign({},i,r):r:i},Uc=(e,t,n=(e=>{"string"==typeof e?console.warn(e):console.warn(e.message);}))=>t.silent?()=>{}:e.onwarn?t=>e.onwarn(t,n):n,Fc=(e,t)=>{const n=e.external;return "function"==typeof n?(e,...r)=>n(e,...r)||-1!==t.external.indexOf(e):("string"==typeof e.external?[n]:Array.isArray(n)?n:[]).concat(t.external)},qc={c:"config",d:"dir",e:"external",f:"format",g:"globals",h:"help",i:"input",m:"sourcemap",n:"name",o:"file",v:"version",w:"watch"};function Gc({config:e={},command:t={},defaultOnWarnHandler:n}){const r=function(e){const t=e.external&&"string"==typeof e.external?e.external.split(","):[];return Object.assign({},e,{external:t,globals:"string"==typeof e.globals?e.globals.split(",").reduce((e,n)=>{const[r,i]=n.split(":");return e[r]=i,-1===t.indexOf(r)&&t.push(r),e},Object.create(null)):void 0})}(t),i=function(e,t={external:[],globals:void 0},n){const r=zc(e,t),i={acorn:e.acorn,acornInjectPlugins:e.acornInjectPlugins,cache:r("cache"),chunkGroupingSize:r("chunkGroupingSize",5e3),context:e.context,experimentalCacheExpiry:r("experimentalCacheExpiry",10),experimentalOptimizeChunks:r("experimentalOptimizeChunks"),experimentalTopLevelAwait:r("experimentalTopLevelAwait"),external:Fc(e,t),inlineDynamicImports:r("inlineDynamicImports",!1),input:r("input",[]),manualChunks:r("manualChunks"),moduleContext:e.moduleContext,onwarn:Uc(e,t,n),perf:r("perf",!1),plugins:e.plugins,preserveModules:r("preserveModules"),preserveSymlinks:r("preserveSymlinks"),shimMissingExports:r("shimMissingExports"),treeshake:Wc(e,t,"treeshake"),watch:e.watch};i.cache&&i.cache.cache&&(i.cache=i.cache.cache);return i}(e,r,n);r.output&&Object.assign(r,r.output);const s=e.output,o=Array.isArray(s)?s:s?[s]:[];0===o.length&&o.push({});const a=o.map(e=>(function(e,t={}){const n=zc(e,t);let r=n("format");switch(r){case"esm":case"module":r="es";break;case"commonjs":r="cjs";}return {amd:Object.assign({},e.amd,t.amd),assetFileNames:n("assetFileNames"),banner:n("banner"),chunkFileNames:n("chunkFileNames"),compact:n("compact",!1),dir:n("dir"),dynamicImportFunction:n("dynamicImportFunction"),entryFileNames:n("entryFileNames"),esModule:n("esModule",!0),exports:n("exports"),extend:n("extend"),file:n("file"),footer:n("footer"),format:"esm"===r?"es":r,freeze:n("freeze",!0),globals:n("globals"),indent:n("indent",!0),interop:n("interop",!0),intro:n("intro"),name:n("name"),namespaceToStringTag:n("namespaceToStringTag",!1),noConflict:n("noConflict"),outro:n("outro"),paths:n("paths"),preferConst:n("preferConst"),sourcemap:n("sourcemap"),sourcemapExcludeSources:n("sourcemapExcludeSources"),sourcemapFile:n("sourcemapFile"),sourcemapPathTransform:n("sourcemapPathTransform"),strict:n("strict",!0)}})(e,r)),h=[],u=Object.keys(i);Hc(h,Object.keys(e),u,"input option",/^output$/);const c=Object.keys(a[0]);Hc(h,a.reduce((e,t)=>e.concat(Object.keys(t)),[]),c,"output option");const l=c.filter(e=>"sourcemapPathTransform"!==e);return Hc(h,Object.keys(r),u.concat(l,Object.keys(qc),"config","environment","silent"),"CLI flag",/^_|output|(config.*)$/),{inputOptions:i,optionError:h.length>0?h.join("\n"):null,outputOptions:a}}function Hc(e,t,n,r,i=/$./){const s=t.filter(e=>-1===n.indexOf(e)&&!i.test(e));s.length>0&&e.push(`Unknown ${r}: ${s.join(", ")}. Allowed options: ${n.sort().join(", ")}`);}const Kc={get(){throw new Error("bundle.generate(...) now returns a Promise instead of a { code, map } object")}};function Yc(e,n){return n.options&&n.options.call({meta:{rollupVersion:t}},e)||e}let Xc;function Qc(e){try{const t=function(e){if(!e)throw new Error("You must supply an options object to rollup");let{inputOptions:t,optionError:n}=Gc({config:e});n&&t.onwarn({message:n,code:"UNKNOWN_OPTION"});const r=t.plugins;return t.plugins=Array.isArray(r)?r.filter(Boolean):r?[r]:[],(t=t.plugins.reduce(Yc,t)).inlineDynamicImports?(t.preserveModules&&So({code:"INVALID_OPTION",message:'"preserveModules" does not support the "inlineDynamicImports" option.'}),t.manualChunks&&So({code:"INVALID_OPTION",message:'"manualChunks" option is not supported for "inlineDynamicImports".'}),t.experimentalOptimizeChunks&&So({code:"INVALID_OPTION",message:'"experimentalOptimizeChunks" option is not supported for "inlineDynamicImports".'}),(t.input instanceof Array&&t.input.length>1||"object"==typeof t.input&&Object.keys(t.input).length>1)&&So({code:"INVALID_OPTION",message:'Multiple inputs are not supported for "inlineDynamicImports".'})):t.preserveModules&&(t.manualChunks&&So({code:"INVALID_OPTION",message:'"preserveModules" does not support the "manualChunks" option.'}),t.experimentalOptimizeChunks&&So({code:"INVALID_OPTION",message:'"preserveModules" does not support the "experimentalOptimizeChunks" option.'})),t}(e);za(t);const n=new Mc(t,Xc);Xc=void 0;const r=!1!==e.cache;return delete t.cache,delete e.cache,Da("BUILD",1),n.pluginDriver.hookParallel("buildStart",[t]).then(()=>n.build(t.input,t.manualChunks,t.inlineDynamicImports)).then(e=>n.pluginDriver.hookParallel("buildEnd",[]).then(()=>e),e=>n.pluginDriver.hookParallel("buildEnd",[e]).then(()=>{throw e})).then(e=>{La("BUILD",1);let i=!1;function s(r){return function(e,t,n,r){if(!t)throw new Error("You must supply an options object");const i=Gc({config:{output:Object.assign({},t,t.output,e.output)}});if(i.optionError)throw new Error(i.optionError);const s=i.outputOptions[0],o=r.hookReduceArg0Sync("outputOptions",[s],(e,t)=>t||e);a=o,"es6"===a.format&&So({message:'The "es6" output format is deprecated – use "esm" instead',url:"https://rollupjs.org/guide/en#output-format"}),["amd","cjs","system","es","iife","umd"].indexOf(a.format)<0&&So({message:'You must specify "output.format", which can be one of "amd", "cjs", "system", "esm", "iife" or "umd".',url:"https://rollupjs.org/guide/en#output-format"}),"string"==typeof o.file&&("string"==typeof o.dir&&So({code:"INVALID_OPTION",message:'You must set either "output.file" for a single-file build or "output.dir" when generating multiple chunks.'}),e.preserveModules&&So({code:"INVALID_OPTION",message:'You must set "output.dir" instead of "output.file" when using the "preserveModules" option.'}),"object"!=typeof e.input||Array.isArray(e.input)||So({code:"INVALID_OPTION",message:'You must set "output.dir" instead of "output.file" when providing named inputs.'}));var a;n&&("umd"!==o.format&&"iife"!==o.format||So({code:"INVALID_OPTION",message:"UMD and IIFE output formats are not supported for code-splitting builds."}),"string"==typeof o.file&&So({code:"INVALID_OPTION",message:'You must set "output.dir" instead of "output.file" when generating multiple chunks.'}));return o}(t,r,e.length>1,n.pluginDriver)}function o(r,s){Da("GENERATE",1);const o=r.assetFileNames||"assets/[name]-[hash][extname]",a=n.finaliseAssets(o),h=function(e){if(0===e.length)return "/";if(1===e.length)return lt(e[0]);const t=e.slice(1).reduce((e,t)=>{const n=t.split(/\/+|\\+/);let r;for(r=0;e[r]===n[r]&&r<Math.min(e.length,n.length);r++);return e.slice(0,r)},e[0].split(/\/+|\\+/));return t.length>1?t.join("/"):"/"}(function(e){const t=[];for(const n of e)for(const e of n.entryModules)at(e.id)&&t.push(e.id);return t}(e));return n.pluginDriver.hookParallel("renderStart",[]).then(()=>(function(e,t){const n=e.pluginDriver;return Promise.all([n.hookReduceValue("banner",Tc(t.banner),[],Dc),n.hookReduceValue("footer",Tc(t.footer),[],Dc),n.hookReduceValue("intro",Tc(t.intro),[],Lc),n.hookReduceValue("outro",Tc(t.outro),[],Lc)]).then(([e,t,n,r])=>(n&&(n+="\n\n"),r&&(r=`\n\n${r}`),e.length&&(e+="\n"),t.length&&(t="\n"+t),{intro:n,outro:r,banner:e,footer:t})).catch(e=>{So({code:"ADDON_ERROR",message:`Could not retrieve ${e.hook}. Check configuration of ${e.plugin}.\n\tError Message: ${e.message}`});})})(n,r)).then(s=>{for(const n of e)t.preserveModules||n.generateInternalExports(r),n.facadeModule&&n.facadeModule.isEntryPoint&&(n.exportMode=Bc(n,r));for(const t of e)t.preRender(r,h);!i&&t.experimentalOptimizeChunks&&(!function(e,t,n,r){for(let i=0;i<e.length;i++){const s=e[i],o=[];if(s.visitStaticDependenciesUntilCondition(e=>{e instanceof oh&&o.push(e);}),o.length<2)continue;let a=1,h=!0,u=void 0,c=o[0],l=o[1];const p=e=>!(null!==e.facadeModule||null!==e.manualChunkAlias||!l||null!==l.facadeModule||e.getRenderedSourceLength()>n);do{if(h){p(c)&&(h=!1);continue}let s=n-u.getRenderedSourceLength()-c.getRenderedSourceLength();if(s<=0){p(c)||(h=!0);continue}const d=new Set;c.visitStaticDependenciesUntilCondition(e=>d.add(e));const f=new Set([c,u]);if(u.visitStaticDependenciesUntilCondition(e=>e!==c&&e!==u&&!d.has(e)&&(e instanceof mt||(s-=e.getRenderedSourceLength())<=0||void f.add(e)))){p(c)||(h=!0);continue}if(c.visitStaticDependenciesUntilCondition(e=>!f.has(e)&&(e instanceof mt||(s-=e.getRenderedSourceLength())<=0||void 0))){p(c)||(h=!0);continue}const m=e.indexOf(c);m<=i&&i--,e.splice(m,1),u.merge(c,e,t,r),o.splice(--a,1),c=u,l&&!p(l)&&(h=!0);}while(u=c,c=l,l=o[++a],c)}}(e,r,t.chunkGroupingSize,h),i=!0),function(e,t,n,r,i){const s={},[o,a]=e.reduce(([e,t],n)=>((n.facadeModule&&n.facadeModule.isUserDefinedEntryPoint?e:t).push(n),[e,t]),[[],[]]),h=o.concat(a);for(let e=0;e<h.length;e++){const o=h[e];if(n.file)o.id=ct(n.file);else if(t.preserveModules)o.generateIdPreserveModules(r,s);else{let e,t;o.facadeModule&&o.facadeModule.isUserDefinedEntryPoint?(e=n.entryFileNames||"[name].js",t="output.entryFileNames"):(e=n.chunkFileNames||"[name]-[hash].js",t="output.chunkFileNames"),o.generateId(e,t,i,n,s);}s[o.id]=!0;}}(e,t,r,h,s);for(let t=0;t<e.length;t++){const n=e[t],r=n.facadeModule;a[n.id]={code:void 0,dynamicImports:n.getDynamicImportIds(),exports:n.getExportNames(),facadeModuleId:r&&r.id,fileName:n.id,imports:n.getImportIds(),isDynamicEntry:null!==r&&r.dynamicallyImportedBy.length>0,isEntry:null!==r&&r.isEntryPoint,map:void 0,modules:n.renderedModules,get name(){return n.getChunkName()}};}return Promise.all(e.map(e=>{const t=a[e.id];return e.render(r,s,t).then(e=>(t.code=e.code,t.map=e.map,n.pluginDriver.hookParallel("ongenerate",[Object.assign({bundle:t},r),t])))})).then(()=>{})}).catch(e=>n.pluginDriver.hookParallel("renderError",[e]).then(()=>{throw e})).then(()=>{const e=new Map(n.assetsById),t=tc(e,a,o);return n.pluginDriver.hookSeq("generateBundle",[r,a,s],e=>Object.assign({},e,t)).then(()=>{e.forEach(e=>{void 0===e.fileName&&nc(e,a,o);});})}).then(()=>(La("GENERATE",1),a))}const a={cache:r?n.getCache():void 0,generate:e=>{const t=o(s(e),!1).then(e=>el(e));return Object.defineProperty(t,"code",Kc),Object.defineProperty(t,"map",Kc),t},watchFiles:Object.keys(n.watchFiles),write:e=>{const r=s(e);return r.dir||r.file||So({code:"MISSING_OPTION",message:'You must specify "output.file" or "output.dir" for the build.'}),o(r,!0).then(e=>{let i=0;for(const t of Object.keys(e)){if(!e[t].isAsset&&++i>1)break}return i>1&&(r.sourcemapFile&&So({code:"INVALID_OPTION",message:'"output.sourcemapFile" is only supported for single-file builds.'}),"string"==typeof r.file&&So({code:"INVALID_OPTION",message:'When building multiple chunks, the "output.dir" option must be used, not "output.file".'+("string"!=typeof t.input||!0===t.inlineDynamicImports?"":' To inline dynamic imports, set the "inlineDynamicImports" option.')})),Promise.all(Object.keys(e).map(t=>(function(e,t,n,r){const i=ft(r.dir||lt(r.file),n.fileName);let s,o;if(tl(n))o=n.source;else if(o=n.code,r.sourcemap&&n.map){let e;"inline"===r.sourcemap?e=n.map.toUrl():(e=`${ct(n.fileName)}.map`,s=uc(`${i}.map`,n.map.toString())),o+=`//# ${Sa}=${e}\n`;}return uc(i,o).then(()=>s).then(()=>!tl(n)&&e.pluginDriver.hookSeq("onwrite",[Object.assign({bundle:t},r),n])).then(()=>{})})(n,a,e[t],r))).then(()=>n.pluginDriver.hookParallel("writeBundle",[e])).then(()=>el(e))})}};return !0===t.perf&&(a.getTimings=Ta),a})}catch(e){return Promise.reject(e)}}var Jc;function Zc(e){return e.isAsset?Jc.ASSET:e.isEntry?Jc.ENTRY_CHUNK:Jc.SECONDARY_CHUNK}function el(e){return {output:Object.keys(e).map(t=>e[t]).sort((e,t)=>{const n=Zc(e),r=Zc(t);return n===r?0:n<r?-1:1})}}function tl(e){return !0===e.isAsset}!function(e){e[e.ENTRY_CHUNK=0]="ENTRY_CHUNK",e[e.SECONDARY_CHUNK=1]="SECONDARY_CHUNK",e[e.ASSET=2]="ASSET";}(Jc||(Jc={}));

	// Reserved word lists for various dialects of the language

	var reservedWords = {
	  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
	  5: "class enum extends super const export import",
	  6: "enum",
	  strict: "implements interface let package private protected public static yield",
	  strictBind: "eval arguments"
	};

	// And the keywords

	var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

	var keywords = {
	  5: ecma5AndLessKeywords,
	  6: ecma5AndLessKeywords + " const class extends export import super"
	};

	var keywordRelationalOperator = /^in(stanceof)?$/;

	// ## Character categories

	// Big ugly regular expressions that match characters in the
	// whitespace, identifier, and identifier-start categories. These
	// are only applied when a character is found to actually have a
	// code point above 128.
	// Generated by `bin/generate-identifier-regex.js`.

	var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u08a0-\u08b4\u08b6-\u08bd\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fef\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7b9\ua7f7-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab65\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
	var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d3-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1cf7-\u1cf9\u1dc0-\u1df9\u1dfb-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";

	var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
	var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

	nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;

	// These are a run-length and offset encoded representation of the
	// >0xffff code points that are a valid part of identifiers. The
	// offset starts at 0x10000, and each pair of numbers represents an
	// offset to the next range, and then a size of the range. They were
	// generated by bin/generate-identifier-regex.js

	// eslint-disable-next-line comma-spacing
	var astralIdentifierStartCodes = [0,11,2,25,2,18,2,1,2,14,3,13,35,122,70,52,268,28,4,48,48,31,14,29,6,37,11,29,3,35,5,7,2,4,43,157,19,35,5,35,5,39,9,51,157,310,10,21,11,7,153,5,3,0,2,43,2,1,4,0,3,22,11,22,10,30,66,18,2,1,11,21,11,25,71,55,7,1,65,0,16,3,2,2,2,28,43,28,4,28,36,7,2,27,28,53,11,21,11,18,14,17,111,72,56,50,14,50,14,35,477,28,11,0,9,21,190,52,76,44,33,24,27,35,30,0,12,34,4,0,13,47,15,3,22,0,2,0,36,17,2,24,85,6,2,0,2,3,2,14,2,9,8,46,39,7,3,1,3,21,2,6,2,1,2,4,4,0,19,0,13,4,159,52,19,3,54,47,21,1,2,0,185,46,42,3,37,47,21,0,60,42,86,26,230,43,117,63,32,0,257,0,11,39,8,0,22,0,12,39,3,3,20,0,35,56,264,8,2,36,18,0,50,29,113,6,2,1,2,37,22,0,26,5,2,1,2,31,15,0,328,18,270,921,103,110,18,195,2749,1070,4050,582,8634,568,8,30,114,29,19,47,17,3,32,20,6,18,689,63,129,68,12,0,67,12,65,1,31,6129,15,754,9486,286,82,395,2309,106,6,12,4,8,8,9,5991,84,2,70,2,1,3,0,3,1,3,3,2,11,2,0,2,6,2,64,2,3,3,7,2,6,2,27,2,3,2,4,2,0,4,6,2,339,3,24,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,7,4149,196,60,67,1213,3,2,26,2,1,2,0,3,0,2,9,2,3,2,0,2,0,7,0,5,0,2,0,2,0,2,2,2,1,2,0,3,0,2,0,2,0,2,0,2,0,2,1,2,0,3,3,2,6,2,3,2,3,2,0,2,9,2,16,6,2,2,4,2,16,4421,42710,42,4148,12,221,3,5761,15,7472,3104,541];

	// eslint-disable-next-line comma-spacing
	var astralIdentifierCodes = [509,0,227,0,150,4,294,9,1368,2,2,1,6,3,41,2,5,0,166,1,574,3,9,9,525,10,176,2,54,14,32,9,16,3,46,10,54,9,7,2,37,13,2,9,6,1,45,0,13,2,49,13,9,3,4,9,83,11,7,0,161,11,6,9,7,3,56,1,2,6,3,1,3,2,10,0,11,1,3,6,4,4,193,17,10,9,5,0,82,19,13,9,214,6,3,8,28,1,83,16,16,9,82,12,9,9,84,14,5,9,243,14,166,9,280,9,41,6,2,3,9,0,10,10,47,15,406,7,2,7,17,9,57,21,2,13,123,5,4,0,2,1,2,6,2,0,9,9,49,4,2,1,2,4,9,9,330,3,19306,9,135,4,60,6,26,9,1016,45,17,3,19723,1,5319,4,4,5,9,7,3,6,31,3,149,2,1418,49,513,54,5,49,9,0,15,0,23,4,2,14,1361,6,2,16,3,6,2,1,2,4,2214,6,110,6,6,9,792487,239];

	// This has a complexity linear to the value of the code. The
	// assumption is that looking up astral identifier characters is
	// rare.
	function isInAstralSet(code, set) {
	  var pos = 0x10000;
	  for (var i = 0; i < set.length; i += 2) {
	    pos += set[i];
	    if (pos > code) { return false }
	    pos += set[i + 1];
	    if (pos >= code) { return true }
	  }
	}

	// Test whether a given character code starts an identifier.

	function isIdentifierStart(code, astral) {
	  if (code < 65) { return code === 36 }
	  if (code < 91) { return true }
	  if (code < 97) { return code === 95 }
	  if (code < 123) { return true }
	  if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code)) }
	  if (astral === false) { return false }
	  return isInAstralSet(code, astralIdentifierStartCodes)
	}

	// Test whether a given character is part of an identifier.

	function isIdentifierChar(code, astral) {
	  if (code < 48) { return code === 36 }
	  if (code < 58) { return true }
	  if (code < 65) { return false }
	  if (code < 91) { return true }
	  if (code < 97) { return code === 95 }
	  if (code < 123) { return true }
	  if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code)) }
	  if (astral === false) { return false }
	  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
	}

	// ## Token types

	// The assignment of fine-grained, information-carrying type objects
	// allows the tokenizer to store the information it has about a
	// token in a way that is very cheap for the parser to look up.

	// All token type variables start with an underscore, to make them
	// easy to recognize.

	// The `beforeExpr` property is used to disambiguate between regular
	// expressions and divisions. It is set on all token types that can
	// be followed by an expression (thus, a slash after them would be a
	// regular expression).
	//
	// The `startsExpr` property is used to check if the token ends a
	// `yield` expression. It is set on all token types that either can
	// directly start an expression (like a quotation mark) or can
	// continue an expression (like the body of a string).
	//
	// `isLoop` marks a keyword as starting a loop, which is important
	// to know when parsing a label, in order to allow or disallow
	// continue jumps to that label.

	var TokenType = function TokenType(label, conf) {
	  if ( conf === void 0 ) conf = {};

	  this.label = label;
	  this.keyword = conf.keyword;
	  this.beforeExpr = !!conf.beforeExpr;
	  this.startsExpr = !!conf.startsExpr;
	  this.isLoop = !!conf.isLoop;
	  this.isAssign = !!conf.isAssign;
	  this.prefix = !!conf.prefix;
	  this.postfix = !!conf.postfix;
	  this.binop = conf.binop || null;
	  this.updateContext = null;
	};

	function binop(name, prec) {
	  return new TokenType(name, {beforeExpr: true, binop: prec})
	}
	var beforeExpr = {beforeExpr: true};
	var startsExpr = {startsExpr: true};

	// Map keyword names to token types.

	var keywords$1 = {};

	// Succinct definitions of keyword token types
	function kw(name, options) {
	  if ( options === void 0 ) options = {};

	  options.keyword = name;
	  return keywords$1[name] = new TokenType(name, options)
	}

	var types = {
	  num: new TokenType("num", startsExpr),
	  regexp: new TokenType("regexp", startsExpr),
	  string: new TokenType("string", startsExpr),
	  name: new TokenType("name", startsExpr),
	  eof: new TokenType("eof"),

	  // Punctuation token types.
	  bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
	  bracketR: new TokenType("]"),
	  braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
	  braceR: new TokenType("}"),
	  parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
	  parenR: new TokenType(")"),
	  comma: new TokenType(",", beforeExpr),
	  semi: new TokenType(";", beforeExpr),
	  colon: new TokenType(":", beforeExpr),
	  dot: new TokenType("."),
	  question: new TokenType("?", beforeExpr),
	  arrow: new TokenType("=>", beforeExpr),
	  template: new TokenType("template"),
	  invalidTemplate: new TokenType("invalidTemplate"),
	  ellipsis: new TokenType("...", beforeExpr),
	  backQuote: new TokenType("`", startsExpr),
	  dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

	  // Operators. These carry several kinds of properties to help the
	  // parser use them properly (the presence of these properties is
	  // what categorizes them as operators).
	  //
	  // `binop`, when present, specifies that this operator is a binary
	  // operator, and will refer to its precedence.
	  //
	  // `prefix` and `postfix` mark the operator as a prefix or postfix
	  // unary operator.
	  //
	  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
	  // binary operators with a very low precedence, that should result
	  // in AssignmentExpression nodes.

	  eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
	  assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
	  incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
	  prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
	  logicalOR: binop("||", 1),
	  logicalAND: binop("&&", 2),
	  bitwiseOR: binop("|", 3),
	  bitwiseXOR: binop("^", 4),
	  bitwiseAND: binop("&", 5),
	  equality: binop("==/!=/===/!==", 6),
	  relational: binop("</>/<=/>=", 7),
	  bitShift: binop("<</>>/>>>", 8),
	  plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
	  modulo: binop("%", 10),
	  star: binop("*", 10),
	  slash: binop("/", 10),
	  starstar: new TokenType("**", {beforeExpr: true}),

	  // Keyword token types.
	  _break: kw("break"),
	  _case: kw("case", beforeExpr),
	  _catch: kw("catch"),
	  _continue: kw("continue"),
	  _debugger: kw("debugger"),
	  _default: kw("default", beforeExpr),
	  _do: kw("do", {isLoop: true, beforeExpr: true}),
	  _else: kw("else", beforeExpr),
	  _finally: kw("finally"),
	  _for: kw("for", {isLoop: true}),
	  _function: kw("function", startsExpr),
	  _if: kw("if"),
	  _return: kw("return", beforeExpr),
	  _switch: kw("switch"),
	  _throw: kw("throw", beforeExpr),
	  _try: kw("try"),
	  _var: kw("var"),
	  _const: kw("const"),
	  _while: kw("while", {isLoop: true}),
	  _with: kw("with"),
	  _new: kw("new", {beforeExpr: true, startsExpr: true}),
	  _this: kw("this", startsExpr),
	  _super: kw("super", startsExpr),
	  _class: kw("class", startsExpr),
	  _extends: kw("extends", beforeExpr),
	  _export: kw("export"),
	  _import: kw("import"),
	  _null: kw("null", startsExpr),
	  _true: kw("true", startsExpr),
	  _false: kw("false", startsExpr),
	  _in: kw("in", {beforeExpr: true, binop: 7}),
	  _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
	  _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
	  _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
	  _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
	};

	// Matches a whole line break (where CRLF is considered a single
	// line break). Used to count lines.

	var lineBreak = /\r\n?|\n|\u2028|\u2029/;
	var lineBreakG = new RegExp(lineBreak.source, "g");

	function isNewLine(code, ecma2019String) {
	  return code === 10 || code === 13 || (!ecma2019String && (code === 0x2028 || code === 0x2029))
	}

	var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

	var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

	var ref = Object.prototype;
	var hasOwnProperty = ref.hasOwnProperty;
	var toString = ref.toString;

	// Checks if an object has a property.

	function has(obj, propName) {
	  return hasOwnProperty.call(obj, propName)
	}

	var isArray = Array.isArray || (function (obj) { return (
	  toString.call(obj) === "[object Array]"
	); });

	function wordsRegexp(words) {
	  return new RegExp("^(?:" + words.replace(/ /g, "|") + ")$")
	}

	// These are used when `options.locations` is on, for the
	// `startLoc` and `endLoc` properties.

	var Position = function Position(line, col) {
	  this.line = line;
	  this.column = col;
	};

	Position.prototype.offset = function offset (n) {
	  return new Position(this.line, this.column + n)
	};

	var SourceLocation = function SourceLocation(p, start, end) {
	  this.start = start;
	  this.end = end;
	  if (p.sourceFile !== null) { this.source = p.sourceFile; }
	};

	// The `getLineInfo` function is mostly useful when the
	// `locations` option is off (for performance reasons) and you
	// want to find the line/column position for a given character
	// offset. `input` should be the code string that the offset refers
	// into.

	function getLineInfo(input, offset) {
	  for (var line = 1, cur = 0;;) {
	    lineBreakG.lastIndex = cur;
	    var match = lineBreakG.exec(input);
	    if (match && match.index < offset) {
	      ++line;
	      cur = match.index + match[0].length;
	    } else {
	      return new Position(line, offset - cur)
	    }
	  }
	}

	// A second optional argument can be given to further configure
	// the parser process. These options are recognized:

	var defaultOptions = {
	  // `ecmaVersion` indicates the ECMAScript version to parse. Must be
	  // either 3, 5, 6 (2015), 7 (2016), 8 (2017), 9 (2018), or 10
	  // (2019). This influences support for strict mode, the set of
	  // reserved words, and support for new syntax features. The default
	  // is 9.
	  ecmaVersion: 9,
	  // `sourceType` indicates the mode the code should be parsed in.
	  // Can be either `"script"` or `"module"`. This influences global
	  // strict mode and parsing of `import` and `export` declarations.
	  sourceType: "script",
	  // `onInsertedSemicolon` can be a callback that will be called
	  // when a semicolon is automatically inserted. It will be passed
	  // the position of the comma as an offset, and if `locations` is
	  // enabled, it is given the location as a `{line, column}` object
	  // as second argument.
	  onInsertedSemicolon: null,
	  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
	  // trailing commas.
	  onTrailingComma: null,
	  // By default, reserved words are only enforced if ecmaVersion >= 5.
	  // Set `allowReserved` to a boolean value to explicitly turn this on
	  // an off. When this option has the value "never", reserved words
	  // and keywords can also not be used as property names.
	  allowReserved: null,
	  // When enabled, a return at the top level is not considered an
	  // error.
	  allowReturnOutsideFunction: false,
	  // When enabled, import/export statements are not constrained to
	  // appearing at the top of the program.
	  allowImportExportEverywhere: false,
	  // When enabled, await identifiers are allowed to appear at the top-level scope,
	  // but they are still not allowed in non-async functions.
	  allowAwaitOutsideFunction: false,
	  // When enabled, hashbang directive in the beginning of file
	  // is allowed and treated as a line comment.
	  allowHashBang: false,
	  // When `locations` is on, `loc` properties holding objects with
	  // `start` and `end` properties in `{line, column}` form (with
	  // line being 1-based and column 0-based) will be attached to the
	  // nodes.
	  locations: false,
	  // A function can be passed as `onToken` option, which will
	  // cause Acorn to call that function with object in the same
	  // format as tokens returned from `tokenizer().getToken()`. Note
	  // that you are not allowed to call the parser from the
	  // callback—that will corrupt its internal state.
	  onToken: null,
	  // A function can be passed as `onComment` option, which will
	  // cause Acorn to call that function with `(block, text, start,
	  // end)` parameters whenever a comment is skipped. `block` is a
	  // boolean indicating whether this is a block (`/* */`) comment,
	  // `text` is the content of the comment, and `start` and `end` are
	  // character offsets that denote the start and end of the comment.
	  // When the `locations` option is on, two more parameters are
	  // passed, the full `{line, column}` locations of the start and
	  // end of the comments. Note that you are not allowed to call the
	  // parser from the callback—that will corrupt its internal state.
	  onComment: null,
	  // Nodes have their start and end characters offsets recorded in
	  // `start` and `end` properties (directly on the node, rather than
	  // the `loc` object, which holds line/column data. To also add a
	  // [semi-standardized][range] `range` property holding a `[start,
	  // end]` array with the same numbers, set the `ranges` option to
	  // `true`.
	  //
	  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
	  ranges: false,
	  // It is possible to parse multiple files into a single AST by
	  // passing the tree produced by parsing the first file as
	  // `program` option in subsequent parses. This will add the
	  // toplevel forms of the parsed file to the `Program` (top) node
	  // of an existing parse tree.
	  program: null,
	  // When `locations` is on, you can pass this to record the source
	  // file in every node's `loc` object.
	  sourceFile: null,
	  // This value, if given, is stored in every node, whether
	  // `locations` is on or off.
	  directSourceFile: null,
	  // When enabled, parenthesized expressions are represented by
	  // (non-standard) ParenthesizedExpression nodes
	  preserveParens: false
	};

	// Interpret and default an options object

	function getOptions(opts) {
	  var options = {};

	  for (var opt in defaultOptions)
	    { options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt]; }

	  if (options.ecmaVersion >= 2015)
	    { options.ecmaVersion -= 2009; }

	  if (options.allowReserved == null)
	    { options.allowReserved = options.ecmaVersion < 5; }

	  if (isArray(options.onToken)) {
	    var tokens = options.onToken;
	    options.onToken = function (token) { return tokens.push(token); };
	  }
	  if (isArray(options.onComment))
	    { options.onComment = pushComment(options, options.onComment); }

	  return options
	}

	function pushComment(options, array) {
	  return function(block, text, start, end, startLoc, endLoc) {
	    var comment = {
	      type: block ? "Block" : "Line",
	      value: text,
	      start: start,
	      end: end
	    };
	    if (options.locations)
	      { comment.loc = new SourceLocation(this, startLoc, endLoc); }
	    if (options.ranges)
	      { comment.range = [start, end]; }
	    array.push(comment);
	  }
	}

	// Each scope gets a bitset that may contain these flags
	var SCOPE_TOP = 1;
	var SCOPE_FUNCTION = 2;
	var SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION;
	var SCOPE_ASYNC = 4;
	var SCOPE_GENERATOR = 8;
	var SCOPE_ARROW = 16;
	var SCOPE_SIMPLE_CATCH = 32;
	var SCOPE_SUPER = 64;
	var SCOPE_DIRECT_SUPER = 128;

	function functionFlags(async, generator) {
	  return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0)
	}

	// Used in checkLVal and declareName to determine the type of a binding
	var BIND_NONE = 0;
	var BIND_VAR = 1;
	var BIND_LEXICAL = 2;
	var BIND_FUNCTION = 3;
	var BIND_SIMPLE_CATCH = 4;
	var BIND_OUTSIDE = 5; // Special case for function names as bound inside the function

	var Parser = function Parser(options, input, startPos) {
	  this.options = options = getOptions(options);
	  this.sourceFile = options.sourceFile;
	  this.keywords = wordsRegexp(keywords[options.ecmaVersion >= 6 ? 6 : 5]);
	  var reserved = "";
	  if (!options.allowReserved) {
	    for (var v = options.ecmaVersion;; v--)
	      { if (reserved = reservedWords[v]) { break } }
	    if (options.sourceType === "module") { reserved += " await"; }
	  }
	  this.reservedWords = wordsRegexp(reserved);
	  var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
	  this.reservedWordsStrict = wordsRegexp(reservedStrict);
	  this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
	  this.input = String(input);

	  // Used to signal to callers of `readWord1` whether the word
	  // contained any escape sequences. This is needed because words with
	  // escape sequences must not be interpreted as keywords.
	  this.containsEsc = false;

	  // Set up token state

	  // The current position of the tokenizer in the input.
	  if (startPos) {
	    this.pos = startPos;
	    this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
	    this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
	  } else {
	    this.pos = this.lineStart = 0;
	    this.curLine = 1;
	  }

	  // Properties of the current token:
	  // Its type
	  this.type = types.eof;
	  // For tokens that include more information than their type, the value
	  this.value = null;
	  // Its start and end offset
	  this.start = this.end = this.pos;
	  // And, if locations are used, the {line, column} object
	  // corresponding to those offsets
	  this.startLoc = this.endLoc = this.curPosition();

	  // Position information for the previous token
	  this.lastTokEndLoc = this.lastTokStartLoc = null;
	  this.lastTokStart = this.lastTokEnd = this.pos;

	  // The context stack is used to superficially track syntactic
	  // context to predict whether a regular expression is allowed in a
	  // given position.
	  this.context = this.initialContext();
	  this.exprAllowed = true;

	  // Figure out if it's a module code.
	  this.inModule = options.sourceType === "module";
	  this.strict = this.inModule || this.strictDirective(this.pos);

	  // Used to signify the start of a potential arrow function
	  this.potentialArrowAt = -1;

	  // Positions to delayed-check that yield/await does not exist in default parameters.
	  this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
	  // Labels in scope.
	  this.labels = [];
	  // Thus-far undefined exports.
	  this.undefinedExports = {};

	  // If enabled, skip leading hashbang line.
	  if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
	    { this.skipLineComment(2); }

	  // Scope tracking for duplicate variable names (see scope.js)
	  this.scopeStack = [];
	  this.enterScope(SCOPE_TOP);

	  // For RegExp validation
	  this.regexpState = null;
	};

	var prototypeAccessors = { inFunction: { configurable: true },inGenerator: { configurable: true },inAsync: { configurable: true },allowSuper: { configurable: true },allowDirectSuper: { configurable: true },treatFunctionsAsVar: { configurable: true } };

	Parser.prototype.parse = function parse () {
	  var node = this.options.program || this.startNode();
	  this.nextToken();
	  return this.parseTopLevel(node)
	};

	prototypeAccessors.inFunction.get = function () { return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0 };
	prototypeAccessors.inGenerator.get = function () { return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0 };
	prototypeAccessors.inAsync.get = function () { return (this.currentVarScope().flags & SCOPE_ASYNC) > 0 };
	prototypeAccessors.allowSuper.get = function () { return (this.currentThisScope().flags & SCOPE_SUPER) > 0 };
	prototypeAccessors.allowDirectSuper.get = function () { return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0 };
	prototypeAccessors.treatFunctionsAsVar.get = function () { return this.treatFunctionsAsVarInScope(this.currentScope()) };

	// Switch to a getter for 7.0.0.
	Parser.prototype.inNonArrowFunction = function inNonArrowFunction () { return (this.currentThisScope().flags & SCOPE_FUNCTION) > 0 };

	Parser.extend = function extend () {
	    var plugins = [], len = arguments.length;
	    while ( len-- ) plugins[ len ] = arguments[ len ];

	  var cls = this;
	  for (var i = 0; i < plugins.length; i++) { cls = plugins[i](cls); }
	  return cls
	};

	Parser.parse = function parse (input, options) {
	  return new this(options, input).parse()
	};

	Parser.parseExpressionAt = function parseExpressionAt (input, pos, options) {
	  var parser = new this(options, input, pos);
	  parser.nextToken();
	  return parser.parseExpression()
	};

	Parser.tokenizer = function tokenizer (input, options) {
	  return new this(options, input)
	};

	Object.defineProperties( Parser.prototype, prototypeAccessors );

	var pp = Parser.prototype;

	// ## Parser utilities

	var literal = /^(?:'((?:\\.|[^'])*?)'|"((?:\\.|[^"])*?)")/;
	pp.strictDirective = function(start) {
	  var this$1 = this;

	  for (;;) {
	    // Try to find string literal.
	    skipWhiteSpace.lastIndex = start;
	    start += skipWhiteSpace.exec(this$1.input)[0].length;
	    var match = literal.exec(this$1.input.slice(start));
	    if (!match) { return false }
	    if ((match[1] || match[2]) === "use strict") { return true }
	    start += match[0].length;

	    // Skip semicolon, if any.
	    skipWhiteSpace.lastIndex = start;
	    start += skipWhiteSpace.exec(this$1.input)[0].length;
	    if (this$1.input[start] === ";")
	      { start++; }
	  }
	};

	// Predicate that tests whether the next token is of the given
	// type, and if yes, consumes it as a side effect.

	pp.eat = function(type) {
	  if (this.type === type) {
	    this.next();
	    return true
	  } else {
	    return false
	  }
	};

	// Tests whether parsed token is a contextual keyword.

	pp.isContextual = function(name) {
	  return this.type === types.name && this.value === name && !this.containsEsc
	};

	// Consumes contextual keyword if possible.

	pp.eatContextual = function(name) {
	  if (!this.isContextual(name)) { return false }
	  this.next();
	  return true
	};

	// Asserts that following token is given contextual keyword.

	pp.expectContextual = function(name) {
	  if (!this.eatContextual(name)) { this.unexpected(); }
	};

	// Test whether a semicolon can be inserted at the current position.

	pp.canInsertSemicolon = function() {
	  return this.type === types.eof ||
	    this.type === types.braceR ||
	    lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
	};

	pp.insertSemicolon = function() {
	  if (this.canInsertSemicolon()) {
	    if (this.options.onInsertedSemicolon)
	      { this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc); }
	    return true
	  }
	};

	// Consume a semicolon, or, failing that, see if we are allowed to
	// pretend that there is a semicolon at this position.

	pp.semicolon = function() {
	  if (!this.eat(types.semi) && !this.insertSemicolon()) { this.unexpected(); }
	};

	pp.afterTrailingComma = function(tokType, notNext) {
	  if (this.type === tokType) {
	    if (this.options.onTrailingComma)
	      { this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc); }
	    if (!notNext)
	      { this.next(); }
	    return true
	  }
	};

	// Expect a token of a given type. If found, consume it, otherwise,
	// raise an unexpected token error.

	pp.expect = function(type) {
	  this.eat(type) || this.unexpected();
	};

	// Raise an unexpected token error.

	pp.unexpected = function(pos) {
	  this.raise(pos != null ? pos : this.start, "Unexpected token");
	};

	function DestructuringErrors() {
	  this.shorthandAssign =
	  this.trailingComma =
	  this.parenthesizedAssign =
	  this.parenthesizedBind =
	  this.doubleProto =
	    -1;
	}

	pp.checkPatternErrors = function(refDestructuringErrors, isAssign) {
	  if (!refDestructuringErrors) { return }
	  if (refDestructuringErrors.trailingComma > -1)
	    { this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element"); }
	  var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
	  if (parens > -1) { this.raiseRecoverable(parens, "Parenthesized pattern"); }
	};

	pp.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
	  if (!refDestructuringErrors) { return false }
	  var shorthandAssign = refDestructuringErrors.shorthandAssign;
	  var doubleProto = refDestructuringErrors.doubleProto;
	  if (!andThrow) { return shorthandAssign >= 0 || doubleProto >= 0 }
	  if (shorthandAssign >= 0)
	    { this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns"); }
	  if (doubleProto >= 0)
	    { this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property"); }
	};

	pp.checkYieldAwaitInDefaultParams = function() {
	  if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
	    { this.raise(this.yieldPos, "Yield expression cannot be a default value"); }
	  if (this.awaitPos)
	    { this.raise(this.awaitPos, "Await expression cannot be a default value"); }
	};

	pp.isSimpleAssignTarget = function(expr) {
	  if (expr.type === "ParenthesizedExpression")
	    { return this.isSimpleAssignTarget(expr.expression) }
	  return expr.type === "Identifier" || expr.type === "MemberExpression"
	};

	var pp$1 = Parser.prototype;

	// ### Statement parsing

	// Parse a program. Initializes the parser, reads any number of
	// statements, and wraps them in a Program node.  Optionally takes a
	// `program` argument.  If present, the statements will be appended
	// to its body instead of creating a new node.

	pp$1.parseTopLevel = function(node) {
	  var this$1 = this;

	  var exports = {};
	  if (!node.body) { node.body = []; }
	  while (this.type !== types.eof) {
	    var stmt = this$1.parseStatement(null, true, exports);
	    node.body.push(stmt);
	  }
	  if (this.inModule)
	    { for (var i = 0, list = Object.keys(this$1.undefinedExports); i < list.length; i += 1)
	      {
	        var name = list[i];

	        this$1.raiseRecoverable(this$1.undefinedExports[name].start, ("Export '" + name + "' is not defined"));
	      } }
	  this.adaptDirectivePrologue(node.body);
	  this.next();
	  if (this.options.ecmaVersion >= 6) {
	    node.sourceType = this.options.sourceType;
	  }
	  return this.finishNode(node, "Program")
	};

	var loopLabel = {kind: "loop"};
	var switchLabel = {kind: "switch"};

	pp$1.isLet = function(context) {
	  if (this.options.ecmaVersion < 6 || !this.isContextual("let")) { return false }
	  skipWhiteSpace.lastIndex = this.pos;
	  var skip = skipWhiteSpace.exec(this.input);
	  var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
	  // For ambiguous cases, determine if a LexicalDeclaration (or only a
	  // Statement) is allowed here. If context is not empty then only a Statement
	  // is allowed. However, `let [` is an explicit negative lookahead for
	  // ExpressionStatement, so special-case it first.
	  if (nextCh === 91) { return true } // '['
	  if (context) { return false }

	  if (nextCh === 123) { return true } // '{'
	  if (isIdentifierStart(nextCh, true)) {
	    var pos = next + 1;
	    while (isIdentifierChar(this.input.charCodeAt(pos), true)) { ++pos; }
	    var ident = this.input.slice(next, pos);
	    if (!keywordRelationalOperator.test(ident)) { return true }
	  }
	  return false
	};

	// check 'async [no LineTerminator here] function'
	// - 'async /*foo*/ function' is OK.
	// - 'async /*\n*/ function' is invalid.
	pp$1.isAsyncFunction = function() {
	  if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
	    { return false }

	  skipWhiteSpace.lastIndex = this.pos;
	  var skip = skipWhiteSpace.exec(this.input);
	  var next = this.pos + skip[0].length;
	  return !lineBreak.test(this.input.slice(this.pos, next)) &&
	    this.input.slice(next, next + 8) === "function" &&
	    (next + 8 === this.input.length || !isIdentifierChar(this.input.charAt(next + 8)))
	};

	// Parse a single statement.
	//
	// If expecting a statement and finding a slash operator, parse a
	// regular expression literal. This is to handle cases like
	// `if (foo) /blah/.exec(foo)`, where looking at the previous token
	// does not help.

	pp$1.parseStatement = function(context, topLevel, exports) {
	  var starttype = this.type, node = this.startNode(), kind;

	  if (this.isLet(context)) {
	    starttype = types._var;
	    kind = "let";
	  }

	  // Most types of statements are recognized by the keyword they
	  // start with. Many are trivial to parse, some require a bit of
	  // complexity.

	  switch (starttype) {
	  case types._break: case types._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
	  case types._debugger: return this.parseDebuggerStatement(node)
	  case types._do: return this.parseDoStatement(node)
	  case types._for: return this.parseForStatement(node)
	  case types._function:
	    // Function as sole body of either an if statement or a labeled statement
	    // works, but not when it is part of a labeled statement that is the sole
	    // body of an if statement.
	    if ((context && (this.strict || context !== "if" && context !== "label")) && this.options.ecmaVersion >= 6) { this.unexpected(); }
	    return this.parseFunctionStatement(node, false, !context)
	  case types._class:
	    if (context) { this.unexpected(); }
	    return this.parseClass(node, true)
	  case types._if: return this.parseIfStatement(node)
	  case types._return: return this.parseReturnStatement(node)
	  case types._switch: return this.parseSwitchStatement(node)
	  case types._throw: return this.parseThrowStatement(node)
	  case types._try: return this.parseTryStatement(node)
	  case types._const: case types._var:
	    kind = kind || this.value;
	    if (context && kind !== "var") { this.unexpected(); }
	    return this.parseVarStatement(node, kind)
	  case types._while: return this.parseWhileStatement(node)
	  case types._with: return this.parseWithStatement(node)
	  case types.braceL: return this.parseBlock(true, node)
	  case types.semi: return this.parseEmptyStatement(node)
	  case types._export:
	  case types._import:
	    if (!this.options.allowImportExportEverywhere) {
	      if (!topLevel)
	        { this.raise(this.start, "'import' and 'export' may only appear at the top level"); }
	      if (!this.inModule)
	        { this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'"); }
	    }
	    return starttype === types._import ? this.parseImport(node) : this.parseExport(node, exports)

	    // If the statement does not start with a statement keyword or a
	    // brace, it's an ExpressionStatement or LabeledStatement. We
	    // simply start parsing an expression, and afterwards, if the
	    // next token is a colon and the expression was a simple
	    // Identifier node, we switch to interpreting it as a label.
	  default:
	    if (this.isAsyncFunction()) {
	      if (context) { this.unexpected(); }
	      this.next();
	      return this.parseFunctionStatement(node, true, !context)
	    }

	    var maybeName = this.value, expr = this.parseExpression();
	    if (starttype === types.name && expr.type === "Identifier" && this.eat(types.colon))
	      { return this.parseLabeledStatement(node, maybeName, expr, context) }
	    else { return this.parseExpressionStatement(node, expr) }
	  }
	};

	pp$1.parseBreakContinueStatement = function(node, keyword) {
	  var this$1 = this;

	  var isBreak = keyword === "break";
	  this.next();
	  if (this.eat(types.semi) || this.insertSemicolon()) { node.label = null; }
	  else if (this.type !== types.name) { this.unexpected(); }
	  else {
	    node.label = this.parseIdent();
	    this.semicolon();
	  }

	  // Verify that there is an actual destination to break or
	  // continue to.
	  var i = 0;
	  for (; i < this.labels.length; ++i) {
	    var lab = this$1.labels[i];
	    if (node.label == null || lab.name === node.label.name) {
	      if (lab.kind != null && (isBreak || lab.kind === "loop")) { break }
	      if (node.label && isBreak) { break }
	    }
	  }
	  if (i === this.labels.length) { this.raise(node.start, "Unsyntactic " + keyword); }
	  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
	};

	pp$1.parseDebuggerStatement = function(node) {
	  this.next();
	  this.semicolon();
	  return this.finishNode(node, "DebuggerStatement")
	};

	pp$1.parseDoStatement = function(node) {
	  this.next();
	  this.labels.push(loopLabel);
	  node.body = this.parseStatement("do");
	  this.labels.pop();
	  this.expect(types._while);
	  node.test = this.parseParenExpression();
	  if (this.options.ecmaVersion >= 6)
	    { this.eat(types.semi); }
	  else
	    { this.semicolon(); }
	  return this.finishNode(node, "DoWhileStatement")
	};

	// Disambiguating between a `for` and a `for`/`in` or `for`/`of`
	// loop is non-trivial. Basically, we have to parse the init `var`
	// statement or expression, disallowing the `in` operator (see
	// the second parameter to `parseExpression`), and then check
	// whether the next token is `in` or `of`. When there is no init
	// part (semicolon immediately after the opening parenthesis), it
	// is a regular `for` loop.

	pp$1.parseForStatement = function(node) {
	  this.next();
	  var awaitAt = (this.options.ecmaVersion >= 9 && (this.inAsync || (!this.inFunction && this.options.allowAwaitOutsideFunction)) && this.eatContextual("await")) ? this.lastTokStart : -1;
	  this.labels.push(loopLabel);
	  this.enterScope(0);
	  this.expect(types.parenL);
	  if (this.type === types.semi) {
	    if (awaitAt > -1) { this.unexpected(awaitAt); }
	    return this.parseFor(node, null)
	  }
	  var isLet = this.isLet();
	  if (this.type === types._var || this.type === types._const || isLet) {
	    var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
	    this.next();
	    this.parseVar(init$1, true, kind);
	    this.finishNode(init$1, "VariableDeclaration");
	    if ((this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init$1.declarations.length === 1 &&
	        !(kind !== "var" && init$1.declarations[0].init)) {
	      if (this.options.ecmaVersion >= 9) {
	        if (this.type === types._in) {
	          if (awaitAt > -1) { this.unexpected(awaitAt); }
	        } else { node.await = awaitAt > -1; }
	      }
	      return this.parseForIn(node, init$1)
	    }
	    if (awaitAt > -1) { this.unexpected(awaitAt); }
	    return this.parseFor(node, init$1)
	  }
	  var refDestructuringErrors = new DestructuringErrors;
	  var init = this.parseExpression(true, refDestructuringErrors);
	  if (this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
	    if (this.options.ecmaVersion >= 9) {
	      if (this.type === types._in) {
	        if (awaitAt > -1) { this.unexpected(awaitAt); }
	      } else { node.await = awaitAt > -1; }
	    }
	    this.toAssignable(init, false, refDestructuringErrors);
	    this.checkLVal(init);
	    return this.parseForIn(node, init)
	  } else {
	    this.checkExpressionErrors(refDestructuringErrors, true);
	  }
	  if (awaitAt > -1) { this.unexpected(awaitAt); }
	  return this.parseFor(node, init)
	};

	pp$1.parseFunctionStatement = function(node, isAsync, declarationPosition) {
	  this.next();
	  return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync)
	};

	pp$1.parseIfStatement = function(node) {
	  this.next();
	  node.test = this.parseParenExpression();
	  // allow function declarations in branches, but only in non-strict mode
	  node.consequent = this.parseStatement("if");
	  node.alternate = this.eat(types._else) ? this.parseStatement("if") : null;
	  return this.finishNode(node, "IfStatement")
	};

	pp$1.parseReturnStatement = function(node) {
	  if (!this.inFunction && !this.options.allowReturnOutsideFunction)
	    { this.raise(this.start, "'return' outside of function"); }
	  this.next();

	  // In `return` (and `break`/`continue`), the keywords with
	  // optional arguments, we eagerly look for a semicolon or the
	  // possibility to insert one.

	  if (this.eat(types.semi) || this.insertSemicolon()) { node.argument = null; }
	  else { node.argument = this.parseExpression(); this.semicolon(); }
	  return this.finishNode(node, "ReturnStatement")
	};

	pp$1.parseSwitchStatement = function(node) {
	  var this$1 = this;

	  this.next();
	  node.discriminant = this.parseParenExpression();
	  node.cases = [];
	  this.expect(types.braceL);
	  this.labels.push(switchLabel);
	  this.enterScope(0);

	  // Statements under must be grouped (by label) in SwitchCase
	  // nodes. `cur` is used to keep the node that we are currently
	  // adding statements to.

	  var cur;
	  for (var sawDefault = false; this.type !== types.braceR;) {
	    if (this$1.type === types._case || this$1.type === types._default) {
	      var isCase = this$1.type === types._case;
	      if (cur) { this$1.finishNode(cur, "SwitchCase"); }
	      node.cases.push(cur = this$1.startNode());
	      cur.consequent = [];
	      this$1.next();
	      if (isCase) {
	        cur.test = this$1.parseExpression();
	      } else {
	        if (sawDefault) { this$1.raiseRecoverable(this$1.lastTokStart, "Multiple default clauses"); }
	        sawDefault = true;
	        cur.test = null;
	      }
	      this$1.expect(types.colon);
	    } else {
	      if (!cur) { this$1.unexpected(); }
	      cur.consequent.push(this$1.parseStatement(null));
	    }
	  }
	  this.exitScope();
	  if (cur) { this.finishNode(cur, "SwitchCase"); }
	  this.next(); // Closing brace
	  this.labels.pop();
	  return this.finishNode(node, "SwitchStatement")
	};

	pp$1.parseThrowStatement = function(node) {
	  this.next();
	  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
	    { this.raise(this.lastTokEnd, "Illegal newline after throw"); }
	  node.argument = this.parseExpression();
	  this.semicolon();
	  return this.finishNode(node, "ThrowStatement")
	};

	// Reused empty array added for node fields that are always empty.

	var empty = [];

	pp$1.parseTryStatement = function(node) {
	  this.next();
	  node.block = this.parseBlock();
	  node.handler = null;
	  if (this.type === types._catch) {
	    var clause = this.startNode();
	    this.next();
	    if (this.eat(types.parenL)) {
	      clause.param = this.parseBindingAtom();
	      var simple = clause.param.type === "Identifier";
	      this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
	      this.checkLVal(clause.param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
	      this.expect(types.parenR);
	    } else {
	      if (this.options.ecmaVersion < 10) { this.unexpected(); }
	      clause.param = null;
	      this.enterScope(0);
	    }
	    clause.body = this.parseBlock(false);
	    this.exitScope();
	    node.handler = this.finishNode(clause, "CatchClause");
	  }
	  node.finalizer = this.eat(types._finally) ? this.parseBlock() : null;
	  if (!node.handler && !node.finalizer)
	    { this.raise(node.start, "Missing catch or finally clause"); }
	  return this.finishNode(node, "TryStatement")
	};

	pp$1.parseVarStatement = function(node, kind) {
	  this.next();
	  this.parseVar(node, false, kind);
	  this.semicolon();
	  return this.finishNode(node, "VariableDeclaration")
	};

	pp$1.parseWhileStatement = function(node) {
	  this.next();
	  node.test = this.parseParenExpression();
	  this.labels.push(loopLabel);
	  node.body = this.parseStatement("while");
	  this.labels.pop();
	  return this.finishNode(node, "WhileStatement")
	};

	pp$1.parseWithStatement = function(node) {
	  if (this.strict) { this.raise(this.start, "'with' in strict mode"); }
	  this.next();
	  node.object = this.parseParenExpression();
	  node.body = this.parseStatement("with");
	  return this.finishNode(node, "WithStatement")
	};

	pp$1.parseEmptyStatement = function(node) {
	  this.next();
	  return this.finishNode(node, "EmptyStatement")
	};

	pp$1.parseLabeledStatement = function(node, maybeName, expr, context) {
	  var this$1 = this;

	  for (var i$1 = 0, list = this$1.labels; i$1 < list.length; i$1 += 1)
	    {
	    var label = list[i$1];

	    if (label.name === maybeName)
	      { this$1.raise(expr.start, "Label '" + maybeName + "' is already declared");
	  } }
	  var kind = this.type.isLoop ? "loop" : this.type === types._switch ? "switch" : null;
	  for (var i = this.labels.length - 1; i >= 0; i--) {
	    var label$1 = this$1.labels[i];
	    if (label$1.statementStart === node.start) {
	      // Update information about previous labels on this node
	      label$1.statementStart = this$1.start;
	      label$1.kind = kind;
	    } else { break }
	  }
	  this.labels.push({name: maybeName, kind: kind, statementStart: this.start});
	  node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
	  this.labels.pop();
	  node.label = expr;
	  return this.finishNode(node, "LabeledStatement")
	};

	pp$1.parseExpressionStatement = function(node, expr) {
	  node.expression = expr;
	  this.semicolon();
	  return this.finishNode(node, "ExpressionStatement")
	};

	// Parse a semicolon-enclosed block of statements, handling `"use
	// strict"` declarations when `allowStrict` is true (used for
	// function bodies).

	pp$1.parseBlock = function(createNewLexicalScope, node) {
	  var this$1 = this;
	  if ( createNewLexicalScope === void 0 ) createNewLexicalScope = true;
	  if ( node === void 0 ) node = this.startNode();

	  node.body = [];
	  this.expect(types.braceL);
	  if (createNewLexicalScope) { this.enterScope(0); }
	  while (!this.eat(types.braceR)) {
	    var stmt = this$1.parseStatement(null);
	    node.body.push(stmt);
	  }
	  if (createNewLexicalScope) { this.exitScope(); }
	  return this.finishNode(node, "BlockStatement")
	};

	// Parse a regular `for` loop. The disambiguation code in
	// `parseStatement` will already have parsed the init statement or
	// expression.

	pp$1.parseFor = function(node, init) {
	  node.init = init;
	  this.expect(types.semi);
	  node.test = this.type === types.semi ? null : this.parseExpression();
	  this.expect(types.semi);
	  node.update = this.type === types.parenR ? null : this.parseExpression();
	  this.expect(types.parenR);
	  node.body = this.parseStatement("for");
	  this.exitScope();
	  this.labels.pop();
	  return this.finishNode(node, "ForStatement")
	};

	// Parse a `for`/`in` and `for`/`of` loop, which are almost
	// same from parser's perspective.

	pp$1.parseForIn = function(node, init) {
	  var type = this.type === types._in ? "ForInStatement" : "ForOfStatement";
	  this.next();
	  if (type === "ForInStatement") {
	    if (init.type === "AssignmentPattern" ||
	      (init.type === "VariableDeclaration" && init.declarations[0].init != null &&
	       (this.strict || init.declarations[0].id.type !== "Identifier")))
	      { this.raise(init.start, "Invalid assignment in for-in loop head"); }
	  }
	  node.left = init;
	  node.right = type === "ForInStatement" ? this.parseExpression() : this.parseMaybeAssign();
	  this.expect(types.parenR);
	  node.body = this.parseStatement("for");
	  this.exitScope();
	  this.labels.pop();
	  return this.finishNode(node, type)
	};

	// Parse a list of variable declarations.

	pp$1.parseVar = function(node, isFor, kind) {
	  var this$1 = this;

	  node.declarations = [];
	  node.kind = kind;
	  for (;;) {
	    var decl = this$1.startNode();
	    this$1.parseVarId(decl, kind);
	    if (this$1.eat(types.eq)) {
	      decl.init = this$1.parseMaybeAssign(isFor);
	    } else if (kind === "const" && !(this$1.type === types._in || (this$1.options.ecmaVersion >= 6 && this$1.isContextual("of")))) {
	      this$1.unexpected();
	    } else if (decl.id.type !== "Identifier" && !(isFor && (this$1.type === types._in || this$1.isContextual("of")))) {
	      this$1.raise(this$1.lastTokEnd, "Complex binding patterns require an initialization value");
	    } else {
	      decl.init = null;
	    }
	    node.declarations.push(this$1.finishNode(decl, "VariableDeclarator"));
	    if (!this$1.eat(types.comma)) { break }
	  }
	  return node
	};

	pp$1.parseVarId = function(decl, kind) {
	  if ((kind === "const" || kind === "let") && this.isContextual("let")) {
	    this.raiseRecoverable(this.start, "let is disallowed as a lexically bound name");
	  }
	  decl.id = this.parseBindingAtom();
	  this.checkLVal(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
	};

	var FUNC_STATEMENT = 1;
	var FUNC_HANGING_STATEMENT = 2;
	var FUNC_NULLABLE_ID = 4;

	// Parse a function declaration or literal (depending on the
	// `statement & FUNC_STATEMENT`).

	// Remove `allowExpressionBody` for 7.0.0, as it is only called with false
	pp$1.parseFunction = function(node, statement, allowExpressionBody, isAsync) {
	  this.initFunction(node);
	  if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
	    if (this.type === types.star && (statement & FUNC_HANGING_STATEMENT))
	      { this.unexpected(); }
	    node.generator = this.eat(types.star);
	  }
	  if (this.options.ecmaVersion >= 8)
	    { node.async = !!isAsync; }

	  if (statement & FUNC_STATEMENT) {
	    node.id = (statement & FUNC_NULLABLE_ID) && this.type !== types.name ? null : this.parseIdent();
	    if (node.id && !(statement & FUNC_HANGING_STATEMENT))
	      // If it is a regular function declaration in sloppy mode, then it is
	      // subject to Annex B semantics (BIND_FUNCTION). Otherwise, the binding
	      // mode depends on properties of the current scope (see
	      // treatFunctionsAsVar).
	      { this.checkLVal(node.id, (this.strict || node.generator || node.async) ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION); }
	  }

	  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
	  this.yieldPos = 0;
	  this.awaitPos = 0;
	  this.awaitIdentPos = 0;
	  this.enterScope(functionFlags(node.async, node.generator));

	  if (!(statement & FUNC_STATEMENT))
	    { node.id = this.type === types.name ? this.parseIdent() : null; }

	  this.parseFunctionParams(node);
	  this.parseFunctionBody(node, allowExpressionBody, false);

	  this.yieldPos = oldYieldPos;
	  this.awaitPos = oldAwaitPos;
	  this.awaitIdentPos = oldAwaitIdentPos;
	  return this.finishNode(node, (statement & FUNC_STATEMENT) ? "FunctionDeclaration" : "FunctionExpression")
	};

	pp$1.parseFunctionParams = function(node) {
	  this.expect(types.parenL);
	  node.params = this.parseBindingList(types.parenR, false, this.options.ecmaVersion >= 8);
	  this.checkYieldAwaitInDefaultParams();
	};

	// Parse a class declaration or literal (depending on the
	// `isStatement` parameter).

	pp$1.parseClass = function(node, isStatement) {
	  var this$1 = this;

	  this.next();

	  // ecma-262 14.6 Class Definitions
	  // A class definition is always strict mode code.
	  var oldStrict = this.strict;
	  this.strict = true;

	  this.parseClassId(node, isStatement);
	  this.parseClassSuper(node);
	  var classBody = this.startNode();
	  var hadConstructor = false;
	  classBody.body = [];
	  this.expect(types.braceL);
	  while (!this.eat(types.braceR)) {
	    var element = this$1.parseClassElement(node.superClass !== null);
	    if (element) {
	      classBody.body.push(element);
	      if (element.type === "MethodDefinition" && element.kind === "constructor") {
	        if (hadConstructor) { this$1.raise(element.start, "Duplicate constructor in the same class"); }
	        hadConstructor = true;
	      }
	    }
	  }
	  node.body = this.finishNode(classBody, "ClassBody");
	  this.strict = oldStrict;
	  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
	};

	pp$1.parseClassElement = function(constructorAllowsSuper) {
	  var this$1 = this;

	  if (this.eat(types.semi)) { return null }

	  var method = this.startNode();
	  var tryContextual = function (k, noLineBreak) {
	    if ( noLineBreak === void 0 ) noLineBreak = false;

	    var start = this$1.start, startLoc = this$1.startLoc;
	    if (!this$1.eatContextual(k)) { return false }
	    if (this$1.type !== types.parenL && (!noLineBreak || !this$1.canInsertSemicolon())) { return true }
	    if (method.key) { this$1.unexpected(); }
	    method.computed = false;
	    method.key = this$1.startNodeAt(start, startLoc);
	    method.key.name = k;
	    this$1.finishNode(method.key, "Identifier");
	    return false
	  };

	  method.kind = "method";
	  method.static = tryContextual("static");
	  var isGenerator = this.eat(types.star);
	  var isAsync = false;
	  if (!isGenerator) {
	    if (this.options.ecmaVersion >= 8 && tryContextual("async", true)) {
	      isAsync = true;
	      isGenerator = this.options.ecmaVersion >= 9 && this.eat(types.star);
	    } else if (tryContextual("get")) {
	      method.kind = "get";
	    } else if (tryContextual("set")) {
	      method.kind = "set";
	    }
	  }
	  if (!method.key) { this.parsePropertyName(method); }
	  var key = method.key;
	  var allowsDirectSuper = false;
	  if (!method.computed && !method.static && (key.type === "Identifier" && key.name === "constructor" ||
	      key.type === "Literal" && key.value === "constructor")) {
	    if (method.kind !== "method") { this.raise(key.start, "Constructor can't have get/set modifier"); }
	    if (isGenerator) { this.raise(key.start, "Constructor can't be a generator"); }
	    if (isAsync) { this.raise(key.start, "Constructor can't be an async method"); }
	    method.kind = "constructor";
	    allowsDirectSuper = constructorAllowsSuper;
	  } else if (method.static && key.type === "Identifier" && key.name === "prototype") {
	    this.raise(key.start, "Classes may not have a static property named prototype");
	  }
	  this.parseClassMethod(method, isGenerator, isAsync, allowsDirectSuper);
	  if (method.kind === "get" && method.value.params.length !== 0)
	    { this.raiseRecoverable(method.value.start, "getter should have no params"); }
	  if (method.kind === "set" && method.value.params.length !== 1)
	    { this.raiseRecoverable(method.value.start, "setter should have exactly one param"); }
	  if (method.kind === "set" && method.value.params[0].type === "RestElement")
	    { this.raiseRecoverable(method.value.params[0].start, "Setter cannot use rest params"); }
	  return method
	};

	pp$1.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
	  method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);
	  return this.finishNode(method, "MethodDefinition")
	};

	pp$1.parseClassId = function(node, isStatement) {
	  if (this.type === types.name) {
	    node.id = this.parseIdent();
	    if (isStatement)
	      { this.checkLVal(node.id, BIND_LEXICAL, false); }
	  } else {
	    if (isStatement === true)
	      { this.unexpected(); }
	    node.id = null;
	  }
	};

	pp$1.parseClassSuper = function(node) {
	  node.superClass = this.eat(types._extends) ? this.parseExprSubscripts() : null;
	};

	// Parses module export declaration.

	pp$1.parseExport = function(node, exports) {
	  var this$1 = this;

	  this.next();
	  // export * from '...'
	  if (this.eat(types.star)) {
	    this.expectContextual("from");
	    if (this.type !== types.string) { this.unexpected(); }
	    node.source = this.parseExprAtom();
	    this.semicolon();
	    return this.finishNode(node, "ExportAllDeclaration")
	  }
	  if (this.eat(types._default)) { // export default ...
	    this.checkExport(exports, "default", this.lastTokStart);
	    var isAsync;
	    if (this.type === types._function || (isAsync = this.isAsyncFunction())) {
	      var fNode = this.startNode();
	      this.next();
	      if (isAsync) { this.next(); }
	      node.declaration = this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync);
	    } else if (this.type === types._class) {
	      var cNode = this.startNode();
	      node.declaration = this.parseClass(cNode, "nullableID");
	    } else {
	      node.declaration = this.parseMaybeAssign();
	      this.semicolon();
	    }
	    return this.finishNode(node, "ExportDefaultDeclaration")
	  }
	  // export var|const|let|function|class ...
	  if (this.shouldParseExportStatement()) {
	    node.declaration = this.parseStatement(null);
	    if (node.declaration.type === "VariableDeclaration")
	      { this.checkVariableExport(exports, node.declaration.declarations); }
	    else
	      { this.checkExport(exports, node.declaration.id.name, node.declaration.id.start); }
	    node.specifiers = [];
	    node.source = null;
	  } else { // export { x, y as z } [from '...']
	    node.declaration = null;
	    node.specifiers = this.parseExportSpecifiers(exports);
	    if (this.eatContextual("from")) {
	      if (this.type !== types.string) { this.unexpected(); }
	      node.source = this.parseExprAtom();
	    } else {
	      for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
	        // check for keywords used as local names
	        var spec = list[i];

	        this$1.checkUnreserved(spec.local);
	        // check if export is defined
	        this$1.checkLocalExport(spec.local);
	      }

	      node.source = null;
	    }
	    this.semicolon();
	  }
	  return this.finishNode(node, "ExportNamedDeclaration")
	};

	pp$1.checkExport = function(exports, name, pos) {
	  if (!exports) { return }
	  if (has(exports, name))
	    { this.raiseRecoverable(pos, "Duplicate export '" + name + "'"); }
	  exports[name] = true;
	};

	pp$1.checkPatternExport = function(exports, pat) {
	  var this$1 = this;

	  var type = pat.type;
	  if (type === "Identifier")
	    { this.checkExport(exports, pat.name, pat.start); }
	  else if (type === "ObjectPattern")
	    { for (var i = 0, list = pat.properties; i < list.length; i += 1)
	      {
	        var prop = list[i];

	        this$1.checkPatternExport(exports, prop);
	      } }
	  else if (type === "ArrayPattern")
	    { for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
	      var elt = list$1[i$1];

	        if (elt) { this$1.checkPatternExport(exports, elt); }
	    } }
	  else if (type === "Property")
	    { this.checkPatternExport(exports, pat.value); }
	  else if (type === "AssignmentPattern")
	    { this.checkPatternExport(exports, pat.left); }
	  else if (type === "RestElement")
	    { this.checkPatternExport(exports, pat.argument); }
	  else if (type === "ParenthesizedExpression")
	    { this.checkPatternExport(exports, pat.expression); }
	};

	pp$1.checkVariableExport = function(exports, decls) {
	  var this$1 = this;

	  if (!exports) { return }
	  for (var i = 0, list = decls; i < list.length; i += 1)
	    {
	    var decl = list[i];

	    this$1.checkPatternExport(exports, decl.id);
	  }
	};

	pp$1.shouldParseExportStatement = function() {
	  return this.type.keyword === "var" ||
	    this.type.keyword === "const" ||
	    this.type.keyword === "class" ||
	    this.type.keyword === "function" ||
	    this.isLet() ||
	    this.isAsyncFunction()
	};

	// Parses a comma-separated list of module exports.

	pp$1.parseExportSpecifiers = function(exports) {
	  var this$1 = this;

	  var nodes = [], first = true;
	  // export { x, y as z } [from '...']
	  this.expect(types.braceL);
	  while (!this.eat(types.braceR)) {
	    if (!first) {
	      this$1.expect(types.comma);
	      if (this$1.afterTrailingComma(types.braceR)) { break }
	    } else { first = false; }

	    var node = this$1.startNode();
	    node.local = this$1.parseIdent(true);
	    node.exported = this$1.eatContextual("as") ? this$1.parseIdent(true) : node.local;
	    this$1.checkExport(exports, node.exported.name, node.exported.start);
	    nodes.push(this$1.finishNode(node, "ExportSpecifier"));
	  }
	  return nodes
	};

	// Parses import declaration.

	pp$1.parseImport = function(node) {
	  this.next();
	  // import '...'
	  if (this.type === types.string) {
	    node.specifiers = empty;
	    node.source = this.parseExprAtom();
	  } else {
	    node.specifiers = this.parseImportSpecifiers();
	    this.expectContextual("from");
	    node.source = this.type === types.string ? this.parseExprAtom() : this.unexpected();
	  }
	  this.semicolon();
	  return this.finishNode(node, "ImportDeclaration")
	};

	// Parses a comma-separated list of module imports.

	pp$1.parseImportSpecifiers = function() {
	  var this$1 = this;

	  var nodes = [], first = true;
	  if (this.type === types.name) {
	    // import defaultObj, { x, y as z } from '...'
	    var node = this.startNode();
	    node.local = this.parseIdent();
	    this.checkLVal(node.local, BIND_LEXICAL);
	    nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
	    if (!this.eat(types.comma)) { return nodes }
	  }
	  if (this.type === types.star) {
	    var node$1 = this.startNode();
	    this.next();
	    this.expectContextual("as");
	    node$1.local = this.parseIdent();
	    this.checkLVal(node$1.local, BIND_LEXICAL);
	    nodes.push(this.finishNode(node$1, "ImportNamespaceSpecifier"));
	    return nodes
	  }
	  this.expect(types.braceL);
	  while (!this.eat(types.braceR)) {
	    if (!first) {
	      this$1.expect(types.comma);
	      if (this$1.afterTrailingComma(types.braceR)) { break }
	    } else { first = false; }

	    var node$2 = this$1.startNode();
	    node$2.imported = this$1.parseIdent(true);
	    if (this$1.eatContextual("as")) {
	      node$2.local = this$1.parseIdent();
	    } else {
	      this$1.checkUnreserved(node$2.imported);
	      node$2.local = node$2.imported;
	    }
	    this$1.checkLVal(node$2.local, BIND_LEXICAL);
	    nodes.push(this$1.finishNode(node$2, "ImportSpecifier"));
	  }
	  return nodes
	};

	// Set `ExpressionStatement#directive` property for directive prologues.
	pp$1.adaptDirectivePrologue = function(statements) {
	  for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
	    statements[i].directive = statements[i].expression.raw.slice(1, -1);
	  }
	};
	pp$1.isDirectiveCandidate = function(statement) {
	  return (
	    statement.type === "ExpressionStatement" &&
	    statement.expression.type === "Literal" &&
	    typeof statement.expression.value === "string" &&
	    // Reject parenthesized strings.
	    (this.input[statement.start] === "\"" || this.input[statement.start] === "'")
	  )
	};

	var pp$2 = Parser.prototype;

	// Convert existing expression atom to assignable pattern
	// if possible.

	pp$2.toAssignable = function(node, isBinding, refDestructuringErrors) {
	  var this$1 = this;

	  if (this.options.ecmaVersion >= 6 && node) {
	    switch (node.type) {
	    case "Identifier":
	      if (this.inAsync && node.name === "await")
	        { this.raise(node.start, "Cannot use 'await' as identifier inside an async function"); }
	      break

	    case "ObjectPattern":
	    case "ArrayPattern":
	    case "RestElement":
	      break

	    case "ObjectExpression":
	      node.type = "ObjectPattern";
	      if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
	      for (var i = 0, list = node.properties; i < list.length; i += 1) {
	        var prop = list[i];

	      this$1.toAssignable(prop, isBinding);
	        // Early error:
	        //   AssignmentRestProperty[Yield, Await] :
	        //     `...` DestructuringAssignmentTarget[Yield, Await]
	        //
	        //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.
	        if (
	          prop.type === "RestElement" &&
	          (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")
	        ) {
	          this$1.raise(prop.argument.start, "Unexpected token");
	        }
	      }
	      break

	    case "Property":
	      // AssignmentProperty has type === "Property"
	      if (node.kind !== "init") { this.raise(node.key.start, "Object pattern can't contain getter or setter"); }
	      this.toAssignable(node.value, isBinding);
	      break

	    case "ArrayExpression":
	      node.type = "ArrayPattern";
	      if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
	      this.toAssignableList(node.elements, isBinding);
	      break

	    case "SpreadElement":
	      node.type = "RestElement";
	      this.toAssignable(node.argument, isBinding);
	      if (node.argument.type === "AssignmentPattern")
	        { this.raise(node.argument.start, "Rest elements cannot have a default value"); }
	      break

	    case "AssignmentExpression":
	      if (node.operator !== "=") { this.raise(node.left.end, "Only '=' operator can be used for specifying default value."); }
	      node.type = "AssignmentPattern";
	      delete node.operator;
	      this.toAssignable(node.left, isBinding);
	      // falls through to AssignmentPattern

	    case "AssignmentPattern":
	      break

	    case "ParenthesizedExpression":
	      this.toAssignable(node.expression, isBinding, refDestructuringErrors);
	      break

	    case "MemberExpression":
	      if (!isBinding) { break }

	    default:
	      this.raise(node.start, "Assigning to rvalue");
	    }
	  } else if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
	  return node
	};

	// Convert list of expression atoms to binding list.

	pp$2.toAssignableList = function(exprList, isBinding) {
	  var this$1 = this;

	  var end = exprList.length;
	  for (var i = 0; i < end; i++) {
	    var elt = exprList[i];
	    if (elt) { this$1.toAssignable(elt, isBinding); }
	  }
	  if (end) {
	    var last = exprList[end - 1];
	    if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
	      { this.unexpected(last.argument.start); }
	  }
	  return exprList
	};

	// Parses spread element.

	pp$2.parseSpread = function(refDestructuringErrors) {
	  var node = this.startNode();
	  this.next();
	  node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
	  return this.finishNode(node, "SpreadElement")
	};

	pp$2.parseRestBinding = function() {
	  var node = this.startNode();
	  this.next();

	  // RestElement inside of a function parameter must be an identifier
	  if (this.options.ecmaVersion === 6 && this.type !== types.name)
	    { this.unexpected(); }

	  node.argument = this.parseBindingAtom();

	  return this.finishNode(node, "RestElement")
	};

	// Parses lvalue (assignable) atom.

	pp$2.parseBindingAtom = function() {
	  if (this.options.ecmaVersion >= 6) {
	    switch (this.type) {
	    case types.bracketL:
	      var node = this.startNode();
	      this.next();
	      node.elements = this.parseBindingList(types.bracketR, true, true);
	      return this.finishNode(node, "ArrayPattern")

	    case types.braceL:
	      return this.parseObj(true)
	    }
	  }
	  return this.parseIdent()
	};

	pp$2.parseBindingList = function(close, allowEmpty, allowTrailingComma) {
	  var this$1 = this;

	  var elts = [], first = true;
	  while (!this.eat(close)) {
	    if (first) { first = false; }
	    else { this$1.expect(types.comma); }
	    if (allowEmpty && this$1.type === types.comma) {
	      elts.push(null);
	    } else if (allowTrailingComma && this$1.afterTrailingComma(close)) {
	      break
	    } else if (this$1.type === types.ellipsis) {
	      var rest = this$1.parseRestBinding();
	      this$1.parseBindingListItem(rest);
	      elts.push(rest);
	      if (this$1.type === types.comma) { this$1.raise(this$1.start, "Comma is not permitted after the rest element"); }
	      this$1.expect(close);
	      break
	    } else {
	      var elem = this$1.parseMaybeDefault(this$1.start, this$1.startLoc);
	      this$1.parseBindingListItem(elem);
	      elts.push(elem);
	    }
	  }
	  return elts
	};

	pp$2.parseBindingListItem = function(param) {
	  return param
	};

	// Parses assignment pattern around given atom if possible.

	pp$2.parseMaybeDefault = function(startPos, startLoc, left) {
	  left = left || this.parseBindingAtom();
	  if (this.options.ecmaVersion < 6 || !this.eat(types.eq)) { return left }
	  var node = this.startNodeAt(startPos, startLoc);
	  node.left = left;
	  node.right = this.parseMaybeAssign();
	  return this.finishNode(node, "AssignmentPattern")
	};

	// Verify that a node is an lval — something that can be assigned
	// to.
	// bindingType can be either:
	// 'var' indicating that the lval creates a 'var' binding
	// 'let' indicating that the lval creates a lexical ('let' or 'const') binding
	// 'none' indicating that the binding should be checked for illegal identifiers, but not for duplicate references

	pp$2.checkLVal = function(expr, bindingType, checkClashes) {
	  var this$1 = this;
	  if ( bindingType === void 0 ) bindingType = BIND_NONE;

	  switch (expr.type) {
	  case "Identifier":
	    if (this.strict && this.reservedWordsStrictBind.test(expr.name))
	      { this.raiseRecoverable(expr.start, (bindingType ? "Binding " : "Assigning to ") + expr.name + " in strict mode"); }
	    if (checkClashes) {
	      if (has(checkClashes, expr.name))
	        { this.raiseRecoverable(expr.start, "Argument name clash"); }
	      checkClashes[expr.name] = true;
	    }
	    if (bindingType !== BIND_NONE && bindingType !== BIND_OUTSIDE) { this.declareName(expr.name, bindingType, expr.start); }
	    break

	  case "MemberExpression":
	    if (bindingType) { this.raiseRecoverable(expr.start, "Binding member expression"); }
	    break

	  case "ObjectPattern":
	    for (var i = 0, list = expr.properties; i < list.length; i += 1)
	      {
	    var prop = list[i];

	    this$1.checkLVal(prop, bindingType, checkClashes);
	  }
	    break

	  case "Property":
	    // AssignmentProperty has type === "Property"
	    this.checkLVal(expr.value, bindingType, checkClashes);
	    break

	  case "ArrayPattern":
	    for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
	      var elem = list$1[i$1];

	    if (elem) { this$1.checkLVal(elem, bindingType, checkClashes); }
	    }
	    break

	  case "AssignmentPattern":
	    this.checkLVal(expr.left, bindingType, checkClashes);
	    break

	  case "RestElement":
	    this.checkLVal(expr.argument, bindingType, checkClashes);
	    break

	  case "ParenthesizedExpression":
	    this.checkLVal(expr.expression, bindingType, checkClashes);
	    break

	  default:
	    this.raise(expr.start, (bindingType ? "Binding" : "Assigning to") + " rvalue");
	  }
	};

	// A recursive descent parser operates by defining functions for all
	// syntactic elements, and recursively calling those, each function
	// advancing the input stream and returning an AST node. Precedence
	// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
	// instead of `(!x)[1]` is handled by the fact that the parser
	// function that parses unary prefix operators is called first, and
	// in turn calls the function that parses `[]` subscripts — that
	// way, it'll receive the node for `x[1]` already parsed, and wraps
	// *that* in the unary operator node.
	//
	// Acorn uses an [operator precedence parser][opp] to handle binary
	// operator precedence, because it is much more compact than using
	// the technique outlined above, which uses different, nesting
	// functions to specify precedence, for all of the ten binary
	// precedence levels that JavaScript defines.
	//
	// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

	var pp$3 = Parser.prototype;

	// Check if property name clashes with already added.
	// Object/class getters and setters are not allowed to clash —
	// either with each other or with an init property — and in
	// strict mode, init properties are also not allowed to be repeated.

	pp$3.checkPropClash = function(prop, propHash, refDestructuringErrors) {
	  if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
	    { return }
	  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
	    { return }
	  var key = prop.key;
	  var name;
	  switch (key.type) {
	  case "Identifier": name = key.name; break
	  case "Literal": name = String(key.value); break
	  default: return
	  }
	  var kind = prop.kind;
	  if (this.options.ecmaVersion >= 6) {
	    if (name === "__proto__" && kind === "init") {
	      if (propHash.proto) {
	        if (refDestructuringErrors && refDestructuringErrors.doubleProto < 0) { refDestructuringErrors.doubleProto = key.start; }
	        // Backwards-compat kludge. Can be removed in version 6.0
	        else { this.raiseRecoverable(key.start, "Redefinition of __proto__ property"); }
	      }
	      propHash.proto = true;
	    }
	    return
	  }
	  name = "$" + name;
	  var other = propHash[name];
	  if (other) {
	    var redefinition;
	    if (kind === "init") {
	      redefinition = this.strict && other.init || other.get || other.set;
	    } else {
	      redefinition = other.init || other[kind];
	    }
	    if (redefinition)
	      { this.raiseRecoverable(key.start, "Redefinition of property"); }
	  } else {
	    other = propHash[name] = {
	      init: false,
	      get: false,
	      set: false
	    };
	  }
	  other[kind] = true;
	};

	// ### Expression parsing

	// These nest, from the most general expression type at the top to
	// 'atomic', nondivisible expression types at the bottom. Most of
	// the functions will simply let the function(s) below them parse,
	// and, *if* the syntactic construct they handle is present, wrap
	// the AST node that the inner parser gave them in another node.

	// Parse a full expression. The optional arguments are used to
	// forbid the `in` operator (in for loops initalization expressions)
	// and provide reference for storing '=' operator inside shorthand
	// property assignment in contexts where both object expression
	// and object pattern might appear (so it's possible to raise
	// delayed syntax error at correct position).

	pp$3.parseExpression = function(noIn, refDestructuringErrors) {
	  var this$1 = this;

	  var startPos = this.start, startLoc = this.startLoc;
	  var expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
	  if (this.type === types.comma) {
	    var node = this.startNodeAt(startPos, startLoc);
	    node.expressions = [expr];
	    while (this.eat(types.comma)) { node.expressions.push(this$1.parseMaybeAssign(noIn, refDestructuringErrors)); }
	    return this.finishNode(node, "SequenceExpression")
	  }
	  return expr
	};

	// Parse an assignment expression. This includes applications of
	// operators like `+=`.

	pp$3.parseMaybeAssign = function(noIn, refDestructuringErrors, afterLeftParse) {
	  if (this.isContextual("yield")) {
	    if (this.inGenerator) { return this.parseYield(noIn) }
	    // The tokenizer will assume an expression is allowed after
	    // `yield`, but this isn't that kind of yield
	    else { this.exprAllowed = false; }
	  }

	  var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldShorthandAssign = -1;
	  if (refDestructuringErrors) {
	    oldParenAssign = refDestructuringErrors.parenthesizedAssign;
	    oldTrailingComma = refDestructuringErrors.trailingComma;
	    oldShorthandAssign = refDestructuringErrors.shorthandAssign;
	    refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.shorthandAssign = -1;
	  } else {
	    refDestructuringErrors = new DestructuringErrors;
	    ownDestructuringErrors = true;
	  }

	  var startPos = this.start, startLoc = this.startLoc;
	  if (this.type === types.parenL || this.type === types.name)
	    { this.potentialArrowAt = this.start; }
	  var left = this.parseMaybeConditional(noIn, refDestructuringErrors);
	  if (afterLeftParse) { left = afterLeftParse.call(this, left, startPos, startLoc); }
	  if (this.type.isAssign) {
	    var node = this.startNodeAt(startPos, startLoc);
	    node.operator = this.value;
	    node.left = this.type === types.eq ? this.toAssignable(left, false, refDestructuringErrors) : left;
	    if (!ownDestructuringErrors) { DestructuringErrors.call(refDestructuringErrors); }
	    refDestructuringErrors.shorthandAssign = -1; // reset because shorthand default was used correctly
	    this.checkLVal(left);
	    this.next();
	    node.right = this.parseMaybeAssign(noIn);
	    return this.finishNode(node, "AssignmentExpression")
	  } else {
	    if (ownDestructuringErrors) { this.checkExpressionErrors(refDestructuringErrors, true); }
	  }
	  if (oldParenAssign > -1) { refDestructuringErrors.parenthesizedAssign = oldParenAssign; }
	  if (oldTrailingComma > -1) { refDestructuringErrors.trailingComma = oldTrailingComma; }
	  if (oldShorthandAssign > -1) { refDestructuringErrors.shorthandAssign = oldShorthandAssign; }
	  return left
	};

	// Parse a ternary conditional (`?:`) operator.

	pp$3.parseMaybeConditional = function(noIn, refDestructuringErrors) {
	  var startPos = this.start, startLoc = this.startLoc;
	  var expr = this.parseExprOps(noIn, refDestructuringErrors);
	  if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
	  if (this.eat(types.question)) {
	    var node = this.startNodeAt(startPos, startLoc);
	    node.test = expr;
	    node.consequent = this.parseMaybeAssign();
	    this.expect(types.colon);
	    node.alternate = this.parseMaybeAssign(noIn);
	    return this.finishNode(node, "ConditionalExpression")
	  }
	  return expr
	};

	// Start the precedence parser.

	pp$3.parseExprOps = function(noIn, refDestructuringErrors) {
	  var startPos = this.start, startLoc = this.startLoc;
	  var expr = this.parseMaybeUnary(refDestructuringErrors, false);
	  if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
	  return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, noIn)
	};

	// Parse binary operators with the operator precedence parsing
	// algorithm. `left` is the left-hand side of the operator.
	// `minPrec` provides context that allows the function to stop and
	// defer further parser to one of its callers when it encounters an
	// operator that has a lower precedence than the set it is parsing.

	pp$3.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, noIn) {
	  var prec = this.type.binop;
	  if (prec != null && (!noIn || this.type !== types._in)) {
	    if (prec > minPrec) {
	      var logical = this.type === types.logicalOR || this.type === types.logicalAND;
	      var op = this.value;
	      this.next();
	      var startPos = this.start, startLoc = this.startLoc;
	      var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn);
	      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical);
	      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn)
	    }
	  }
	  return left
	};

	pp$3.buildBinary = function(startPos, startLoc, left, right, op, logical) {
	  var node = this.startNodeAt(startPos, startLoc);
	  node.left = left;
	  node.operator = op;
	  node.right = right;
	  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
	};

	// Parse unary operators, both prefix and postfix.

	pp$3.parseMaybeUnary = function(refDestructuringErrors, sawUnary) {
	  var this$1 = this;

	  var startPos = this.start, startLoc = this.startLoc, expr;
	  if (this.isContextual("await") && (this.inAsync || (!this.inFunction && this.options.allowAwaitOutsideFunction))) {
	    expr = this.parseAwait();
	    sawUnary = true;
	  } else if (this.type.prefix) {
	    var node = this.startNode(), update = this.type === types.incDec;
	    node.operator = this.value;
	    node.prefix = true;
	    this.next();
	    node.argument = this.parseMaybeUnary(null, true);
	    this.checkExpressionErrors(refDestructuringErrors, true);
	    if (update) { this.checkLVal(node.argument); }
	    else if (this.strict && node.operator === "delete" &&
	             node.argument.type === "Identifier")
	      { this.raiseRecoverable(node.start, "Deleting local variable in strict mode"); }
	    else { sawUnary = true; }
	    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
	  } else {
	    expr = this.parseExprSubscripts(refDestructuringErrors);
	    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
	    while (this.type.postfix && !this.canInsertSemicolon()) {
	      var node$1 = this$1.startNodeAt(startPos, startLoc);
	      node$1.operator = this$1.value;
	      node$1.prefix = false;
	      node$1.argument = expr;
	      this$1.checkLVal(expr);
	      this$1.next();
	      expr = this$1.finishNode(node$1, "UpdateExpression");
	    }
	  }

	  if (!sawUnary && this.eat(types.starstar))
	    { return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false), "**", false) }
	  else
	    { return expr }
	};

	// Parse call, dot, and `[]`-subscript expressions.

	pp$3.parseExprSubscripts = function(refDestructuringErrors) {
	  var startPos = this.start, startLoc = this.startLoc;
	  var expr = this.parseExprAtom(refDestructuringErrors);
	  var skipArrowSubscripts = expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")";
	  if (this.checkExpressionErrors(refDestructuringErrors) || skipArrowSubscripts) { return expr }
	  var result = this.parseSubscripts(expr, startPos, startLoc);
	  if (refDestructuringErrors && result.type === "MemberExpression") {
	    if (refDestructuringErrors.parenthesizedAssign >= result.start) { refDestructuringErrors.parenthesizedAssign = -1; }
	    if (refDestructuringErrors.parenthesizedBind >= result.start) { refDestructuringErrors.parenthesizedBind = -1; }
	  }
	  return result
	};

	pp$3.parseSubscripts = function(base, startPos, startLoc, noCalls) {
	  var this$1 = this;

	  var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
	      this.lastTokEnd === base.end && !this.canInsertSemicolon() && this.input.slice(base.start, base.end) === "async";
	  while (true) {
	    var element = this$1.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow);
	    if (element === base || element.type === "ArrowFunctionExpression") { return element }
	    base = element;
	  }
	};

	pp$3.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow) {
	  var computed = this.eat(types.bracketL);
	  if (computed || this.eat(types.dot)) {
	    var node = this.startNodeAt(startPos, startLoc);
	    node.object = base;
	    node.property = computed ? this.parseExpression() : this.parseIdent(true);
	    node.computed = !!computed;
	    if (computed) { this.expect(types.bracketR); }
	    base = this.finishNode(node, "MemberExpression");
	  } else if (!noCalls && this.eat(types.parenL)) {
	    var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
	    this.yieldPos = 0;
	    this.awaitPos = 0;
	    this.awaitIdentPos = 0;
	    var exprList = this.parseExprList(types.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
	    if (maybeAsyncArrow && !this.canInsertSemicolon() && this.eat(types.arrow)) {
	      this.checkPatternErrors(refDestructuringErrors, false);
	      this.checkYieldAwaitInDefaultParams();
	      if (this.awaitIdentPos > 0)
	        { this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function"); }
	      this.yieldPos = oldYieldPos;
	      this.awaitPos = oldAwaitPos;
	      this.awaitIdentPos = oldAwaitIdentPos;
	      return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true)
	    }
	    this.checkExpressionErrors(refDestructuringErrors, true);
	    this.yieldPos = oldYieldPos || this.yieldPos;
	    this.awaitPos = oldAwaitPos || this.awaitPos;
	    this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
	    var node$1 = this.startNodeAt(startPos, startLoc);
	    node$1.callee = base;
	    node$1.arguments = exprList;
	    base = this.finishNode(node$1, "CallExpression");
	  } else if (this.type === types.backQuote) {
	    var node$2 = this.startNodeAt(startPos, startLoc);
	    node$2.tag = base;
	    node$2.quasi = this.parseTemplate({isTagged: true});
	    base = this.finishNode(node$2, "TaggedTemplateExpression");
	  }
	  return base
	};

	// Parse an atomic expression — either a single token that is an
	// expression, an expression started by a keyword like `function` or
	// `new`, or an expression wrapped in punctuation like `()`, `[]`,
	// or `{}`.

	pp$3.parseExprAtom = function(refDestructuringErrors) {
	  // If a division operator appears in an expression position, the
	  // tokenizer got confused, and we force it to read a regexp instead.
	  if (this.type === types.slash) { this.readRegexp(); }

	  var node, canBeArrow = this.potentialArrowAt === this.start;
	  switch (this.type) {
	  case types._super:
	    if (!this.allowSuper)
	      { this.raise(this.start, "'super' keyword outside a method"); }
	    node = this.startNode();
	    this.next();
	    if (this.type === types.parenL && !this.allowDirectSuper)
	      { this.raise(node.start, "super() call outside constructor of a subclass"); }
	    // The `super` keyword can appear at below:
	    // SuperProperty:
	    //     super [ Expression ]
	    //     super . IdentifierName
	    // SuperCall:
	    //     super Arguments
	    if (this.type !== types.dot && this.type !== types.bracketL && this.type !== types.parenL)
	      { this.unexpected(); }
	    return this.finishNode(node, "Super")

	  case types._this:
	    node = this.startNode();
	    this.next();
	    return this.finishNode(node, "ThisExpression")

	  case types.name:
	    var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
	    var id = this.parseIdent(false);
	    if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types._function))
	      { return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true) }
	    if (canBeArrow && !this.canInsertSemicolon()) {
	      if (this.eat(types.arrow))
	        { return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false) }
	      if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types.name && !containsEsc) {
	        id = this.parseIdent(false);
	        if (this.canInsertSemicolon() || !this.eat(types.arrow))
	          { this.unexpected(); }
	        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true)
	      }
	    }
	    return id

	  case types.regexp:
	    var value = this.value;
	    node = this.parseLiteral(value.value);
	    node.regex = {pattern: value.pattern, flags: value.flags};
	    return node

	  case types.num: case types.string:
	    return this.parseLiteral(this.value)

	  case types._null: case types._true: case types._false:
	    node = this.startNode();
	    node.value = this.type === types._null ? null : this.type === types._true;
	    node.raw = this.type.keyword;
	    this.next();
	    return this.finishNode(node, "Literal")

	  case types.parenL:
	    var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow);
	    if (refDestructuringErrors) {
	      if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
	        { refDestructuringErrors.parenthesizedAssign = start; }
	      if (refDestructuringErrors.parenthesizedBind < 0)
	        { refDestructuringErrors.parenthesizedBind = start; }
	    }
	    return expr

	  case types.bracketL:
	    node = this.startNode();
	    this.next();
	    node.elements = this.parseExprList(types.bracketR, true, true, refDestructuringErrors);
	    return this.finishNode(node, "ArrayExpression")

	  case types.braceL:
	    return this.parseObj(false, refDestructuringErrors)

	  case types._function:
	    node = this.startNode();
	    this.next();
	    return this.parseFunction(node, 0)

	  case types._class:
	    return this.parseClass(this.startNode(), false)

	  case types._new:
	    return this.parseNew()

	  case types.backQuote:
	    return this.parseTemplate()

	  default:
	    this.unexpected();
	  }
	};

	pp$3.parseLiteral = function(value) {
	  var node = this.startNode();
	  node.value = value;
	  node.raw = this.input.slice(this.start, this.end);
	  this.next();
	  return this.finishNode(node, "Literal")
	};

	pp$3.parseParenExpression = function() {
	  this.expect(types.parenL);
	  var val = this.parseExpression();
	  this.expect(types.parenR);
	  return val
	};

	pp$3.parseParenAndDistinguishExpression = function(canBeArrow) {
	  var this$1 = this;

	  var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
	  if (this.options.ecmaVersion >= 6) {
	    this.next();

	    var innerStartPos = this.start, innerStartLoc = this.startLoc;
	    var exprList = [], first = true, lastIsComma = false;
	    var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
	    this.yieldPos = 0;
	    this.awaitPos = 0;
	    // Do not save awaitIdentPos to allow checking awaits nested in parameters
	    while (this.type !== types.parenR) {
	      first ? first = false : this$1.expect(types.comma);
	      if (allowTrailingComma && this$1.afterTrailingComma(types.parenR, true)) {
	        lastIsComma = true;
	        break
	      } else if (this$1.type === types.ellipsis) {
	        spreadStart = this$1.start;
	        exprList.push(this$1.parseParenItem(this$1.parseRestBinding()));
	        if (this$1.type === types.comma) { this$1.raise(this$1.start, "Comma is not permitted after the rest element"); }
	        break
	      } else {
	        exprList.push(this$1.parseMaybeAssign(false, refDestructuringErrors, this$1.parseParenItem));
	      }
	    }
	    var innerEndPos = this.start, innerEndLoc = this.startLoc;
	    this.expect(types.parenR);

	    if (canBeArrow && !this.canInsertSemicolon() && this.eat(types.arrow)) {
	      this.checkPatternErrors(refDestructuringErrors, false);
	      this.checkYieldAwaitInDefaultParams();
	      this.yieldPos = oldYieldPos;
	      this.awaitPos = oldAwaitPos;
	      return this.parseParenArrowList(startPos, startLoc, exprList)
	    }

	    if (!exprList.length || lastIsComma) { this.unexpected(this.lastTokStart); }
	    if (spreadStart) { this.unexpected(spreadStart); }
	    this.checkExpressionErrors(refDestructuringErrors, true);
	    this.yieldPos = oldYieldPos || this.yieldPos;
	    this.awaitPos = oldAwaitPos || this.awaitPos;

	    if (exprList.length > 1) {
	      val = this.startNodeAt(innerStartPos, innerStartLoc);
	      val.expressions = exprList;
	      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
	    } else {
	      val = exprList[0];
	    }
	  } else {
	    val = this.parseParenExpression();
	  }

	  if (this.options.preserveParens) {
	    var par = this.startNodeAt(startPos, startLoc);
	    par.expression = val;
	    return this.finishNode(par, "ParenthesizedExpression")
	  } else {
	    return val
	  }
	};

	pp$3.parseParenItem = function(item) {
	  return item
	};

	pp$3.parseParenArrowList = function(startPos, startLoc, exprList) {
	  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList)
	};

	// New's precedence is slightly tricky. It must allow its argument to
	// be a `[]` or dot subscript expression, but not a call — at least,
	// not without wrapping it in parentheses. Thus, it uses the noCalls
	// argument to parseSubscripts to prevent it from consuming the
	// argument list.

	var empty$1 = [];

	pp$3.parseNew = function() {
	  var node = this.startNode();
	  var meta = this.parseIdent(true);
	  if (this.options.ecmaVersion >= 6 && this.eat(types.dot)) {
	    node.meta = meta;
	    var containsEsc = this.containsEsc;
	    node.property = this.parseIdent(true);
	    if (node.property.name !== "target" || containsEsc)
	      { this.raiseRecoverable(node.property.start, "The only valid meta property for new is new.target"); }
	    if (!this.inNonArrowFunction())
	      { this.raiseRecoverable(node.start, "new.target can only be used in functions"); }
	    return this.finishNode(node, "MetaProperty")
	  }
	  var startPos = this.start, startLoc = this.startLoc;
	  node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
	  if (this.eat(types.parenL)) { node.arguments = this.parseExprList(types.parenR, this.options.ecmaVersion >= 8, false); }
	  else { node.arguments = empty$1; }
	  return this.finishNode(node, "NewExpression")
	};

	// Parse template expression.

	pp$3.parseTemplateElement = function(ref) {
	  var isTagged = ref.isTagged;

	  var elem = this.startNode();
	  if (this.type === types.invalidTemplate) {
	    if (!isTagged) {
	      this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
	    }
	    elem.value = {
	      raw: this.value,
	      cooked: null
	    };
	  } else {
	    elem.value = {
	      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
	      cooked: this.value
	    };
	  }
	  this.next();
	  elem.tail = this.type === types.backQuote;
	  return this.finishNode(elem, "TemplateElement")
	};

	pp$3.parseTemplate = function(ref) {
	  var this$1 = this;
	  if ( ref === void 0 ) ref = {};
	  var isTagged = ref.isTagged; if ( isTagged === void 0 ) isTagged = false;

	  var node = this.startNode();
	  this.next();
	  node.expressions = [];
	  var curElt = this.parseTemplateElement({isTagged: isTagged});
	  node.quasis = [curElt];
	  while (!curElt.tail) {
	    if (this$1.type === types.eof) { this$1.raise(this$1.pos, "Unterminated template literal"); }
	    this$1.expect(types.dollarBraceL);
	    node.expressions.push(this$1.parseExpression());
	    this$1.expect(types.braceR);
	    node.quasis.push(curElt = this$1.parseTemplateElement({isTagged: isTagged}));
	  }
	  this.next();
	  return this.finishNode(node, "TemplateLiteral")
	};

	pp$3.isAsyncProp = function(prop) {
	  return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" &&
	    (this.type === types.name || this.type === types.num || this.type === types.string || this.type === types.bracketL || this.type.keyword || (this.options.ecmaVersion >= 9 && this.type === types.star)) &&
	    !lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
	};

	// Parse an object literal or binding pattern.

	pp$3.parseObj = function(isPattern, refDestructuringErrors) {
	  var this$1 = this;

	  var node = this.startNode(), first = true, propHash = {};
	  node.properties = [];
	  this.next();
	  while (!this.eat(types.braceR)) {
	    if (!first) {
	      this$1.expect(types.comma);
	      if (this$1.afterTrailingComma(types.braceR)) { break }
	    } else { first = false; }

	    var prop = this$1.parseProperty(isPattern, refDestructuringErrors);
	    if (!isPattern) { this$1.checkPropClash(prop, propHash, refDestructuringErrors); }
	    node.properties.push(prop);
	  }
	  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
	};

	pp$3.parseProperty = function(isPattern, refDestructuringErrors) {
	  var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
	  if (this.options.ecmaVersion >= 9 && this.eat(types.ellipsis)) {
	    if (isPattern) {
	      prop.argument = this.parseIdent(false);
	      if (this.type === types.comma) {
	        this.raise(this.start, "Comma is not permitted after the rest element");
	      }
	      return this.finishNode(prop, "RestElement")
	    }
	    // To disallow parenthesized identifier via `this.toAssignable()`.
	    if (this.type === types.parenL && refDestructuringErrors) {
	      if (refDestructuringErrors.parenthesizedAssign < 0) {
	        refDestructuringErrors.parenthesizedAssign = this.start;
	      }
	      if (refDestructuringErrors.parenthesizedBind < 0) {
	        refDestructuringErrors.parenthesizedBind = this.start;
	      }
	    }
	    // Parse argument.
	    prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
	    // To disallow trailing comma via `this.toAssignable()`.
	    if (this.type === types.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
	      refDestructuringErrors.trailingComma = this.start;
	    }
	    // Finish
	    return this.finishNode(prop, "SpreadElement")
	  }
	  if (this.options.ecmaVersion >= 6) {
	    prop.method = false;
	    prop.shorthand = false;
	    if (isPattern || refDestructuringErrors) {
	      startPos = this.start;
	      startLoc = this.startLoc;
	    }
	    if (!isPattern)
	      { isGenerator = this.eat(types.star); }
	  }
	  var containsEsc = this.containsEsc;
	  this.parsePropertyName(prop);
	  if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
	    isAsync = true;
	    isGenerator = this.options.ecmaVersion >= 9 && this.eat(types.star);
	    this.parsePropertyName(prop, refDestructuringErrors);
	  } else {
	    isAsync = false;
	  }
	  this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
	  return this.finishNode(prop, "Property")
	};

	pp$3.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
	  if ((isGenerator || isAsync) && this.type === types.colon)
	    { this.unexpected(); }

	  if (this.eat(types.colon)) {
	    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
	    prop.kind = "init";
	  } else if (this.options.ecmaVersion >= 6 && this.type === types.parenL) {
	    if (isPattern) { this.unexpected(); }
	    prop.kind = "init";
	    prop.method = true;
	    prop.value = this.parseMethod(isGenerator, isAsync);
	  } else if (!isPattern && !containsEsc &&
	             this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
	             (prop.key.name === "get" || prop.key.name === "set") &&
	             (this.type !== types.comma && this.type !== types.braceR)) {
	    if (isGenerator || isAsync) { this.unexpected(); }
	    prop.kind = prop.key.name;
	    this.parsePropertyName(prop);
	    prop.value = this.parseMethod(false);
	    var paramCount = prop.kind === "get" ? 0 : 1;
	    if (prop.value.params.length !== paramCount) {
	      var start = prop.value.start;
	      if (prop.kind === "get")
	        { this.raiseRecoverable(start, "getter should have no params"); }
	      else
	        { this.raiseRecoverable(start, "setter should have exactly one param"); }
	    } else {
	      if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
	        { this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params"); }
	    }
	  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
	    if (isGenerator || isAsync) { this.unexpected(); }
	    this.checkUnreserved(prop.key);
	    if (prop.key.name === "await" && !this.awaitIdentPos)
	      { this.awaitIdentPos = startPos; }
	    prop.kind = "init";
	    if (isPattern) {
	      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
	    } else if (this.type === types.eq && refDestructuringErrors) {
	      if (refDestructuringErrors.shorthandAssign < 0)
	        { refDestructuringErrors.shorthandAssign = this.start; }
	      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
	    } else {
	      prop.value = prop.key;
	    }
	    prop.shorthand = true;
	  } else { this.unexpected(); }
	};

	pp$3.parsePropertyName = function(prop) {
	  if (this.options.ecmaVersion >= 6) {
	    if (this.eat(types.bracketL)) {
	      prop.computed = true;
	      prop.key = this.parseMaybeAssign();
	      this.expect(types.bracketR);
	      return prop.key
	    } else {
	      prop.computed = false;
	    }
	  }
	  return prop.key = this.type === types.num || this.type === types.string ? this.parseExprAtom() : this.parseIdent(true)
	};

	// Initialize empty function node.

	pp$3.initFunction = function(node) {
	  node.id = null;
	  if (this.options.ecmaVersion >= 6) { node.generator = node.expression = false; }
	  if (this.options.ecmaVersion >= 8) { node.async = false; }
	};

	// Parse object or class method.

	pp$3.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
	  var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

	  this.initFunction(node);
	  if (this.options.ecmaVersion >= 6)
	    { node.generator = isGenerator; }
	  if (this.options.ecmaVersion >= 8)
	    { node.async = !!isAsync; }

	  this.yieldPos = 0;
	  this.awaitPos = 0;
	  this.awaitIdentPos = 0;
	  this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));

	  this.expect(types.parenL);
	  node.params = this.parseBindingList(types.parenR, false, this.options.ecmaVersion >= 8);
	  this.checkYieldAwaitInDefaultParams();
	  this.parseFunctionBody(node, false, true);

	  this.yieldPos = oldYieldPos;
	  this.awaitPos = oldAwaitPos;
	  this.awaitIdentPos = oldAwaitIdentPos;
	  return this.finishNode(node, "FunctionExpression")
	};

	// Parse arrow function expression with given parameters.

	pp$3.parseArrowExpression = function(node, params, isAsync) {
	  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

	  this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
	  this.initFunction(node);
	  if (this.options.ecmaVersion >= 8) { node.async = !!isAsync; }

	  this.yieldPos = 0;
	  this.awaitPos = 0;
	  this.awaitIdentPos = 0;

	  node.params = this.toAssignableList(params, true);
	  this.parseFunctionBody(node, true, false);

	  this.yieldPos = oldYieldPos;
	  this.awaitPos = oldAwaitPos;
	  this.awaitIdentPos = oldAwaitIdentPos;
	  return this.finishNode(node, "ArrowFunctionExpression")
	};

	// Parse function body and check parameters.

	pp$3.parseFunctionBody = function(node, isArrowFunction, isMethod) {
	  var isExpression = isArrowFunction && this.type !== types.braceL;
	  var oldStrict = this.strict, useStrict = false;

	  if (isExpression) {
	    node.body = this.parseMaybeAssign();
	    node.expression = true;
	    this.checkParams(node, false);
	  } else {
	    var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
	    if (!oldStrict || nonSimple) {
	      useStrict = this.strictDirective(this.end);
	      // If this is a strict mode function, verify that argument names
	      // are not repeated, and it does not try to bind the words `eval`
	      // or `arguments`.
	      if (useStrict && nonSimple)
	        { this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list"); }
	    }
	    // Start a new scope with regard to labels and the `inFunction`
	    // flag (restore them to their old value afterwards).
	    var oldLabels = this.labels;
	    this.labels = [];
	    if (useStrict) { this.strict = true; }

	    // Add the params to varDeclaredNames to ensure that an error is thrown
	    // if a let/const declaration in the function clashes with one of the params.
	    this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
	    node.body = this.parseBlock(false);
	    node.expression = false;
	    this.adaptDirectivePrologue(node.body.body);
	    this.labels = oldLabels;
	  }
	  this.exitScope();

	  // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
	  if (this.strict && node.id) { this.checkLVal(node.id, BIND_OUTSIDE); }
	  this.strict = oldStrict;
	};

	pp$3.isSimpleParamList = function(params) {
	  for (var i = 0, list = params; i < list.length; i += 1)
	    {
	    var param = list[i];

	    if (param.type !== "Identifier") { return false
	  } }
	  return true
	};

	// Checks function params for various disallowed patterns such as using "eval"
	// or "arguments" and duplicate parameters.

	pp$3.checkParams = function(node, allowDuplicates) {
	  var this$1 = this;

	  var nameHash = {};
	  for (var i = 0, list = node.params; i < list.length; i += 1)
	    {
	    var param = list[i];

	    this$1.checkLVal(param, BIND_VAR, allowDuplicates ? null : nameHash);
	  }
	};

	// Parses a comma-separated list of expressions, and returns them as
	// an array. `close` is the token type that ends the list, and
	// `allowEmpty` can be turned on to allow subsequent commas with
	// nothing in between them to be parsed as `null` (which is needed
	// for array literals).

	pp$3.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
	  var this$1 = this;

	  var elts = [], first = true;
	  while (!this.eat(close)) {
	    if (!first) {
	      this$1.expect(types.comma);
	      if (allowTrailingComma && this$1.afterTrailingComma(close)) { break }
	    } else { first = false; }

	    var elt = (void 0);
	    if (allowEmpty && this$1.type === types.comma)
	      { elt = null; }
	    else if (this$1.type === types.ellipsis) {
	      elt = this$1.parseSpread(refDestructuringErrors);
	      if (refDestructuringErrors && this$1.type === types.comma && refDestructuringErrors.trailingComma < 0)
	        { refDestructuringErrors.trailingComma = this$1.start; }
	    } else {
	      elt = this$1.parseMaybeAssign(false, refDestructuringErrors);
	    }
	    elts.push(elt);
	  }
	  return elts
	};

	pp$3.checkUnreserved = function(ref) {
	  var start = ref.start;
	  var end = ref.end;
	  var name = ref.name;

	  if (this.inGenerator && name === "yield")
	    { this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator"); }
	  if (this.inAsync && name === "await")
	    { this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function"); }
	  if (this.keywords.test(name))
	    { this.raise(start, ("Unexpected keyword '" + name + "'")); }
	  if (this.options.ecmaVersion < 6 &&
	    this.input.slice(start, end).indexOf("\\") !== -1) { return }
	  var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
	  if (re.test(name)) {
	    if (!this.inAsync && name === "await")
	      { this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function"); }
	    this.raiseRecoverable(start, ("The keyword '" + name + "' is reserved"));
	  }
	};

	// Parse the next token as an identifier. If `liberal` is true (used
	// when parsing properties), it will also convert keywords into
	// identifiers.

	pp$3.parseIdent = function(liberal, isBinding) {
	  var node = this.startNode();
	  if (liberal && this.options.allowReserved === "never") { liberal = false; }
	  if (this.type === types.name) {
	    node.name = this.value;
	  } else if (this.type.keyword) {
	    node.name = this.type.keyword;

	    // To fix https://github.com/acornjs/acorn/issues/575
	    // `class` and `function` keywords push new context into this.context.
	    // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
	    // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
	    if ((node.name === "class" || node.name === "function") &&
	        (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
	      this.context.pop();
	    }
	  } else {
	    this.unexpected();
	  }
	  this.next();
	  this.finishNode(node, "Identifier");
	  if (!liberal) {
	    this.checkUnreserved(node);
	    if (node.name === "await" && !this.awaitIdentPos)
	      { this.awaitIdentPos = node.start; }
	  }
	  return node
	};

	// Parses yield expression inside generator.

	pp$3.parseYield = function(noIn) {
	  if (!this.yieldPos) { this.yieldPos = this.start; }

	  var node = this.startNode();
	  this.next();
	  if (this.type === types.semi || this.canInsertSemicolon() || (this.type !== types.star && !this.type.startsExpr)) {
	    node.delegate = false;
	    node.argument = null;
	  } else {
	    node.delegate = this.eat(types.star);
	    node.argument = this.parseMaybeAssign(noIn);
	  }
	  return this.finishNode(node, "YieldExpression")
	};

	pp$3.parseAwait = function() {
	  if (!this.awaitPos) { this.awaitPos = this.start; }

	  var node = this.startNode();
	  this.next();
	  node.argument = this.parseMaybeUnary(null, true);
	  return this.finishNode(node, "AwaitExpression")
	};

	var pp$4 = Parser.prototype;

	// This function is used to raise exceptions on parse errors. It
	// takes an offset integer (into the current `input`) to indicate
	// the location of the error, attaches the position to the end
	// of the error message, and then raises a `SyntaxError` with that
	// message.

	pp$4.raise = function(pos, message) {
	  var loc = getLineInfo(this.input, pos);
	  message += " (" + loc.line + ":" + loc.column + ")";
	  var err = new SyntaxError(message);
	  err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
	  throw err
	};

	pp$4.raiseRecoverable = pp$4.raise;

	pp$4.curPosition = function() {
	  if (this.options.locations) {
	    return new Position(this.curLine, this.pos - this.lineStart)
	  }
	};

	var pp$5 = Parser.prototype;

	var Scope = function Scope(flags) {
	  this.flags = flags;
	  // A list of var-declared names in the current lexical scope
	  this.var = [];
	  // A list of lexically-declared names in the current lexical scope
	  this.lexical = [];
	  // A list of lexically-declared FunctionDeclaration names in the current lexical scope
	  this.functions = [];
	};

	// The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

	pp$5.enterScope = function(flags) {
	  this.scopeStack.push(new Scope(flags));
	};

	pp$5.exitScope = function() {
	  this.scopeStack.pop();
	};

	// The spec says:
	// > At the top level of a function, or script, function declarations are
	// > treated like var declarations rather than like lexical declarations.
	pp$5.treatFunctionsAsVarInScope = function(scope) {
	  return (scope.flags & SCOPE_FUNCTION) || !this.inModule && (scope.flags & SCOPE_TOP)
	};

	pp$5.declareName = function(name, bindingType, pos) {
	  var this$1 = this;

	  var redeclared = false;
	  if (bindingType === BIND_LEXICAL) {
	    var scope = this.currentScope();
	    redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
	    scope.lexical.push(name);
	    if (this.inModule && (scope.flags & SCOPE_TOP))
	      { delete this.undefinedExports[name]; }
	  } else if (bindingType === BIND_SIMPLE_CATCH) {
	    var scope$1 = this.currentScope();
	    scope$1.lexical.push(name);
	  } else if (bindingType === BIND_FUNCTION) {
	    var scope$2 = this.currentScope();
	    if (this.treatFunctionsAsVar)
	      { redeclared = scope$2.lexical.indexOf(name) > -1; }
	    else
	      { redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1; }
	    scope$2.functions.push(name);
	  } else {
	    for (var i = this.scopeStack.length - 1; i >= 0; --i) {
	      var scope$3 = this$1.scopeStack[i];
	      if (scope$3.lexical.indexOf(name) > -1 && !((scope$3.flags & SCOPE_SIMPLE_CATCH) && scope$3.lexical[0] === name) ||
	          !this$1.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
	        redeclared = true;
	        break
	      }
	      scope$3.var.push(name);
	      if (this$1.inModule && (scope$3.flags & SCOPE_TOP))
	        { delete this$1.undefinedExports[name]; }
	      if (scope$3.flags & SCOPE_VAR) { break }
	    }
	  }
	  if (redeclared) { this.raiseRecoverable(pos, ("Identifier '" + name + "' has already been declared")); }
	};

	pp$5.checkLocalExport = function(id) {
	  // scope.functions must be empty as Module code is always strict.
	  if (this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
	      this.scopeStack[0].var.indexOf(id.name) === -1) {
	    this.undefinedExports[id.name] = id;
	  }
	};

	pp$5.currentScope = function() {
	  return this.scopeStack[this.scopeStack.length - 1]
	};

	pp$5.currentVarScope = function() {
	  var this$1 = this;

	  for (var i = this.scopeStack.length - 1;; i--) {
	    var scope = this$1.scopeStack[i];
	    if (scope.flags & SCOPE_VAR) { return scope }
	  }
	};

	// Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
	pp$5.currentThisScope = function() {
	  var this$1 = this;

	  for (var i = this.scopeStack.length - 1;; i--) {
	    var scope = this$1.scopeStack[i];
	    if (scope.flags & SCOPE_VAR && !(scope.flags & SCOPE_ARROW)) { return scope }
	  }
	};

	var Node = function Node(parser, pos, loc) {
	  this.type = "";
	  this.start = pos;
	  this.end = 0;
	  if (parser.options.locations)
	    { this.loc = new SourceLocation(parser, loc); }
	  if (parser.options.directSourceFile)
	    { this.sourceFile = parser.options.directSourceFile; }
	  if (parser.options.ranges)
	    { this.range = [pos, 0]; }
	};

	// Start an AST node, attaching a start offset.

	var pp$6 = Parser.prototype;

	pp$6.startNode = function() {
	  return new Node(this, this.start, this.startLoc)
	};

	pp$6.startNodeAt = function(pos, loc) {
	  return new Node(this, pos, loc)
	};

	// Finish an AST node, adding `type` and `end` properties.

	function finishNodeAt(node, type, pos, loc) {
	  node.type = type;
	  node.end = pos;
	  if (this.options.locations)
	    { node.loc.end = loc; }
	  if (this.options.ranges)
	    { node.range[1] = pos; }
	  return node
	}

	pp$6.finishNode = function(node, type) {
	  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
	};

	// Finish node at given position

	pp$6.finishNodeAt = function(node, type, pos, loc) {
	  return finishNodeAt.call(this, node, type, pos, loc)
	};

	// The algorithm used to determine whether a regexp can appear at a
	// given point in the program is loosely based on sweet.js' approach.
	// See https://github.com/mozilla/sweet.js/wiki/design

	var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
	  this.token = token;
	  this.isExpr = !!isExpr;
	  this.preserveSpace = !!preserveSpace;
	  this.override = override;
	  this.generator = !!generator;
	};

	var types$1 = {
	  b_stat: new TokContext("{", false),
	  b_expr: new TokContext("{", true),
	  b_tmpl: new TokContext("${", false),
	  p_stat: new TokContext("(", false),
	  p_expr: new TokContext("(", true),
	  q_tmpl: new TokContext("`", true, true, function (p) { return p.tryReadTemplateToken(); }),
	  f_stat: new TokContext("function", false),
	  f_expr: new TokContext("function", true),
	  f_expr_gen: new TokContext("function", true, false, null, true),
	  f_gen: new TokContext("function", false, false, null, true)
	};

	var pp$7 = Parser.prototype;

	pp$7.initialContext = function() {
	  return [types$1.b_stat]
	};

	pp$7.braceIsBlock = function(prevType) {
	  var parent = this.curContext();
	  if (parent === types$1.f_expr || parent === types$1.f_stat)
	    { return true }
	  if (prevType === types.colon && (parent === types$1.b_stat || parent === types$1.b_expr))
	    { return !parent.isExpr }

	  // The check for `tt.name && exprAllowed` detects whether we are
	  // after a `yield` or `of` construct. See the `updateContext` for
	  // `tt.name`.
	  if (prevType === types._return || prevType === types.name && this.exprAllowed)
	    { return lineBreak.test(this.input.slice(this.lastTokEnd, this.start)) }
	  if (prevType === types._else || prevType === types.semi || prevType === types.eof || prevType === types.parenR || prevType === types.arrow)
	    { return true }
	  if (prevType === types.braceL)
	    { return parent === types$1.b_stat }
	  if (prevType === types._var || prevType === types._const || prevType === types.name)
	    { return false }
	  return !this.exprAllowed
	};

	pp$7.inGeneratorContext = function() {
	  var this$1 = this;

	  for (var i = this.context.length - 1; i >= 1; i--) {
	    var context = this$1.context[i];
	    if (context.token === "function")
	      { return context.generator }
	  }
	  return false
	};

	pp$7.updateContext = function(prevType) {
	  var update, type = this.type;
	  if (type.keyword && prevType === types.dot)
	    { this.exprAllowed = false; }
	  else if (update = type.updateContext)
	    { update.call(this, prevType); }
	  else
	    { this.exprAllowed = type.beforeExpr; }
	};

	// Token-specific context update code

	types.parenR.updateContext = types.braceR.updateContext = function() {
	  if (this.context.length === 1) {
	    this.exprAllowed = true;
	    return
	  }
	  var out = this.context.pop();
	  if (out === types$1.b_stat && this.curContext().token === "function") {
	    out = this.context.pop();
	  }
	  this.exprAllowed = !out.isExpr;
	};

	types.braceL.updateContext = function(prevType) {
	  this.context.push(this.braceIsBlock(prevType) ? types$1.b_stat : types$1.b_expr);
	  this.exprAllowed = true;
	};

	types.dollarBraceL.updateContext = function() {
	  this.context.push(types$1.b_tmpl);
	  this.exprAllowed = true;
	};

	types.parenL.updateContext = function(prevType) {
	  var statementParens = prevType === types._if || prevType === types._for || prevType === types._with || prevType === types._while;
	  this.context.push(statementParens ? types$1.p_stat : types$1.p_expr);
	  this.exprAllowed = true;
	};

	types.incDec.updateContext = function() {
	  // tokExprAllowed stays unchanged
	};

	types._function.updateContext = types._class.updateContext = function(prevType) {
	  if (prevType.beforeExpr && prevType !== types.semi && prevType !== types._else &&
	      !(prevType === types._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) &&
	      !((prevType === types.colon || prevType === types.braceL) && this.curContext() === types$1.b_stat))
	    { this.context.push(types$1.f_expr); }
	  else
	    { this.context.push(types$1.f_stat); }
	  this.exprAllowed = false;
	};

	types.backQuote.updateContext = function() {
	  if (this.curContext() === types$1.q_tmpl)
	    { this.context.pop(); }
	  else
	    { this.context.push(types$1.q_tmpl); }
	  this.exprAllowed = false;
	};

	types.star.updateContext = function(prevType) {
	  if (prevType === types._function) {
	    var index = this.context.length - 1;
	    if (this.context[index] === types$1.f_expr)
	      { this.context[index] = types$1.f_expr_gen; }
	    else
	      { this.context[index] = types$1.f_gen; }
	  }
	  this.exprAllowed = true;
	};

	types.name.updateContext = function(prevType) {
	  var allowed = false;
	  if (this.options.ecmaVersion >= 6 && prevType !== types.dot) {
	    if (this.value === "of" && !this.exprAllowed ||
	        this.value === "yield" && this.inGeneratorContext())
	      { allowed = true; }
	  }
	  this.exprAllowed = allowed;
	};

	// This file contains Unicode properties extracted from the ECMAScript
	// specification. The lists are extracted like so:
	// $$('#table-binary-unicode-properties > figure > table > tbody > tr > td:nth-child(1) code').map(el => el.innerText)

	// #table-binary-unicode-properties
	var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
	var unicodeBinaryProperties = {
	  9: ecma9BinaryProperties,
	  10: ecma9BinaryProperties + " Extended_Pictographic"
	};

	// #table-unicode-general-category-values
	var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";

	// #table-unicode-script-values
	var ecma9ScriptValues = "Adlam Adlm Ahom Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
	var unicodeScriptValues = {
	  9: ecma9ScriptValues,
	  10: ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd"
	};

	var data = {};
	function buildUnicodeData(ecmaVersion) {
	  var d = data[ecmaVersion] = {
	    binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
	    nonBinary: {
	      General_Category: wordsRegexp(unicodeGeneralCategoryValues),
	      Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
	    }
	  };
	  d.nonBinary.Script_Extensions = d.nonBinary.Script;

	  d.nonBinary.gc = d.nonBinary.General_Category;
	  d.nonBinary.sc = d.nonBinary.Script;
	  d.nonBinary.scx = d.nonBinary.Script_Extensions;
	}
	buildUnicodeData(9);
	buildUnicodeData(10);

	var pp$9 = Parser.prototype;

	var RegExpValidationState = function RegExpValidationState(parser) {
	  this.parser = parser;
	  this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "");
	  this.unicodeProperties = data[parser.options.ecmaVersion >= 10 ? 10 : parser.options.ecmaVersion];
	  this.source = "";
	  this.flags = "";
	  this.start = 0;
	  this.switchU = false;
	  this.switchN = false;
	  this.pos = 0;
	  this.lastIntValue = 0;
	  this.lastStringValue = "";
	  this.lastAssertionIsQuantifiable = false;
	  this.numCapturingParens = 0;
	  this.maxBackReference = 0;
	  this.groupNames = [];
	  this.backReferenceNames = [];
	};

	RegExpValidationState.prototype.reset = function reset (start, pattern, flags) {
	  var unicode = flags.indexOf("u") !== -1;
	  this.start = start | 0;
	  this.source = pattern + "";
	  this.flags = flags;
	  this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
	  this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
	};

	RegExpValidationState.prototype.raise = function raise (message) {
	  this.parser.raiseRecoverable(this.start, ("Invalid regular expression: /" + (this.source) + "/: " + message));
	};

	// If u flag is given, this returns the code point at the index (it combines a surrogate pair).
	// Otherwise, this returns the code unit of the index (can be a part of a surrogate pair).
	RegExpValidationState.prototype.at = function at (i) {
	  var s = this.source;
	  var l = s.length;
	  if (i >= l) {
	    return -1
	  }
	  var c = s.charCodeAt(i);
	  if (!this.switchU || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
	    return c
	  }
	  return (c << 10) + s.charCodeAt(i + 1) - 0x35FDC00
	};

	RegExpValidationState.prototype.nextIndex = function nextIndex (i) {
	  var s = this.source;
	  var l = s.length;
	  if (i >= l) {
	    return l
	  }
	  var c = s.charCodeAt(i);
	  if (!this.switchU || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
	    return i + 1
	  }
	  return i + 2
	};

	RegExpValidationState.prototype.current = function current () {
	  return this.at(this.pos)
	};

	RegExpValidationState.prototype.lookahead = function lookahead () {
	  return this.at(this.nextIndex(this.pos))
	};

	RegExpValidationState.prototype.advance = function advance () {
	  this.pos = this.nextIndex(this.pos);
	};

	RegExpValidationState.prototype.eat = function eat (ch) {
	  if (this.current() === ch) {
	    this.advance();
	    return true
	  }
	  return false
	};

	function codePointToString$1(ch) {
	  if (ch <= 0xFFFF) { return String.fromCharCode(ch) }
	  ch -= 0x10000;
	  return String.fromCharCode((ch >> 10) + 0xD800, (ch & 0x03FF) + 0xDC00)
	}

	/**
	 * Validate the flags part of a given RegExpLiteral.
	 *
	 * @param {RegExpValidationState} state The state to validate RegExp.
	 * @returns {void}
	 */
	pp$9.validateRegExpFlags = function(state) {
	  var this$1 = this;

	  var validFlags = state.validFlags;
	  var flags = state.flags;

	  for (var i = 0; i < flags.length; i++) {
	    var flag = flags.charAt(i);
	    if (validFlags.indexOf(flag) === -1) {
	      this$1.raise(state.start, "Invalid regular expression flag");
	    }
	    if (flags.indexOf(flag, i + 1) > -1) {
	      this$1.raise(state.start, "Duplicate regular expression flag");
	    }
	  }
	};

	/**
	 * Validate the pattern part of a given RegExpLiteral.
	 *
	 * @param {RegExpValidationState} state The state to validate RegExp.
	 * @returns {void}
	 */
	pp$9.validateRegExpPattern = function(state) {
	  this.regexp_pattern(state);

	  // The goal symbol for the parse is |Pattern[~U, ~N]|. If the result of
	  // parsing contains a |GroupName|, reparse with the goal symbol
	  // |Pattern[~U, +N]| and use this result instead. Throw a *SyntaxError*
	  // exception if _P_ did not conform to the grammar, if any elements of _P_
	  // were not matched by the parse, or if any Early Error conditions exist.
	  if (!state.switchN && this.options.ecmaVersion >= 9 && state.groupNames.length > 0) {
	    state.switchN = true;
	    this.regexp_pattern(state);
	  }
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-Pattern
	pp$9.regexp_pattern = function(state) {
	  state.pos = 0;
	  state.lastIntValue = 0;
	  state.lastStringValue = "";
	  state.lastAssertionIsQuantifiable = false;
	  state.numCapturingParens = 0;
	  state.maxBackReference = 0;
	  state.groupNames.length = 0;
	  state.backReferenceNames.length = 0;

	  this.regexp_disjunction(state);

	  if (state.pos !== state.source.length) {
	    // Make the same messages as V8.
	    if (state.eat(0x29 /* ) */)) {
	      state.raise("Unmatched ')'");
	    }
	    if (state.eat(0x5D /* [ */) || state.eat(0x7D /* } */)) {
	      state.raise("Lone quantifier brackets");
	    }
	  }
	  if (state.maxBackReference > state.numCapturingParens) {
	    state.raise("Invalid escape");
	  }
	  for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
	    var name = list[i];

	    if (state.groupNames.indexOf(name) === -1) {
	      state.raise("Invalid named capture referenced");
	    }
	  }
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-Disjunction
	pp$9.regexp_disjunction = function(state) {
	  var this$1 = this;

	  this.regexp_alternative(state);
	  while (state.eat(0x7C /* | */)) {
	    this$1.regexp_alternative(state);
	  }

	  // Make the same message as V8.
	  if (this.regexp_eatQuantifier(state, true)) {
	    state.raise("Nothing to repeat");
	  }
	  if (state.eat(0x7B /* { */)) {
	    state.raise("Lone quantifier brackets");
	  }
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-Alternative
	pp$9.regexp_alternative = function(state) {
	  while (state.pos < state.source.length && this.regexp_eatTerm(state))
	    {  }
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Term
	pp$9.regexp_eatTerm = function(state) {
	  if (this.regexp_eatAssertion(state)) {
	    // Handle `QuantifiableAssertion Quantifier` alternative.
	    // `state.lastAssertionIsQuantifiable` is true if the last eaten Assertion
	    // is a QuantifiableAssertion.
	    if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
	      // Make the same message as V8.
	      if (state.switchU) {
	        state.raise("Invalid quantifier");
	      }
	    }
	    return true
	  }

	  if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
	    this.regexp_eatQuantifier(state);
	    return true
	  }

	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Assertion
	pp$9.regexp_eatAssertion = function(state) {
	  var start = state.pos;
	  state.lastAssertionIsQuantifiable = false;

	  // ^, $
	  if (state.eat(0x5E /* ^ */) || state.eat(0x24 /* $ */)) {
	    return true
	  }

	  // \b \B
	  if (state.eat(0x5C /* \ */)) {
	    if (state.eat(0x42 /* B */) || state.eat(0x62 /* b */)) {
	      return true
	    }
	    state.pos = start;
	  }

	  // Lookahead / Lookbehind
	  if (state.eat(0x28 /* ( */) && state.eat(0x3F /* ? */)) {
	    var lookbehind = false;
	    if (this.options.ecmaVersion >= 9) {
	      lookbehind = state.eat(0x3C /* < */);
	    }
	    if (state.eat(0x3D /* = */) || state.eat(0x21 /* ! */)) {
	      this.regexp_disjunction(state);
	      if (!state.eat(0x29 /* ) */)) {
	        state.raise("Unterminated group");
	      }
	      state.lastAssertionIsQuantifiable = !lookbehind;
	      return true
	    }
	  }

	  state.pos = start;
	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-Quantifier
	pp$9.regexp_eatQuantifier = function(state, noError) {
	  if ( noError === void 0 ) noError = false;

	  if (this.regexp_eatQuantifierPrefix(state, noError)) {
	    state.eat(0x3F /* ? */);
	    return true
	  }
	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-QuantifierPrefix
	pp$9.regexp_eatQuantifierPrefix = function(state, noError) {
	  return (
	    state.eat(0x2A /* * */) ||
	    state.eat(0x2B /* + */) ||
	    state.eat(0x3F /* ? */) ||
	    this.regexp_eatBracedQuantifier(state, noError)
	  )
	};
	pp$9.regexp_eatBracedQuantifier = function(state, noError) {
	  var start = state.pos;
	  if (state.eat(0x7B /* { */)) {
	    var min = 0, max = -1;
	    if (this.regexp_eatDecimalDigits(state)) {
	      min = state.lastIntValue;
	      if (state.eat(0x2C /* , */) && this.regexp_eatDecimalDigits(state)) {
	        max = state.lastIntValue;
	      }
	      if (state.eat(0x7D /* } */)) {
	        // SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-term
	        if (max !== -1 && max < min && !noError) {
	          state.raise("numbers out of order in {} quantifier");
	        }
	        return true
	      }
	    }
	    if (state.switchU && !noError) {
	      state.raise("Incomplete quantifier");
	    }
	    state.pos = start;
	  }
	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-Atom
	pp$9.regexp_eatAtom = function(state) {
	  return (
	    this.regexp_eatPatternCharacters(state) ||
	    state.eat(0x2E /* . */) ||
	    this.regexp_eatReverseSolidusAtomEscape(state) ||
	    this.regexp_eatCharacterClass(state) ||
	    this.regexp_eatUncapturingGroup(state) ||
	    this.regexp_eatCapturingGroup(state)
	  )
	};
	pp$9.regexp_eatReverseSolidusAtomEscape = function(state) {
	  var start = state.pos;
	  if (state.eat(0x5C /* \ */)) {
	    if (this.regexp_eatAtomEscape(state)) {
	      return true
	    }
	    state.pos = start;
	  }
	  return false
	};
	pp$9.regexp_eatUncapturingGroup = function(state) {
	  var start = state.pos;
	  if (state.eat(0x28 /* ( */)) {
	    if (state.eat(0x3F /* ? */) && state.eat(0x3A /* : */)) {
	      this.regexp_disjunction(state);
	      if (state.eat(0x29 /* ) */)) {
	        return true
	      }
	      state.raise("Unterminated group");
	    }
	    state.pos = start;
	  }
	  return false
	};
	pp$9.regexp_eatCapturingGroup = function(state) {
	  if (state.eat(0x28 /* ( */)) {
	    if (this.options.ecmaVersion >= 9) {
	      this.regexp_groupSpecifier(state);
	    } else if (state.current() === 0x3F /* ? */) {
	      state.raise("Invalid group");
	    }
	    this.regexp_disjunction(state);
	    if (state.eat(0x29 /* ) */)) {
	      state.numCapturingParens += 1;
	      return true
	    }
	    state.raise("Unterminated group");
	  }
	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedAtom
	pp$9.regexp_eatExtendedAtom = function(state) {
	  return (
	    state.eat(0x2E /* . */) ||
	    this.regexp_eatReverseSolidusAtomEscape(state) ||
	    this.regexp_eatCharacterClass(state) ||
	    this.regexp_eatUncapturingGroup(state) ||
	    this.regexp_eatCapturingGroup(state) ||
	    this.regexp_eatInvalidBracedQuantifier(state) ||
	    this.regexp_eatExtendedPatternCharacter(state)
	  )
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-InvalidBracedQuantifier
	pp$9.regexp_eatInvalidBracedQuantifier = function(state) {
	  if (this.regexp_eatBracedQuantifier(state, true)) {
	    state.raise("Nothing to repeat");
	  }
	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-SyntaxCharacter
	pp$9.regexp_eatSyntaxCharacter = function(state) {
	  var ch = state.current();
	  if (isSyntaxCharacter(ch)) {
	    state.lastIntValue = ch;
	    state.advance();
	    return true
	  }
	  return false
	};
	function isSyntaxCharacter(ch) {
	  return (
	    ch === 0x24 /* $ */ ||
	    ch >= 0x28 /* ( */ && ch <= 0x2B /* + */ ||
	    ch === 0x2E /* . */ ||
	    ch === 0x3F /* ? */ ||
	    ch >= 0x5B /* [ */ && ch <= 0x5E /* ^ */ ||
	    ch >= 0x7B /* { */ && ch <= 0x7D /* } */
	  )
	}

	// https://www.ecma-international.org/ecma-262/8.0/#prod-PatternCharacter
	// But eat eager.
	pp$9.regexp_eatPatternCharacters = function(state) {
	  var start = state.pos;
	  var ch = 0;
	  while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
	    state.advance();
	  }
	  return state.pos !== start
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedPatternCharacter
	pp$9.regexp_eatExtendedPatternCharacter = function(state) {
	  var ch = state.current();
	  if (
	    ch !== -1 &&
	    ch !== 0x24 /* $ */ &&
	    !(ch >= 0x28 /* ( */ && ch <= 0x2B /* + */) &&
	    ch !== 0x2E /* . */ &&
	    ch !== 0x3F /* ? */ &&
	    ch !== 0x5B /* [ */ &&
	    ch !== 0x5E /* ^ */ &&
	    ch !== 0x7C /* | */
	  ) {
	    state.advance();
	    return true
	  }
	  return false
	};

	// GroupSpecifier[U] ::
	//   [empty]
	//   `?` GroupName[?U]
	pp$9.regexp_groupSpecifier = function(state) {
	  if (state.eat(0x3F /* ? */)) {
	    if (this.regexp_eatGroupName(state)) {
	      if (state.groupNames.indexOf(state.lastStringValue) !== -1) {
	        state.raise("Duplicate capture group name");
	      }
	      state.groupNames.push(state.lastStringValue);
	      return
	    }
	    state.raise("Invalid group");
	  }
	};

	// GroupName[U] ::
	//   `<` RegExpIdentifierName[?U] `>`
	// Note: this updates `state.lastStringValue` property with the eaten name.
	pp$9.regexp_eatGroupName = function(state) {
	  state.lastStringValue = "";
	  if (state.eat(0x3C /* < */)) {
	    if (this.regexp_eatRegExpIdentifierName(state) && state.eat(0x3E /* > */)) {
	      return true
	    }
	    state.raise("Invalid capture group name");
	  }
	  return false
	};

	// RegExpIdentifierName[U] ::
	//   RegExpIdentifierStart[?U]
	//   RegExpIdentifierName[?U] RegExpIdentifierPart[?U]
	// Note: this updates `state.lastStringValue` property with the eaten name.
	pp$9.regexp_eatRegExpIdentifierName = function(state) {
	  state.lastStringValue = "";
	  if (this.regexp_eatRegExpIdentifierStart(state)) {
	    state.lastStringValue += codePointToString$1(state.lastIntValue);
	    while (this.regexp_eatRegExpIdentifierPart(state)) {
	      state.lastStringValue += codePointToString$1(state.lastIntValue);
	    }
	    return true
	  }
	  return false
	};

	// RegExpIdentifierStart[U] ::
	//   UnicodeIDStart
	//   `$`
	//   `_`
	//   `\` RegExpUnicodeEscapeSequence[?U]
	pp$9.regexp_eatRegExpIdentifierStart = function(state) {
	  var start = state.pos;
	  var ch = state.current();
	  state.advance();

	  if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state)) {
	    ch = state.lastIntValue;
	  }
	  if (isRegExpIdentifierStart(ch)) {
	    state.lastIntValue = ch;
	    return true
	  }

	  state.pos = start;
	  return false
	};
	function isRegExpIdentifierStart(ch) {
	  return isIdentifierStart(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */
	}

	// RegExpIdentifierPart[U] ::
	//   UnicodeIDContinue
	//   `$`
	//   `_`
	//   `\` RegExpUnicodeEscapeSequence[?U]
	//   <ZWNJ>
	//   <ZWJ>
	pp$9.regexp_eatRegExpIdentifierPart = function(state) {
	  var start = state.pos;
	  var ch = state.current();
	  state.advance();

	  if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state)) {
	    ch = state.lastIntValue;
	  }
	  if (isRegExpIdentifierPart(ch)) {
	    state.lastIntValue = ch;
	    return true
	  }

	  state.pos = start;
	  return false
	};
	function isRegExpIdentifierPart(ch) {
	  return isIdentifierChar(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */ || ch === 0x200C /* <ZWNJ> */ || ch === 0x200D /* <ZWJ> */
	}

	// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-AtomEscape
	pp$9.regexp_eatAtomEscape = function(state) {
	  if (
	    this.regexp_eatBackReference(state) ||
	    this.regexp_eatCharacterClassEscape(state) ||
	    this.regexp_eatCharacterEscape(state) ||
	    (state.switchN && this.regexp_eatKGroupName(state))
	  ) {
	    return true
	  }
	  if (state.switchU) {
	    // Make the same message as V8.
	    if (state.current() === 0x63 /* c */) {
	      state.raise("Invalid unicode escape");
	    }
	    state.raise("Invalid escape");
	  }
	  return false
	};
	pp$9.regexp_eatBackReference = function(state) {
	  var start = state.pos;
	  if (this.regexp_eatDecimalEscape(state)) {
	    var n = state.lastIntValue;
	    if (state.switchU) {
	      // For SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-atomescape
	      if (n > state.maxBackReference) {
	        state.maxBackReference = n;
	      }
	      return true
	    }
	    if (n <= state.numCapturingParens) {
	      return true
	    }
	    state.pos = start;
	  }
	  return false
	};
	pp$9.regexp_eatKGroupName = function(state) {
	  if (state.eat(0x6B /* k */)) {
	    if (this.regexp_eatGroupName(state)) {
	      state.backReferenceNames.push(state.lastStringValue);
	      return true
	    }
	    state.raise("Invalid named reference");
	  }
	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-CharacterEscape
	pp$9.regexp_eatCharacterEscape = function(state) {
	  return (
	    this.regexp_eatControlEscape(state) ||
	    this.regexp_eatCControlLetter(state) ||
	    this.regexp_eatZero(state) ||
	    this.regexp_eatHexEscapeSequence(state) ||
	    this.regexp_eatRegExpUnicodeEscapeSequence(state) ||
	    (!state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state)) ||
	    this.regexp_eatIdentityEscape(state)
	  )
	};
	pp$9.regexp_eatCControlLetter = function(state) {
	  var start = state.pos;
	  if (state.eat(0x63 /* c */)) {
	    if (this.regexp_eatControlLetter(state)) {
	      return true
	    }
	    state.pos = start;
	  }
	  return false
	};
	pp$9.regexp_eatZero = function(state) {
	  if (state.current() === 0x30 /* 0 */ && !isDecimalDigit(state.lookahead())) {
	    state.lastIntValue = 0;
	    state.advance();
	    return true
	  }
	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-ControlEscape
	pp$9.regexp_eatControlEscape = function(state) {
	  var ch = state.current();
	  if (ch === 0x74 /* t */) {
	    state.lastIntValue = 0x09; /* \t */
	    state.advance();
	    return true
	  }
	  if (ch === 0x6E /* n */) {
	    state.lastIntValue = 0x0A; /* \n */
	    state.advance();
	    return true
	  }
	  if (ch === 0x76 /* v */) {
	    state.lastIntValue = 0x0B; /* \v */
	    state.advance();
	    return true
	  }
	  if (ch === 0x66 /* f */) {
	    state.lastIntValue = 0x0C; /* \f */
	    state.advance();
	    return true
	  }
	  if (ch === 0x72 /* r */) {
	    state.lastIntValue = 0x0D; /* \r */
	    state.advance();
	    return true
	  }
	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-ControlLetter
	pp$9.regexp_eatControlLetter = function(state) {
	  var ch = state.current();
	  if (isControlLetter(ch)) {
	    state.lastIntValue = ch % 0x20;
	    state.advance();
	    return true
	  }
	  return false
	};
	function isControlLetter(ch) {
	  return (
	    (ch >= 0x41 /* A */ && ch <= 0x5A /* Z */) ||
	    (ch >= 0x61 /* a */ && ch <= 0x7A /* z */)
	  )
	}

	// https://www.ecma-international.org/ecma-262/8.0/#prod-RegExpUnicodeEscapeSequence
	pp$9.regexp_eatRegExpUnicodeEscapeSequence = function(state) {
	  var start = state.pos;

	  if (state.eat(0x75 /* u */)) {
	    if (this.regexp_eatFixedHexDigits(state, 4)) {
	      var lead = state.lastIntValue;
	      if (state.switchU && lead >= 0xD800 && lead <= 0xDBFF) {
	        var leadSurrogateEnd = state.pos;
	        if (state.eat(0x5C /* \ */) && state.eat(0x75 /* u */) && this.regexp_eatFixedHexDigits(state, 4)) {
	          var trail = state.lastIntValue;
	          if (trail >= 0xDC00 && trail <= 0xDFFF) {
	            state.lastIntValue = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
	            return true
	          }
	        }
	        state.pos = leadSurrogateEnd;
	        state.lastIntValue = lead;
	      }
	      return true
	    }
	    if (
	      state.switchU &&
	      state.eat(0x7B /* { */) &&
	      this.regexp_eatHexDigits(state) &&
	      state.eat(0x7D /* } */) &&
	      isValidUnicode(state.lastIntValue)
	    ) {
	      return true
	    }
	    if (state.switchU) {
	      state.raise("Invalid unicode escape");
	    }
	    state.pos = start;
	  }

	  return false
	};
	function isValidUnicode(ch) {
	  return ch >= 0 && ch <= 0x10FFFF
	}

	// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-IdentityEscape
	pp$9.regexp_eatIdentityEscape = function(state) {
	  if (state.switchU) {
	    if (this.regexp_eatSyntaxCharacter(state)) {
	      return true
	    }
	    if (state.eat(0x2F /* / */)) {
	      state.lastIntValue = 0x2F; /* / */
	      return true
	    }
	    return false
	  }

	  var ch = state.current();
	  if (ch !== 0x63 /* c */ && (!state.switchN || ch !== 0x6B /* k */)) {
	    state.lastIntValue = ch;
	    state.advance();
	    return true
	  }

	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape
	pp$9.regexp_eatDecimalEscape = function(state) {
	  state.lastIntValue = 0;
	  var ch = state.current();
	  if (ch >= 0x31 /* 1 */ && ch <= 0x39 /* 9 */) {
	    do {
	      state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
	      state.advance();
	    } while ((ch = state.current()) >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */)
	    return true
	  }
	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClassEscape
	pp$9.regexp_eatCharacterClassEscape = function(state) {
	  var ch = state.current();

	  if (isCharacterClassEscape(ch)) {
	    state.lastIntValue = -1;
	    state.advance();
	    return true
	  }

	  if (
	    state.switchU &&
	    this.options.ecmaVersion >= 9 &&
	    (ch === 0x50 /* P */ || ch === 0x70 /* p */)
	  ) {
	    state.lastIntValue = -1;
	    state.advance();
	    if (
	      state.eat(0x7B /* { */) &&
	      this.regexp_eatUnicodePropertyValueExpression(state) &&
	      state.eat(0x7D /* } */)
	    ) {
	      return true
	    }
	    state.raise("Invalid property name");
	  }

	  return false
	};
	function isCharacterClassEscape(ch) {
	  return (
	    ch === 0x64 /* d */ ||
	    ch === 0x44 /* D */ ||
	    ch === 0x73 /* s */ ||
	    ch === 0x53 /* S */ ||
	    ch === 0x77 /* w */ ||
	    ch === 0x57 /* W */
	  )
	}

	// UnicodePropertyValueExpression ::
	//   UnicodePropertyName `=` UnicodePropertyValue
	//   LoneUnicodePropertyNameOrValue
	pp$9.regexp_eatUnicodePropertyValueExpression = function(state) {
	  var start = state.pos;

	  // UnicodePropertyName `=` UnicodePropertyValue
	  if (this.regexp_eatUnicodePropertyName(state) && state.eat(0x3D /* = */)) {
	    var name = state.lastStringValue;
	    if (this.regexp_eatUnicodePropertyValue(state)) {
	      var value = state.lastStringValue;
	      this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
	      return true
	    }
	  }
	  state.pos = start;

	  // LoneUnicodePropertyNameOrValue
	  if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
	    var nameOrValue = state.lastStringValue;
	    this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
	    return true
	  }
	  return false
	};
	pp$9.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
	  if (!has(state.unicodeProperties.nonBinary, name))
	    { state.raise("Invalid property name"); }
	  if (!state.unicodeProperties.nonBinary[name].test(value))
	    { state.raise("Invalid property value"); }
	};
	pp$9.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
	  if (!state.unicodeProperties.binary.test(nameOrValue))
	    { state.raise("Invalid property name"); }
	};

	// UnicodePropertyName ::
	//   UnicodePropertyNameCharacters
	pp$9.regexp_eatUnicodePropertyName = function(state) {
	  var ch = 0;
	  state.lastStringValue = "";
	  while (isUnicodePropertyNameCharacter(ch = state.current())) {
	    state.lastStringValue += codePointToString$1(ch);
	    state.advance();
	  }
	  return state.lastStringValue !== ""
	};
	function isUnicodePropertyNameCharacter(ch) {
	  return isControlLetter(ch) || ch === 0x5F /* _ */
	}

	// UnicodePropertyValue ::
	//   UnicodePropertyValueCharacters
	pp$9.regexp_eatUnicodePropertyValue = function(state) {
	  var ch = 0;
	  state.lastStringValue = "";
	  while (isUnicodePropertyValueCharacter(ch = state.current())) {
	    state.lastStringValue += codePointToString$1(ch);
	    state.advance();
	  }
	  return state.lastStringValue !== ""
	};
	function isUnicodePropertyValueCharacter(ch) {
	  return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch)
	}

	// LoneUnicodePropertyNameOrValue ::
	//   UnicodePropertyValueCharacters
	pp$9.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
	  return this.regexp_eatUnicodePropertyValue(state)
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClass
	pp$9.regexp_eatCharacterClass = function(state) {
	  if (state.eat(0x5B /* [ */)) {
	    state.eat(0x5E /* ^ */);
	    this.regexp_classRanges(state);
	    if (state.eat(0x5D /* [ */)) {
	      return true
	    }
	    // Unreachable since it threw "unterminated regular expression" error before.
	    state.raise("Unterminated character class");
	  }
	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassRanges
	// https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRanges
	// https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRangesNoDash
	pp$9.regexp_classRanges = function(state) {
	  var this$1 = this;

	  while (this.regexp_eatClassAtom(state)) {
	    var left = state.lastIntValue;
	    if (state.eat(0x2D /* - */) && this$1.regexp_eatClassAtom(state)) {
	      var right = state.lastIntValue;
	      if (state.switchU && (left === -1 || right === -1)) {
	        state.raise("Invalid character class");
	      }
	      if (left !== -1 && right !== -1 && left > right) {
	        state.raise("Range out of order in character class");
	      }
	    }
	  }
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtom
	// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtomNoDash
	pp$9.regexp_eatClassAtom = function(state) {
	  var start = state.pos;

	  if (state.eat(0x5C /* \ */)) {
	    if (this.regexp_eatClassEscape(state)) {
	      return true
	    }
	    if (state.switchU) {
	      // Make the same message as V8.
	      var ch$1 = state.current();
	      if (ch$1 === 0x63 /* c */ || isOctalDigit(ch$1)) {
	        state.raise("Invalid class escape");
	      }
	      state.raise("Invalid escape");
	    }
	    state.pos = start;
	  }

	  var ch = state.current();
	  if (ch !== 0x5D /* [ */) {
	    state.lastIntValue = ch;
	    state.advance();
	    return true
	  }

	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassEscape
	pp$9.regexp_eatClassEscape = function(state) {
	  var start = state.pos;

	  if (state.eat(0x62 /* b */)) {
	    state.lastIntValue = 0x08; /* <BS> */
	    return true
	  }

	  if (state.switchU && state.eat(0x2D /* - */)) {
	    state.lastIntValue = 0x2D; /* - */
	    return true
	  }

	  if (!state.switchU && state.eat(0x63 /* c */)) {
	    if (this.regexp_eatClassControlLetter(state)) {
	      return true
	    }
	    state.pos = start;
	  }

	  return (
	    this.regexp_eatCharacterClassEscape(state) ||
	    this.regexp_eatCharacterEscape(state)
	  )
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassControlLetter
	pp$9.regexp_eatClassControlLetter = function(state) {
	  var ch = state.current();
	  if (isDecimalDigit(ch) || ch === 0x5F /* _ */) {
	    state.lastIntValue = ch % 0x20;
	    state.advance();
	    return true
	  }
	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
	pp$9.regexp_eatHexEscapeSequence = function(state) {
	  var start = state.pos;
	  if (state.eat(0x78 /* x */)) {
	    if (this.regexp_eatFixedHexDigits(state, 2)) {
	      return true
	    }
	    if (state.switchU) {
	      state.raise("Invalid escape");
	    }
	    state.pos = start;
	  }
	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalDigits
	pp$9.regexp_eatDecimalDigits = function(state) {
	  var start = state.pos;
	  var ch = 0;
	  state.lastIntValue = 0;
	  while (isDecimalDigit(ch = state.current())) {
	    state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
	    state.advance();
	  }
	  return state.pos !== start
	};
	function isDecimalDigit(ch) {
	  return ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */
	}

	// https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigits
	pp$9.regexp_eatHexDigits = function(state) {
	  var start = state.pos;
	  var ch = 0;
	  state.lastIntValue = 0;
	  while (isHexDigit(ch = state.current())) {
	    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
	    state.advance();
	  }
	  return state.pos !== start
	};
	function isHexDigit(ch) {
	  return (
	    (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) ||
	    (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) ||
	    (ch >= 0x61 /* a */ && ch <= 0x66 /* f */)
	  )
	}
	function hexToInt(ch) {
	  if (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) {
	    return 10 + (ch - 0x41 /* A */)
	  }
	  if (ch >= 0x61 /* a */ && ch <= 0x66 /* f */) {
	    return 10 + (ch - 0x61 /* a */)
	  }
	  return ch - 0x30 /* 0 */
	}

	// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-LegacyOctalEscapeSequence
	// Allows only 0-377(octal) i.e. 0-255(decimal).
	pp$9.regexp_eatLegacyOctalEscapeSequence = function(state) {
	  if (this.regexp_eatOctalDigit(state)) {
	    var n1 = state.lastIntValue;
	    if (this.regexp_eatOctalDigit(state)) {
	      var n2 = state.lastIntValue;
	      if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
	        state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
	      } else {
	        state.lastIntValue = n1 * 8 + n2;
	      }
	    } else {
	      state.lastIntValue = n1;
	    }
	    return true
	  }
	  return false
	};

	// https://www.ecma-international.org/ecma-262/8.0/#prod-OctalDigit
	pp$9.regexp_eatOctalDigit = function(state) {
	  var ch = state.current();
	  if (isOctalDigit(ch)) {
	    state.lastIntValue = ch - 0x30; /* 0 */
	    state.advance();
	    return true
	  }
	  state.lastIntValue = 0;
	  return false
	};
	function isOctalDigit(ch) {
	  return ch >= 0x30 /* 0 */ && ch <= 0x37 /* 7 */
	}

	// https://www.ecma-international.org/ecma-262/8.0/#prod-Hex4Digits
	// https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigit
	// And HexDigit HexDigit in https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
	pp$9.regexp_eatFixedHexDigits = function(state, length) {
	  var start = state.pos;
	  state.lastIntValue = 0;
	  for (var i = 0; i < length; ++i) {
	    var ch = state.current();
	    if (!isHexDigit(ch)) {
	      state.pos = start;
	      return false
	    }
	    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
	    state.advance();
	  }
	  return true
	};

	// Object type used to represent tokens. Note that normally, tokens
	// simply exist as properties on the parser object. This is only
	// used for the onToken callback and the external tokenizer.

	var Token = function Token(p) {
	  this.type = p.type;
	  this.value = p.value;
	  this.start = p.start;
	  this.end = p.end;
	  if (p.options.locations)
	    { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
	  if (p.options.ranges)
	    { this.range = [p.start, p.end]; }
	};

	// ## Tokenizer

	var pp$8 = Parser.prototype;

	// Move to the next token

	pp$8.next = function() {
	  if (this.options.onToken)
	    { this.options.onToken(new Token(this)); }

	  this.lastTokEnd = this.end;
	  this.lastTokStart = this.start;
	  this.lastTokEndLoc = this.endLoc;
	  this.lastTokStartLoc = this.startLoc;
	  this.nextToken();
	};

	pp$8.getToken = function() {
	  this.next();
	  return new Token(this)
	};

	// If we're in an ES6 environment, make parsers iterable
	if (typeof Symbol !== "undefined")
	  { pp$8[Symbol.iterator] = function() {
	    var this$1 = this;

	    return {
	      next: function () {
	        var token = this$1.getToken();
	        return {
	          done: token.type === types.eof,
	          value: token
	        }
	      }
	    }
	  }; }

	// Toggle strict mode. Re-reads the next number or string to please
	// pedantic tests (`"use strict"; 010;` should fail).

	pp$8.curContext = function() {
	  return this.context[this.context.length - 1]
	};

	// Read a single token, updating the parser object's token-related
	// properties.

	pp$8.nextToken = function() {
	  var curContext = this.curContext();
	  if (!curContext || !curContext.preserveSpace) { this.skipSpace(); }

	  this.start = this.pos;
	  if (this.options.locations) { this.startLoc = this.curPosition(); }
	  if (this.pos >= this.input.length) { return this.finishToken(types.eof) }

	  if (curContext.override) { return curContext.override(this) }
	  else { this.readToken(this.fullCharCodeAtPos()); }
	};

	pp$8.readToken = function(code) {
	  // Identifier or keyword. '\uXXXX' sequences are allowed in
	  // identifiers, so '\' also dispatches to that.
	  if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
	    { return this.readWord() }

	  return this.getTokenFromCode(code)
	};

	pp$8.fullCharCodeAtPos = function() {
	  var code = this.input.charCodeAt(this.pos);
	  if (code <= 0xd7ff || code >= 0xe000) { return code }
	  var next = this.input.charCodeAt(this.pos + 1);
	  return (code << 10) + next - 0x35fdc00
	};

	pp$8.skipBlockComment = function() {
	  var this$1 = this;

	  var startLoc = this.options.onComment && this.curPosition();
	  var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
	  if (end === -1) { this.raise(this.pos - 2, "Unterminated comment"); }
	  this.pos = end + 2;
	  if (this.options.locations) {
	    lineBreakG.lastIndex = start;
	    var match;
	    while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
	      ++this$1.curLine;
	      this$1.lineStart = match.index + match[0].length;
	    }
	  }
	  if (this.options.onComment)
	    { this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
	                           startLoc, this.curPosition()); }
	};

	pp$8.skipLineComment = function(startSkip) {
	  var this$1 = this;

	  var start = this.pos;
	  var startLoc = this.options.onComment && this.curPosition();
	  var ch = this.input.charCodeAt(this.pos += startSkip);
	  while (this.pos < this.input.length && !isNewLine(ch)) {
	    ch = this$1.input.charCodeAt(++this$1.pos);
	  }
	  if (this.options.onComment)
	    { this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
	                           startLoc, this.curPosition()); }
	};

	// Called at the start of the parse and after every token. Skips
	// whitespace and comments, and.

	pp$8.skipSpace = function() {
	  var this$1 = this;

	  loop: while (this.pos < this.input.length) {
	    var ch = this$1.input.charCodeAt(this$1.pos);
	    switch (ch) {
	    case 32: case 160: // ' '
	      ++this$1.pos;
	      break
	    case 13:
	      if (this$1.input.charCodeAt(this$1.pos + 1) === 10) {
	        ++this$1.pos;
	      }
	    case 10: case 8232: case 8233:
	      ++this$1.pos;
	      if (this$1.options.locations) {
	        ++this$1.curLine;
	        this$1.lineStart = this$1.pos;
	      }
	      break
	    case 47: // '/'
	      switch (this$1.input.charCodeAt(this$1.pos + 1)) {
	      case 42: // '*'
	        this$1.skipBlockComment();
	        break
	      case 47:
	        this$1.skipLineComment(2);
	        break
	      default:
	        break loop
	      }
	      break
	    default:
	      if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
	        ++this$1.pos;
	      } else {
	        break loop
	      }
	    }
	  }
	};

	// Called at the end of every token. Sets `end`, `val`, and
	// maintains `context` and `exprAllowed`, and skips the space after
	// the token, so that the next one's `start` will point at the
	// right position.

	pp$8.finishToken = function(type, val) {
	  this.end = this.pos;
	  if (this.options.locations) { this.endLoc = this.curPosition(); }
	  var prevType = this.type;
	  this.type = type;
	  this.value = val;

	  this.updateContext(prevType);
	};

	// ### Token reading

	// This is the function that is called to fetch the next token. It
	// is somewhat obscure, because it works in character codes rather
	// than characters, and because operator parsing has been inlined
	// into it.
	//
	// All in the name of speed.
	//
	pp$8.readToken_dot = function() {
	  var next = this.input.charCodeAt(this.pos + 1);
	  if (next >= 48 && next <= 57) { return this.readNumber(true) }
	  var next2 = this.input.charCodeAt(this.pos + 2);
	  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
	    this.pos += 3;
	    return this.finishToken(types.ellipsis)
	  } else {
	    ++this.pos;
	    return this.finishToken(types.dot)
	  }
	};

	pp$8.readToken_slash = function() { // '/'
	  var next = this.input.charCodeAt(this.pos + 1);
	  if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
	  if (next === 61) { return this.finishOp(types.assign, 2) }
	  return this.finishOp(types.slash, 1)
	};

	pp$8.readToken_mult_modulo_exp = function(code) { // '%*'
	  var next = this.input.charCodeAt(this.pos + 1);
	  var size = 1;
	  var tokentype = code === 42 ? types.star : types.modulo;

	  // exponentiation operator ** and **=
	  if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
	    ++size;
	    tokentype = types.starstar;
	    next = this.input.charCodeAt(this.pos + 2);
	  }

	  if (next === 61) { return this.finishOp(types.assign, size + 1) }
	  return this.finishOp(tokentype, size)
	};

	pp$8.readToken_pipe_amp = function(code) { // '|&'
	  var next = this.input.charCodeAt(this.pos + 1);
	  if (next === code) { return this.finishOp(code === 124 ? types.logicalOR : types.logicalAND, 2) }
	  if (next === 61) { return this.finishOp(types.assign, 2) }
	  return this.finishOp(code === 124 ? types.bitwiseOR : types.bitwiseAND, 1)
	};

	pp$8.readToken_caret = function() { // '^'
	  var next = this.input.charCodeAt(this.pos + 1);
	  if (next === 61) { return this.finishOp(types.assign, 2) }
	  return this.finishOp(types.bitwiseXOR, 1)
	};

	pp$8.readToken_plus_min = function(code) { // '+-'
	  var next = this.input.charCodeAt(this.pos + 1);
	  if (next === code) {
	    if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 &&
	        (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
	      // A `-->` line comment
	      this.skipLineComment(3);
	      this.skipSpace();
	      return this.nextToken()
	    }
	    return this.finishOp(types.incDec, 2)
	  }
	  if (next === 61) { return this.finishOp(types.assign, 2) }
	  return this.finishOp(types.plusMin, 1)
	};

	pp$8.readToken_lt_gt = function(code) { // '<>'
	  var next = this.input.charCodeAt(this.pos + 1);
	  var size = 1;
	  if (next === code) {
	    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
	    if (this.input.charCodeAt(this.pos + size) === 61) { return this.finishOp(types.assign, size + 1) }
	    return this.finishOp(types.bitShift, size)
	  }
	  if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 &&
	      this.input.charCodeAt(this.pos + 3) === 45) {
	    // `<!--`, an XML-style comment that should be interpreted as a line comment
	    this.skipLineComment(4);
	    this.skipSpace();
	    return this.nextToken()
	  }
	  if (next === 61) { size = 2; }
	  return this.finishOp(types.relational, size)
	};

	pp$8.readToken_eq_excl = function(code) { // '=!'
	  var next = this.input.charCodeAt(this.pos + 1);
	  if (next === 61) { return this.finishOp(types.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2) }
	  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
	    this.pos += 2;
	    return this.finishToken(types.arrow)
	  }
	  return this.finishOp(code === 61 ? types.eq : types.prefix, 1)
	};

	pp$8.getTokenFromCode = function(code) {
	  switch (code) {
	  // The interpretation of a dot depends on whether it is followed
	  // by a digit or another two dots.
	  case 46: // '.'
	    return this.readToken_dot()

	  // Punctuation tokens.
	  case 40: ++this.pos; return this.finishToken(types.parenL)
	  case 41: ++this.pos; return this.finishToken(types.parenR)
	  case 59: ++this.pos; return this.finishToken(types.semi)
	  case 44: ++this.pos; return this.finishToken(types.comma)
	  case 91: ++this.pos; return this.finishToken(types.bracketL)
	  case 93: ++this.pos; return this.finishToken(types.bracketR)
	  case 123: ++this.pos; return this.finishToken(types.braceL)
	  case 125: ++this.pos; return this.finishToken(types.braceR)
	  case 58: ++this.pos; return this.finishToken(types.colon)
	  case 63: ++this.pos; return this.finishToken(types.question)

	  case 96: // '`'
	    if (this.options.ecmaVersion < 6) { break }
	    ++this.pos;
	    return this.finishToken(types.backQuote)

	  case 48: // '0'
	    var next = this.input.charCodeAt(this.pos + 1);
	    if (next === 120 || next === 88) { return this.readRadixNumber(16) } // '0x', '0X' - hex number
	    if (this.options.ecmaVersion >= 6) {
	      if (next === 111 || next === 79) { return this.readRadixNumber(8) } // '0o', '0O' - octal number
	      if (next === 98 || next === 66) { return this.readRadixNumber(2) } // '0b', '0B' - binary number
	    }

	  // Anything else beginning with a digit is an integer, octal
	  // number, or float.
	  case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
	    return this.readNumber(false)

	  // Quotes produce strings.
	  case 34: case 39: // '"', "'"
	    return this.readString(code)

	  // Operators are parsed inline in tiny state machines. '=' (61) is
	  // often referred to. `finishOp` simply skips the amount of
	  // characters it is given as second argument, and returns a token
	  // of the type given by its first argument.

	  case 47: // '/'
	    return this.readToken_slash()

	  case 37: case 42: // '%*'
	    return this.readToken_mult_modulo_exp(code)

	  case 124: case 38: // '|&'
	    return this.readToken_pipe_amp(code)

	  case 94: // '^'
	    return this.readToken_caret()

	  case 43: case 45: // '+-'
	    return this.readToken_plus_min(code)

	  case 60: case 62: // '<>'
	    return this.readToken_lt_gt(code)

	  case 61: case 33: // '=!'
	    return this.readToken_eq_excl(code)

	  case 126: // '~'
	    return this.finishOp(types.prefix, 1)
	  }

	  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
	};

	pp$8.finishOp = function(type, size) {
	  var str = this.input.slice(this.pos, this.pos + size);
	  this.pos += size;
	  return this.finishToken(type, str)
	};

	pp$8.readRegexp = function() {
	  var this$1 = this;

	  var escaped, inClass, start = this.pos;
	  for (;;) {
	    if (this$1.pos >= this$1.input.length) { this$1.raise(start, "Unterminated regular expression"); }
	    var ch = this$1.input.charAt(this$1.pos);
	    if (lineBreak.test(ch)) { this$1.raise(start, "Unterminated regular expression"); }
	    if (!escaped) {
	      if (ch === "[") { inClass = true; }
	      else if (ch === "]" && inClass) { inClass = false; }
	      else if (ch === "/" && !inClass) { break }
	      escaped = ch === "\\";
	    } else { escaped = false; }
	    ++this$1.pos;
	  }
	  var pattern = this.input.slice(start, this.pos);
	  ++this.pos;
	  var flagsStart = this.pos;
	  var flags = this.readWord1();
	  if (this.containsEsc) { this.unexpected(flagsStart); }

	  // Validate pattern
	  var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
	  state.reset(start, pattern, flags);
	  this.validateRegExpFlags(state);
	  this.validateRegExpPattern(state);

	  // Create Literal#value property value.
	  var value = null;
	  try {
	    value = new RegExp(pattern, flags);
	  } catch (e) {
	    // ESTree requires null if it failed to instantiate RegExp object.
	    // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
	  }

	  return this.finishToken(types.regexp, {pattern: pattern, flags: flags, value: value})
	};

	// Read an integer in the given radix. Return null if zero digits
	// were read, the integer value otherwise. When `len` is given, this
	// will return `null` unless the integer has exactly `len` digits.

	pp$8.readInt = function(radix, len) {
	  var this$1 = this;

	  var start = this.pos, total = 0;
	  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
	    var code = this$1.input.charCodeAt(this$1.pos), val = (void 0);
	    if (code >= 97) { val = code - 97 + 10; } // a
	    else if (code >= 65) { val = code - 65 + 10; } // A
	    else if (code >= 48 && code <= 57) { val = code - 48; } // 0-9
	    else { val = Infinity; }
	    if (val >= radix) { break }
	    ++this$1.pos;
	    total = total * radix + val;
	  }
	  if (this.pos === start || len != null && this.pos - start !== len) { return null }

	  return total
	};

	pp$8.readRadixNumber = function(radix) {
	  this.pos += 2; // 0x
	  var val = this.readInt(radix);
	  if (val == null) { this.raise(this.start + 2, "Expected number in radix " + radix); }
	  if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
	  return this.finishToken(types.num, val)
	};

	// Read an integer, octal integer, or floating-point number.

	pp$8.readNumber = function(startsWithDot) {
	  var start = this.pos;
	  if (!startsWithDot && this.readInt(10) === null) { this.raise(start, "Invalid number"); }
	  var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
	  if (octal && this.strict) { this.raise(start, "Invalid number"); }
	  if (octal && /[89]/.test(this.input.slice(start, this.pos))) { octal = false; }
	  var next = this.input.charCodeAt(this.pos);
	  if (next === 46 && !octal) { // '.'
	    ++this.pos;
	    this.readInt(10);
	    next = this.input.charCodeAt(this.pos);
	  }
	  if ((next === 69 || next === 101) && !octal) { // 'eE'
	    next = this.input.charCodeAt(++this.pos);
	    if (next === 43 || next === 45) { ++this.pos; } // '+-'
	    if (this.readInt(10) === null) { this.raise(start, "Invalid number"); }
	  }
	  if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }

	  var str = this.input.slice(start, this.pos);
	  var val = octal ? parseInt(str, 8) : parseFloat(str);
	  return this.finishToken(types.num, val)
	};

	// Read a string value, interpreting backslash-escapes.

	pp$8.readCodePoint = function() {
	  var ch = this.input.charCodeAt(this.pos), code;

	  if (ch === 123) { // '{'
	    if (this.options.ecmaVersion < 6) { this.unexpected(); }
	    var codePos = ++this.pos;
	    code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
	    ++this.pos;
	    if (code > 0x10FFFF) { this.invalidStringToken(codePos, "Code point out of bounds"); }
	  } else {
	    code = this.readHexChar(4);
	  }
	  return code
	};

	function codePointToString(code) {
	  // UTF-16 Decoding
	  if (code <= 0xFFFF) { return String.fromCharCode(code) }
	  code -= 0x10000;
	  return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
	}

	pp$8.readString = function(quote) {
	  var this$1 = this;

	  var out = "", chunkStart = ++this.pos;
	  for (;;) {
	    if (this$1.pos >= this$1.input.length) { this$1.raise(this$1.start, "Unterminated string constant"); }
	    var ch = this$1.input.charCodeAt(this$1.pos);
	    if (ch === quote) { break }
	    if (ch === 92) { // '\'
	      out += this$1.input.slice(chunkStart, this$1.pos);
	      out += this$1.readEscapedChar(false);
	      chunkStart = this$1.pos;
	    } else {
	      if (isNewLine(ch, this$1.options.ecmaVersion >= 10)) { this$1.raise(this$1.start, "Unterminated string constant"); }
	      ++this$1.pos;
	    }
	  }
	  out += this.input.slice(chunkStart, this.pos++);
	  return this.finishToken(types.string, out)
	};

	// Reads template string tokens.

	var INVALID_TEMPLATE_ESCAPE_ERROR = {};

	pp$8.tryReadTemplateToken = function() {
	  this.inTemplateElement = true;
	  try {
	    this.readTmplToken();
	  } catch (err) {
	    if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
	      this.readInvalidTemplateToken();
	    } else {
	      throw err
	    }
	  }

	  this.inTemplateElement = false;
	};

	pp$8.invalidStringToken = function(position, message) {
	  if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
	    throw INVALID_TEMPLATE_ESCAPE_ERROR
	  } else {
	    this.raise(position, message);
	  }
	};

	pp$8.readTmplToken = function() {
	  var this$1 = this;

	  var out = "", chunkStart = this.pos;
	  for (;;) {
	    if (this$1.pos >= this$1.input.length) { this$1.raise(this$1.start, "Unterminated template"); }
	    var ch = this$1.input.charCodeAt(this$1.pos);
	    if (ch === 96 || ch === 36 && this$1.input.charCodeAt(this$1.pos + 1) === 123) { // '`', '${'
	      if (this$1.pos === this$1.start && (this$1.type === types.template || this$1.type === types.invalidTemplate)) {
	        if (ch === 36) {
	          this$1.pos += 2;
	          return this$1.finishToken(types.dollarBraceL)
	        } else {
	          ++this$1.pos;
	          return this$1.finishToken(types.backQuote)
	        }
	      }
	      out += this$1.input.slice(chunkStart, this$1.pos);
	      return this$1.finishToken(types.template, out)
	    }
	    if (ch === 92) { // '\'
	      out += this$1.input.slice(chunkStart, this$1.pos);
	      out += this$1.readEscapedChar(true);
	      chunkStart = this$1.pos;
	    } else if (isNewLine(ch)) {
	      out += this$1.input.slice(chunkStart, this$1.pos);
	      ++this$1.pos;
	      switch (ch) {
	      case 13:
	        if (this$1.input.charCodeAt(this$1.pos) === 10) { ++this$1.pos; }
	      case 10:
	        out += "\n";
	        break
	      default:
	        out += String.fromCharCode(ch);
	        break
	      }
	      if (this$1.options.locations) {
	        ++this$1.curLine;
	        this$1.lineStart = this$1.pos;
	      }
	      chunkStart = this$1.pos;
	    } else {
	      ++this$1.pos;
	    }
	  }
	};

	// Reads a template token to search for the end, without validating any escape sequences
	pp$8.readInvalidTemplateToken = function() {
	  var this$1 = this;

	  for (; this.pos < this.input.length; this.pos++) {
	    switch (this$1.input[this$1.pos]) {
	    case "\\":
	      ++this$1.pos;
	      break

	    case "$":
	      if (this$1.input[this$1.pos + 1] !== "{") {
	        break
	      }
	    // falls through

	    case "`":
	      return this$1.finishToken(types.invalidTemplate, this$1.input.slice(this$1.start, this$1.pos))

	    // no default
	    }
	  }
	  this.raise(this.start, "Unterminated template");
	};

	// Used to read escaped characters

	pp$8.readEscapedChar = function(inTemplate) {
	  var ch = this.input.charCodeAt(++this.pos);
	  ++this.pos;
	  switch (ch) {
	  case 110: return "\n" // 'n' -> '\n'
	  case 114: return "\r" // 'r' -> '\r'
	  case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
	  case 117: return codePointToString(this.readCodePoint()) // 'u'
	  case 116: return "\t" // 't' -> '\t'
	  case 98: return "\b" // 'b' -> '\b'
	  case 118: return "\u000b" // 'v' -> '\u000b'
	  case 102: return "\f" // 'f' -> '\f'
	  case 13: if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; } // '\r\n'
	  case 10: // ' \n'
	    if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
	    return ""
	  default:
	    if (ch >= 48 && ch <= 55) {
	      var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
	      var octal = parseInt(octalStr, 8);
	      if (octal > 255) {
	        octalStr = octalStr.slice(0, -1);
	        octal = parseInt(octalStr, 8);
	      }
	      this.pos += octalStr.length - 1;
	      ch = this.input.charCodeAt(this.pos);
	      if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
	        this.invalidStringToken(
	          this.pos - 1 - octalStr.length,
	          inTemplate
	            ? "Octal literal in template string"
	            : "Octal literal in strict mode"
	        );
	      }
	      return String.fromCharCode(octal)
	    }
	    if (isNewLine(ch)) {
	      // Unicode new line characters after \ get removed from output in both
	      // template literals and strings
	      return ""
	    }
	    return String.fromCharCode(ch)
	  }
	};

	// Used to read character escape sequences ('\x', '\u', '\U').

	pp$8.readHexChar = function(len) {
	  var codePos = this.pos;
	  var n = this.readInt(16, len);
	  if (n === null) { this.invalidStringToken(codePos, "Bad character escape sequence"); }
	  return n
	};

	// Read an identifier, and return it as a string. Sets `this.containsEsc`
	// to whether the word contained a '\u' escape.
	//
	// Incrementally adds only escaped chars, adding other chunks as-is
	// as a micro-optimization.

	pp$8.readWord1 = function() {
	  var this$1 = this;

	  this.containsEsc = false;
	  var word = "", first = true, chunkStart = this.pos;
	  var astral = this.options.ecmaVersion >= 6;
	  while (this.pos < this.input.length) {
	    var ch = this$1.fullCharCodeAtPos();
	    if (isIdentifierChar(ch, astral)) {
	      this$1.pos += ch <= 0xffff ? 1 : 2;
	    } else if (ch === 92) { // "\"
	      this$1.containsEsc = true;
	      word += this$1.input.slice(chunkStart, this$1.pos);
	      var escStart = this$1.pos;
	      if (this$1.input.charCodeAt(++this$1.pos) !== 117) // "u"
	        { this$1.invalidStringToken(this$1.pos, "Expecting Unicode escape sequence \\uXXXX"); }
	      ++this$1.pos;
	      var esc = this$1.readCodePoint();
	      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
	        { this$1.invalidStringToken(escStart, "Invalid Unicode escape"); }
	      word += codePointToString(esc);
	      chunkStart = this$1.pos;
	    } else {
	      break
	    }
	    first = false;
	  }
	  return word + this.input.slice(chunkStart, this.pos)
	};

	// Read an identifier or keyword token. Will check for reserved
	// words when necessary.

	pp$8.readWord = function() {
	  var word = this.readWord1();
	  var type = types.name;
	  if (this.keywords.test(word)) {
	    if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword " + word); }
	    type = keywords$1[word];
	  }
	  return this.finishToken(type, word)
	};

	// The main exported interface (under `self.acorn` when in the
	// browser) is a `parse` function that takes a code string and
	// returns an abstract syntax tree as specified by [Mozilla parser
	// API][api].
	//
	// [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

	function parse(input, options) {
	  return Parser.parse(input, options)
	}
	//# sourceMappingURL=acorn.mjs.map

	function walk(ast, { enter, leave }) {
		visit(ast, null, enter, leave);
	}

	let shouldSkip = false;
	const context = { skip: () => shouldSkip = true };

	const childKeys = {};

	const toString$1 = Object.prototype.toString;

	function isArray$1(thing) {
		return toString$1.call(thing) === '[object Array]';
	}

	function visit(node, parent, enter, leave, prop, index) {
		if (!node) return;

		if (enter) {
			const _shouldSkip = shouldSkip;
			shouldSkip = false;
			enter.call(context, node, parent, prop, index);
			const skipped = shouldSkip;
			shouldSkip = _shouldSkip;

			if (skipped) return;
		}

		const keys = childKeys[node.type] || (
			childKeys[node.type] = Object.keys(node).filter(key => typeof node[key] === 'object')
		);

		for (let i = 0; i < keys.length; i += 1) {
			const key = keys[i];
			const value = node[key];

			if (isArray$1(value)) {
				for (let j = 0; j < value.length; j += 1) {
					visit(value[j], node, enter, leave, key, j);
				}
			}

			else if (value && value.type) {
				visit(value, node, enter, leave, key, null);
			}
		}

		if (leave) {
			leave(node, parent, prop, index);
		}
	}

	const require = `function require(id) {
	if (id in __repl_lookup) return __repl_lookup[id];
	throw new Error(\`Cannot require modules dynamically (\${id})\`);
}`;

	var commonjs = {
		name: 'commonjs',

		transform: (code, id) => {
			if (!/\b(require|module|exports)\b/.test(code)) return;

			try {
				const ast = parse(code, {
					ecmaVersion: 9
				});

				const requires = [];

				walk(ast, {
					enter: node => {
						if (node.type === 'CallExpression' && node.callee.name === 'require') {
							if (node.arguments.length !== 1) return;
							const arg = node.arguments[0];
							if (arg.type !== 'Literal' || typeof arg.value !== 'string') return;

							requires.push(arg.value);
						}
					}
				});

				const imports = requires.map((id, i) => `import __repl_${i} from '${id}';`).join('\n');
				const lookup = `const __repl_lookup = { ${requires.map((id, i) => `'${id}': __repl_${i}`).join(', ')} };`;

				const transformed = [
					imports,
					lookup,
					require,
					`const exports = {}; const module = { exports };`,
					code,
					`export default module.exports;`
				].join('\n\n');

				return {
					code: transformed,
					map: null
				};
			} catch (err) {
				return null;
			}
		}
	};

	var glsl = {
		name: 'glsl',
		transform: (code, id) => {
			if (!id.endsWith('.glsl')) return;

			return {
				code: `export default ${JSON.stringify(code)};`,
				map: null
			};
		}
	};

	var json = {
		name: 'json',
		transform: (code, id) => {
			if (!id.endsWith('.json')) return;

			return {
				code: `export default ${code};`,
				map: null
			};
		}
	};

	self.window = self; // egregious hack to get magic-string to work in a worker

	let svelteUrl;

	self.addEventListener('message', async event => {
		switch (event.data.type) {
			case 'init':
				svelteUrl = event.data.svelteUrl;
				importScripts(`${svelteUrl}/compiler.js`);

				break;

			case 'bundle':
				if (event.data.components.length === 0) return;

				const result = await bundle(event.data);
				if (result) {
					postMessage(result);
				}

				break;
		}
	});

	const common_options = {
		dev: true,
	};

	let cached = {
		dom: {},
		ssr: {}
	};

	const fetch_cache = new Map();
	function fetch_if_uncached(url) {
		if (fetch_cache.has(url)) {
			return fetch_cache.get(url);
		}

		const promise = fetch(url)
			.then(async r => {
				if (r.ok) {
					return {
						url: r.url,
						body: await r.text()
					};
				}

				throw new Error(await r.text());
			})
			.catch(err => {
				fetch_cache.delete(url);
				throw err;
			});

		fetch_cache.set(url, promise);
		return promise;
	}

	async function follow_redirects(url) {
		const res = await fetch_if_uncached(url);
		return res.url;
	}

	async function get_bundle(mode, cache, lookup) {
		let bundle;
		const all_warnings = [];

		const new_cache = {};

		const repl_plugin = {
			async resolveId(importee, importer) {
				// importing from Svelte
				if (importee === `svelte`) return `${svelteUrl}/index.mjs`;
				if (importee.startsWith(`svelte/`)) return `${svelteUrl}/${importee.slice(7)}.mjs`;

				// temporary workaround for lack of package.json files in sub-packages
				// https://github.com/sveltejs/svelte/pull/2887
				if (importer && importer.startsWith(svelteUrl)) {
					const resolved = new URL(importee, importer).href;
					return resolved.endsWith('.mjs') ? resolved : `${resolved}.mjs`;
				}

				if (/[^.]svelte/.test(importee)) console.log({ importee, importer });

				// importing from another file in REPL
				if (importee in lookup) return importee;

				// importing from a URL
				if (importee.startsWith('http:') || importee.startsWith('https:')) return importee;

				// importing from (probably) unpkg
				if (importee.startsWith('.')) {
					return await follow_redirects(new URL(importee, importer).href);
				}

				else {
					// fetch from unpkg
					try {
						const pkg_url = await follow_redirects(`https://unpkg.com/${importee}/package.json`);
						const pkg_json = (await fetch_if_uncached(pkg_url)).body;
						const pkg = JSON.parse(pkg_json);

						if (pkg.svelte || pkg.module || pkg.main) {
							const url = pkg_url.replace(/\/package\.json$/, '');
							return new URL(pkg.svelte || pkg.module || pkg.main, `${url}/`).href;
						}
					} catch (err) {
						// ignore
					}

					return await follow_redirects(`https://unpkg.com/${importee}`);
				}
			},
			async load(id) {
				if (id in lookup) return lookup[id].source;

				if (!fetch_cache.has(id)) {
					self.postMessage({
						type: 'fetch',
						url: id
					});
				}

				const res = await fetch_if_uncached(id);
				return res.body;
			},
			transform(code, id) {
				if (!/\.svelte$/.test(id)) return null;

				const name = id.split('/').pop().split('.')[0];

				const result = cache[id] && cache[id].code === code
					? cache[id].result
					: svelte.compile(code, Object.assign({
						generate: mode,
						format: 'esm',
						name,
						filename: name + '.svelte'
					}, common_options));

				new_cache[id] = { code, result };

				(result.warnings || result.stats.warnings).forEach(warning => { // TODO remove stats post-launch
					all_warnings.push({
						message: warning.message,
						filename: warning.filename,
						start: warning.start,
						end: warning.end
					});
				});

				return result.js;
			}
		};

		try {
			bundle = await Qc({
				input: './App.svelte',
				plugins: [
					repl_plugin,
					commonjs,
					json,
					glsl
				],
				inlineDynamicImports: true,
				onwarn(warning) {
					all_warnings.push({
						message: warning.message
					});
				}
			});
		} catch (error) {
			return { error, bundle: null, cache: new_cache, warnings: all_warnings };
		}

		return { bundle, cache: new_cache, error: null, warnings: all_warnings };
	}

	async function bundle({ id, components }) {
		console.clear();
		console.log(`running Svelte compiler version %c${svelte.VERSION}`, 'font-weight: bold');

		const lookup = {};
		components.forEach(component => {
			const path = `./${component.name}.${component.type}`;
			lookup[path] = component;
		});

		const import_map = new Map();
		let dom;

		try {
			dom = await get_bundle('dom', cached.dom, lookup);
			if (dom.error) {
				throw dom.error;
			}

			cached.dom = dom.cache;

			let uid = 1;

			const dom_result = (await dom.bundle.generate({
				format: 'iife',
				name: 'SvelteComponent',
				globals: id => {
					const name = `import_${uid++}`;
					import_map.set(id, name);
					return name;
				},
				exports: 'named',
				sourcemap: true
			})).output[0];

			const ssr_result = null;

			return {
				id,
				imports: dom_result.imports,
				import_map,
				dom: dom_result,
				ssr: ssr_result,
				warnings: dom.warnings,
				error: null
			};
		} catch (err) {
			const e = err;
			delete e.toString;

			return {
				id,
				imports: [],
				import_map,
				dom: null,
				ssr: null,
				warnings: dom.warnings,
				error: Object.assign({}, e, {
					message: e.message,
					stack: e.stack
				})
			};
		}
	}

}());
