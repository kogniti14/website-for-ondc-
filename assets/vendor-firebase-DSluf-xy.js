import{o as No}from"./vendor-core-BcOvhSuZ.js";const Tl=()=>{};var lr={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oo={NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const f=function(n,e){if(!n)throw vt(e)},vt=function(n){return new Error("Firebase Database ("+Oo.SDK_VERSION+") INTERNAL ASSERT FAILED: "+n)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Do=function(n){const e=[];let t=0;for(let i=0;i<n.length;i++){let s=n.charCodeAt(i);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&i+1<n.length&&(n.charCodeAt(i+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++i)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Cl=function(n){const e=[];let t=0,i=0;for(;t<n.length;){const s=n[t++];if(s<128)e[i++]=String.fromCharCode(s);else if(s>191&&s<224){const r=n[t++];e[i++]=String.fromCharCode((s&31)<<6|r&63)}else if(s>239&&s<365){const r=n[t++],o=n[t++],a=n[t++],c=((s&7)<<18|(r&63)<<12|(o&63)<<6|a&63)-65536;e[i++]=String.fromCharCode(55296+(c>>10)),e[i++]=String.fromCharCode(56320+(c&1023))}else{const r=n[t++],o=n[t++];e[i++]=String.fromCharCode((s&15)<<12|(r&63)<<6|o&63)}}return e.join("")},ns={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,i=[];for(let s=0;s<n.length;s+=3){const r=n[s],o=s+1<n.length,a=o?n[s+1]:0,c=s+2<n.length,l=c?n[s+2]:0,u=r>>2,h=(r&3)<<4|a>>4;let d=(a&15)<<2|l>>6,p=l&63;c||(p=64,o||(d=64)),i.push(t[u],t[h],t[d],t[p])}return i.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Do(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Cl(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,i=[];for(let s=0;s<n.length;){const r=t[n.charAt(s++)],a=s<n.length?t[n.charAt(s)]:0;++s;const l=s<n.length?t[n.charAt(s)]:64;++s;const h=s<n.length?t[n.charAt(s)]:64;if(++s,r==null||a==null||l==null||h==null)throw new bl;const d=r<<2|a>>4;if(i.push(d),l!==64){const p=a<<4&240|l>>2;if(i.push(p),h!==64){const _=l<<6&192|h;i.push(_)}}}return i},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class bl extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Lo=function(n){const e=Do(n);return ns.encodeByteArray(e,!0)},Tn=function(n){return Lo(n).replace(/\./g,"")},Cn=function(n){try{return ns.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sl(n){return Mo(void 0,n)}function Mo(n,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:const t=e;return new Date(t.getTime());case Object:n===void 0&&(n={});break;case Array:n=[];break;default:return e}for(const t in e)!e.hasOwnProperty(t)||!Rl(t)||(n[t]=Mo(n[t],e[t]));return n}function Rl(n){return n!=="__proto__"}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kl(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Al=()=>kl().__FIREBASE_DEFAULTS__,Pl=()=>{if(typeof process>"u"||typeof lr>"u")return;const n=lr.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Nl=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Cn(n[1]);return e&&JSON.parse(e)},is=()=>{try{return Tl()||Al()||Pl()||Nl()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},xo=n=>is()?.emulatorHosts?.[n],Uo=n=>{const e=xo(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const i=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),i]:[e.substring(0,t),i]},Fo=()=>is()?.config,Wo=n=>is()?.[`_${n}`];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Et{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,i)=>{t?this.reject(t):this.resolve(i),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,i))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bo(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},i=e||"demo-project",s=n.iat||0,r=n.sub||n.user_id;if(!r)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${i}`,aud:i,iat:s,exp:s+3600,auth_time:s,sub:r,user_id:r,firebase:{sign_in_provider:"custom",identities:{}},...n};return[Tn(JSON.stringify(t)),Tn(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function j(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function ss(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(j())}function Ol(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function rs(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Ho(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Dl(){const n=j();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Ll(){return Oo.NODE_ADMIN===!0}function os(){try{return typeof indexedDB=="object"}catch{return!1}}function as(){return new Promise((n,e)=>{try{let t=!0;const i="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(i);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(i),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{e(s.error?.message||"")}}catch(t){e(t)}})}function $o(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ml="FirebaseError";class le extends Error{constructor(e,t,i){super(t),this.code=e,this.customData=i,this.name=Ml,Object.setPrototypeOf(this,le.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,nt.prototype.create)}}class nt{constructor(e,t,i){this.service=e,this.serviceName=t,this.errors=i}create(e,...t){const i=t[0]||{},s=`${this.service}/${e}`,r=this.errors[e],o=r?xl(r,i):"Error",a=`${this.serviceName}: ${o} (${s}).`;return new le(s,a,i)}}function xl(n,e){try{let t=0,i="";for(;t<n.length;){const s=n.indexOf("{$",t);if(s===-1){i+=n.substring(t);break}const r=n.indexOf("}",s+2);if(r===-1){i+=n.substring(t);break}const o=n.substring(s+2,r),a=e[o];i+=n.substring(t,s)+(a!=null?String(a):`<${o}?>`),t=r+1}return i}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $t(n){return JSON.parse(n)}function L(n){return JSON.stringify(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vo=function(n){let e={},t={},i={},s="";try{const r=n.split(".");e=$t(Cn(r[0])||""),t=$t(Cn(r[1])||""),s=r[2],i=t.d||{},delete t.d}catch{}return{header:e,claims:t,data:i,signature:s}},Ul=function(n){const e=Vo(n),t=e.claims;return!!t&&typeof t=="object"&&t.hasOwnProperty("iat")},Fl=function(n){const e=Vo(n).claims;return typeof e=="object"&&e.admin===!0};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function de(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function pt(n,e){if(Object.prototype.hasOwnProperty.call(n,e))return n[e]}function Li(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function bn(n,e,t){const i={};for(const s in n)Object.prototype.hasOwnProperty.call(n,s)&&(i[s]=e.call(t,n[s],s,n));return i}function xe(n,e){if(n===e)return!0;const t=Object.keys(n),i=Object.keys(e);for(const s of t){if(!i.includes(s))return!1;const r=n[s],o=e[s];if(ur(r)&&ur(o)){if(!xe(r,o))return!1}else if(r!==o)return!1}for(const s of i)if(!t.includes(s))return!1;return!0}function ur(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tt(n){const e=[];for(const[t,i]of Object.entries(n))Array.isArray(i)?i.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(i));return e.length?"&"+e.join("&"):""}function Dt(n){const e={};return n.replace(/^\?/,"").split("&").forEach(i=>{if(i){const[s,r]=i.split("=");e[decodeURIComponent(s)]=decodeURIComponent(r)}}),e}function Lt(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wl{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=512/8,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,t){t||(t=0);const i=this.W_;if(typeof e=="string")for(let h=0;h<16;h++)i[h]=e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|e.charCodeAt(t+3),t+=4;else for(let h=0;h<16;h++)i[h]=e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3],t+=4;for(let h=16;h<80;h++){const d=i[h-3]^i[h-8]^i[h-14]^i[h-16];i[h]=(d<<1|d>>>31)&4294967295}let s=this.chain_[0],r=this.chain_[1],o=this.chain_[2],a=this.chain_[3],c=this.chain_[4],l,u;for(let h=0;h<80;h++){h<40?h<20?(l=a^r&(o^a),u=1518500249):(l=r^o^a,u=1859775393):h<60?(l=r&o|a&(r|o),u=2400959708):(l=r^o^a,u=3395469782);const d=(s<<5|s>>>27)+l+c+u+i[h]&4294967295;c=a,a=o,o=(r<<30|r>>>2)&4294967295,r=s,s=d}this.chain_[0]=this.chain_[0]+s&4294967295,this.chain_[1]=this.chain_[1]+r&4294967295,this.chain_[2]=this.chain_[2]+o&4294967295,this.chain_[3]=this.chain_[3]+a&4294967295,this.chain_[4]=this.chain_[4]+c&4294967295}update(e,t){if(e==null)return;t===void 0&&(t=e.length);const i=t-this.blockSize;let s=0;const r=this.buf_;let o=this.inbuf_;for(;s<t;){if(o===0)for(;s<=i;)this.compress_(e,s),s+=this.blockSize;if(typeof e=="string"){for(;s<t;)if(r[o]=e.charCodeAt(s),++o,++s,o===this.blockSize){this.compress_(r),o=0;break}}else for(;s<t;)if(r[o]=e[s],++o,++s,o===this.blockSize){this.compress_(r),o=0;break}}this.inbuf_=o,this.total_+=t}digest(){const e=[];let t=this.total_*8;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let s=this.blockSize-1;s>=56;s--)this.buf_[s]=t&255,t/=256;this.compress_(this.buf_);let i=0;for(let s=0;s<5;s++)for(let r=24;r>=0;r-=8)e[i]=this.chain_[s]>>r&255,++i;return e}}function Bl(n,e){const t=new Hl(n,e);return t.subscribe.bind(t)}class Hl{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(i=>{this.error(i)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,i){let s;if(e===void 0&&t===void 0&&i===void 0)throw new Error("Missing Observer.");$l(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:i},s.next===void 0&&(s.next=yi),s.error===void 0&&(s.error=yi),s.complete===void 0&&(s.complete=yi);const r=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),r}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(i){typeof console<"u"&&console.error&&console.error(i)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function $l(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function yi(){}function Kn(n,e){return`${n} failed: ${e} argument `}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vl=function(n){const e=[];let t=0;for(let i=0;i<n.length;i++){let s=n.charCodeAt(i);if(s>=55296&&s<=56319){const r=s-55296;i++,f(i<n.length,"Surrogate pair missing trail surrogate.");const o=n.charCodeAt(i)-56320;s=65536+(r<<10)+o}s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):s<65536?(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Yn=function(n){let e=0;for(let t=0;t<n.length;t++){const i=n.charCodeAt(t);i<128?e++:i<2048?e+=2:i>=55296&&i<=56319?(e+=4,t++):e+=3}return e};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ql=1e3,jl=2,Gl=14400*1e3,zl=.5;function hr(n,e=ql,t=jl){const i=e*Math.pow(t,n),s=Math.round(zl*i*(Math.random()-.5)*2);return Math.min(Gl,i+s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function k(n){return n&&n._delegate?n._delegate:n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function it(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function cs(n){return(await fetch(n,{credentials:"include"})).ok}class ee{constructor(e,t,i){this.name=e,this.instanceFactory=t,this.type=i,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const He="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kl{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const i=new Et;if(this.instancesDeferred.set(t,i),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&i.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e?.identifier),i=e?.optional??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Ql(e))try{this.getOrInitializeService({instanceIdentifier:He})}catch{}for(const[t,i]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const r=this.getOrInitializeService({instanceIdentifier:s});i.resolve(r)}catch{}}}}clearInstance(e=He){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=He){return this.instances.has(e)}getOptions(e=He){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,i=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(i))throw Error(`${this.name}(${i}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:i,options:t});for(const[r,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(r);i===a&&o.resolve(s)}return s}onInit(e,t){const i=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(i)??new Set;s.add(e),this.onInitCallbacks.set(i,s);const r=this.instances.get(i);return r&&e(r,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const i=this.onInitCallbacks.get(t);if(i)for(const s of i)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let i=this.instances.get(e);if(!i&&this.component&&(i=this.component.instanceFactory(this.container,{instanceIdentifier:Yl(e),options:t}),this.instances.set(e,i),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(i,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,i)}catch{}return i||null}normalizeInstanceIdentifier(e=He){return this.component?this.component.multipleInstances?e:He:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Yl(n){return n===He?void 0:n}function Ql(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jl{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Kl(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var C;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(C||(C={}));const Xl={debug:C.DEBUG,verbose:C.VERBOSE,info:C.INFO,warn:C.WARN,error:C.ERROR,silent:C.SILENT},Zl=C.INFO,eu={[C.DEBUG]:"log",[C.VERBOSE]:"log",[C.INFO]:"info",[C.WARN]:"warn",[C.ERROR]:"error"},tu=(n,e,...t)=>{if(e<n.logLevel)return;const i=new Date().toISOString(),s=eu[e];if(s)console[s](`[${i}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Qn{constructor(e){this.name=e,this._logLevel=Zl,this._logHandler=tu,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in C))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Xl[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,C.DEBUG,...e),this._logHandler(this,C.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,C.VERBOSE,...e),this._logHandler(this,C.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,C.INFO,...e),this._logHandler(this,C.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,C.WARN,...e),this._logHandler(this,C.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,C.ERROR,...e),this._logHandler(this,C.ERROR,...e)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nu{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(iu(t)){const i=t.getImmediate();return`${i.library}/${i.version}`}else return null}).filter(t=>t).join(" ")}}function iu(n){return n.getComponent()?.type==="VERSION"}const Mi="@firebase/app",dr="0.16.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ie=new Qn("@firebase/app"),su="@firebase/app-compat",ru="@firebase/analytics-compat",ou="@firebase/analytics",au="@firebase/app-check-compat",cu="@firebase/app-check",lu="@firebase/auth",uu="@firebase/auth-compat",hu="@firebase/database",du="@firebase/data-connect",fu="@firebase/database-compat",pu="@firebase/functions",_u="@firebase/functions-compat",gu="@firebase/installations",mu="@firebase/installations-compat",yu="@firebase/messaging",wu="@firebase/messaging-compat",Iu="@firebase/performance",vu="@firebase/performance-compat",Eu="@firebase/remote-config",Tu="@firebase/remote-config-compat",Cu="@firebase/storage",bu="@firebase/storage-compat",Su="@firebase/firestore",Ru="@firebase/ai",ku="@firebase/firestore-compat",Au="firebase",Pu="12.19.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xi="[DEFAULT]",Nu={[Mi]:"fire-core",[su]:"fire-core-compat",[ou]:"fire-analytics",[ru]:"fire-analytics-compat",[cu]:"fire-app-check",[au]:"fire-app-check-compat",[lu]:"fire-auth",[uu]:"fire-auth-compat",[hu]:"fire-rtdb",[du]:"fire-data-connect",[fu]:"fire-rtdb-compat",[pu]:"fire-fn",[_u]:"fire-fn-compat",[gu]:"fire-iid",[mu]:"fire-iid-compat",[yu]:"fire-fcm",[wu]:"fire-fcm-compat",[Iu]:"fire-perf",[vu]:"fire-perf-compat",[Eu]:"fire-rc",[Tu]:"fire-rc-compat",[Cu]:"fire-gcs",[bu]:"fire-gcs-compat",[Su]:"fire-fst",[ku]:"fire-fst-compat",[Ru]:"fire-vertex","fire-js":"fire-js",[Au]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vt=new Map,Ou=new Map,Ui=new Map;function fr(n,e){try{n.container.addComponent(e)}catch(t){Ie.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function ce(n){const e=n.name;if(Ui.has(e))return Ie.debug(`There were multiple attempts to register component ${e}.`),!1;Ui.set(e,n);for(const t of Vt.values())fr(t,n);for(const t of Ou.values())fr(t,n);return!0}function Be(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function K(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Du={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},pe=new nt("app","Firebase",Du);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lu{constructor(e,t,i){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=i,this.container.addComponent(new ee("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw pe.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const st=Pu;function Mu(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const i={name:xi,automaticDataCollectionEnabled:!0,...e},s=i.name;if(typeof s!="string"||!s)throw pe.create("bad-app-name",{appName:String(s)});if(t||(t=Fo()),!t)throw pe.create("no-options");const r=Vt.get(s);if(r)if(xe(t,r.options)){if(xe(i,r.config))return r;throw pe.create("duplicate-app",{appName:s,mismatchedParam:"config",oldValue:JSON.stringify(r.config),newValue:JSON.stringify(i)})}else throw pe.create("duplicate-app",{appName:s,mismatchedParam:"options",oldValue:JSON.stringify(r.options),newValue:JSON.stringify(t)});const o=new Jl(s);for(const c of Ui.values())o.addComponent(c);const a=new Lu(t,i,o);return Vt.set(s,a),a}function Jn(n=xi){const e=Vt.get(n);if(!e&&n===xi&&Fo())return Mu();if(!e)throw pe.create("no-app",{appName:n});return e}function Qy(){return Array.from(Vt.values())}function Q(n,e,t){let i=Nu[n]??n;t&&(i+=`-${t}`);const s=i.match(/\s|\//),r=e.match(/\s|\//);if(s||r){const o=[`Unable to register library "${i}" with version "${e}":`];s&&o.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&r&&o.push("and"),r&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Ie.warn(o.join(" "));return}ce(new ee(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xu="firebase-heartbeat-database",Uu=1,qt="firebase-heartbeat-store";let wi=null;function qo(){return wi||(wi=No(xu,Uu,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(qt)}catch(t){console.warn(t)}}}}).catch(n=>{throw pe.create("idb-open",{originalErrorMessage:n.message})})),wi}async function Fu(n){try{const t=(await qo()).transaction(qt),i=await t.objectStore(qt).get(jo(n));return await t.done,i}catch(e){if(e instanceof le)Ie.warn(e.message);else{const t=pe.create("idb-get",{originalErrorMessage:e?.message});Ie.warn(t.message)}}}async function pr(n,e){try{const i=(await qo()).transaction(qt,"readwrite");await i.objectStore(qt).put(e,jo(n)),await i.done}catch(t){if(t instanceof le)Ie.warn(t.message);else{const i=pe.create("idb-set",{originalErrorMessage:t?.message});Ie.warn(i.message)}}}function jo(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wu=1024,Bu=30;class Hu{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Vu(t),this._heartbeatsCachePromise=this._storage.read().then(i=>(this._heartbeatsCache=i,i))}async triggerHeartbeat(){try{const t=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=_r();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(s=>s.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:t}),this._heartbeatsCache.heartbeats.length>Bu){const s=qu(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(s,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){Ie.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";const e=_r(),{heartbeatsToSend:t,unsentEntries:i}=$u(this._heartbeatsCache.heartbeats),s=Tn(JSON.stringify({version:2,heartbeats:t}));return this._heartbeatsCache.lastSentHeartbeatDate=e,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(e){return Ie.warn(e),""}}}function _r(){return new Date().toISOString().substring(0,10)}function $u(n,e=Wu){const t=[];let i=n.slice();for(const s of n){const r=t.find(o=>o.agent===s.agent);if(r){if(r.dates.push(s.date),gr(t)>e){r.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),gr(t)>e){t.pop();break}i=i.slice(1)}return{heartbeatsToSend:t,unsentEntries:i}}class Vu{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return os()?as().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Fu(this.app);return t?.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const i=await this.read();return pr(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const i=await this.read();return pr(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function gr(n){return Tn(JSON.stringify({version:2,heartbeats:n})).length}function qu(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let i=1;i<n.length;i++)n[i].date<t&&(t=n[i].date,e=i);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ju(n){ce(new ee("platform-logger",e=>new nu(e),"PRIVATE")),ce(new ee("heartbeat",e=>new Hu(e),"PRIVATE")),Q(Mi,dr,n),Q(Mi,dr,"esm2020"),Q("fire-js","")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ju("");var mr={};const yr="@firebase/database",wr="1.1.5";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Go="";function Gu(n){Go=n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zu{constructor(e){this.domStorage_=e,this.prefix_="firebase:"}set(e,t){t==null?this.domStorage_.removeItem(this.prefixedName_(e)):this.domStorage_.setItem(this.prefixedName_(e),L(t))}get(e){const t=this.domStorage_.getItem(this.prefixedName_(e));return t==null?null:$t(t)}remove(e){this.domStorage_.removeItem(this.prefixedName_(e))}prefixedName_(e){return this.prefix_+e}toString(){return this.domStorage_.toString()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ku{constructor(){this.cache_={},this.isInMemoryStorage=!0}set(e,t){t==null?delete this.cache_[e]:this.cache_[e]=t}get(e){return de(this.cache_,e)?this.cache_[e]:null}remove(e){delete this.cache_[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zo=function(n){try{if(typeof window<"u"&&typeof window[n]<"u"){const e=window[n];return e.setItem("firebase:sentinel","cache"),e.removeItem("firebase:sentinel"),new zu(e)}}catch{}return new Ku},Ve=zo("localStorage"),Yu=zo("sessionStorage");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lt=new Qn("@firebase/database"),Qu=(function(){let n=1;return function(){return n++}})(),Ko=function(n){const e=Vl(n),t=new Wl;t.update(e);const i=t.digest();return ns.encodeByteArray(i)},en=function(...n){let e="";for(let t=0;t<n.length;t++){const i=n[t];Array.isArray(i)||i&&typeof i=="object"&&typeof i.length=="number"?e+=en.apply(null,i):typeof i=="object"?e+=L(i):e+=i,e+=" "}return e};let Mt=null,Ir=!0;const Ju=function(n,e){f(!0,"Can't turn on custom loggers persistently."),lt.logLevel=C.VERBOSE,Mt=lt.log.bind(lt)},F=function(...n){if(Ir===!0&&(Ir=!1,Mt===null&&Yu.get("logging_enabled")===!0&&Ju()),Mt){const e=en.apply(null,n);Mt(e)}},tn=function(n){return function(...e){F(n,...e)}},Fi=function(...n){const e="FIREBASE INTERNAL ERROR: "+en(...n);lt.error(e)},ve=function(...n){const e=`FIREBASE FATAL ERROR: ${en(...n)}`;throw lt.error(e),new Error(e)},V=function(...n){const e="FIREBASE WARNING: "+en(...n);lt.warn(e)},Xu=function(){typeof window<"u"&&window.location&&window.location.protocol&&window.location.protocol.indexOf("https:")!==-1&&V("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().")},ls=function(n){return typeof n=="number"&&(n!==n||n===Number.POSITIVE_INFINITY||n===Number.NEGATIVE_INFINITY)},Zu=function(n){if(document.readyState==="complete")n();else{let e=!1;const t=function(){if(!document.body){setTimeout(t,Math.floor(10));return}e||(e=!0,n())};document.addEventListener?(document.addEventListener("DOMContentLoaded",t,!1),window.addEventListener("load",t,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",()=>{document.readyState==="complete"&&t()}),window.attachEvent("onload",t))}},_t="[MIN_NAME]",Ke="[MAX_NAME]",rt=function(n,e){if(n===e)return 0;if(n===_t||e===Ke)return-1;if(e===_t||n===Ke)return 1;{const t=vr(n),i=vr(e);return t!==null?i!==null?t-i===0?n.length-e.length:t-i:-1:i!==null?1:n<e?-1:1}},eh=function(n,e){return n===e?0:n<e?-1:1},kt=function(n,e){if(e&&n in e)return e[n];throw new Error("Missing required key ("+n+") in object: "+L(e))},us=function(n){if(typeof n!="object"||n===null)return L(n);const e=[];for(const i in n)e.push(i);e.sort();let t="{";for(let i=0;i<e.length;i++)i!==0&&(t+=","),t+=L(e[i]),t+=":",t+=us(n[e[i]]);return t+="}",t},Yo=function(n,e){const t=n.length;if(t<=e)return[n];const i=[];for(let s=0;s<t;s+=e)s+e>t?i.push(n.substring(s,t)):i.push(n.substring(s,s+e));return i};function W(n,e){for(const t in n)n.hasOwnProperty(t)&&e(t,n[t])}const Qo=function(n){f(!ls(n),"Invalid JSON number");const e=11,t=52,i=(1<<e-1)-1;let s,r,o,a,c;n===0?(r=0,o=0,s=1/n===-1/0?1:0):(s=n<0,n=Math.abs(n),n>=Math.pow(2,1-i)?(a=Math.min(Math.floor(Math.log(n)/Math.LN2),i),r=a+i,o=Math.round(n*Math.pow(2,t-a)-Math.pow(2,t))):(r=0,o=Math.round(n/Math.pow(2,1-i-t))));const l=[];for(c=t;c;c-=1)l.push(o%2?1:0),o=Math.floor(o/2);for(c=e;c;c-=1)l.push(r%2?1:0),r=Math.floor(r/2);l.push(s?1:0),l.reverse();const u=l.join("");let h="";for(c=0;c<64;c+=8){let d=parseInt(u.substr(c,8),2).toString(16);d.length===1&&(d="0"+d),h=h+d}return h.toLowerCase()},th=function(){return!!(typeof window=="object"&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))},nh=function(){return typeof Windows=="object"&&typeof Windows.UI=="object"};function ih(n,e){let t="Unknown Error";n==="too_big"?t="The data requested exceeds the maximum size that can be accessed with a single request.":n==="permission_denied"?t="Client doesn't have permission to access the desired data.":n==="unavailable"&&(t="The service is unavailable");const i=new Error(n+" at "+e._path.toString()+": "+t);return i.code=n.toUpperCase(),i}const sh=new RegExp("^-?(0*)\\d{1,10}$"),rh=-2147483648,oh=2147483647,vr=function(n){if(sh.test(n)){const e=Number(n);if(e>=rh&&e<=oh)return e}return null},Ct=function(n){try{n()}catch(e){setTimeout(()=>{const t=e.stack||"";throw V("Exception was thrown by user callback.",t),e},Math.floor(0))}},ah=function(){return(typeof window=="object"&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)>=0},xt=function(n,e){const t=setTimeout(n,e);return typeof t=="number"&&typeof Deno<"u"&&Deno.unrefTimer?Deno.unrefTimer(t):typeof t=="object"&&t.unref&&t.unref(),t};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ch{constructor(e,t){this.appCheckProvider=t,this.appName=e.name,K(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.appCheck=t?.getImmediate({optional:!0}),this.appCheck||t?.get().then(i=>this.appCheck=i)}getToken(e){if(this.serverAppAppCheckToken){if(e)throw new Error("Attempted reuse of `FirebaseServerApp.appCheckToken` after previous usage failed.");return Promise.resolve({token:this.serverAppAppCheckToken})}return this.appCheck?this.appCheck.getToken(e):new Promise((t,i)=>{setTimeout(()=>{this.appCheck?this.getToken(e).then(t,i):t(null)},0)})}addTokenChangeListener(e){this.appCheckProvider?.get().then(t=>t.addTokenListener(e))}notifyForInvalidToken(){V(`Provided AppCheck credentials for the app named "${this.appName}" are invalid. This usually indicates your app was not initialized correctly.`)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lh{constructor(e,t,i){this.appName_=e,this.firebaseOptions_=t,this.authProvider_=i,this.auth_=null,this.auth_=i.getImmediate({optional:!0}),this.auth_||i.onInit(s=>this.auth_=s)}getToken(e){return this.auth_?this.auth_.getToken(e).catch(t=>t&&t.code==="auth/token-not-initialized"?(F("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(t)):new Promise((t,i)=>{setTimeout(()=>{this.auth_?this.getToken(e).then(t,i):t(null)},0)})}addTokenChangeListener(e){this.auth_?this.auth_.addAuthTokenListener(e):this.authProvider_.get().then(t=>t.addAuthTokenListener(e))}removeTokenChangeListener(e){this.authProvider_.get().then(t=>t.removeAuthTokenListener(e))}notifyForInvalidToken(){let e='Provided authentication credentials for the app named "'+this.appName_+'" are invalid. This usually indicates your app was not initialized correctly. ';"credential"in this.firebaseOptions_?e+='Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in this.firebaseOptions_?e+='Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':e+='Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',V(e)}}class mn{constructor(e){this.accessToken=e}getToken(e){return Promise.resolve({accessToken:this.accessToken})}addTokenChangeListener(e){e(this.accessToken)}removeTokenChangeListener(e){}notifyForInvalidToken(){}}mn.OWNER="owner";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hs="5",Jo="v",Xo="s",Zo="r",ea="f",ta=/(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/,na="ls",ia="p",Wi="ac",sa="websocket",ra="long_polling";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oa{constructor(e,t,i,s,r=!1,o="",a=!1,c=!1,l=null){this.secure=t,this.namespace=i,this.webSocketOnly=s,this.nodeAdmin=r,this.persistenceKey=o,this.includeNamespaceInQueryParams=a,this.isUsingEmulator=c,this.emulatorOptions=l,this._host=e.toLowerCase(),this._domain=this._host.substr(this._host.indexOf(".")+1),this.internalHost=Ve.get("host:"+e)||this._host}isCacheableHost(){return this.internalHost.substr(0,2)==="s-"}isCustomHost(){return this._domain!=="firebaseio.com"&&this._domain!=="firebaseio-demo.com"}get host(){return this._host}set host(e){e!==this.internalHost&&(this.internalHost=e,this.isCacheableHost()&&Ve.set("host:"+this._host,this.internalHost))}toString(){let e=this.toURLString();return this.persistenceKey&&(e+="<"+this.persistenceKey+">"),e}toURLString(){const e=this.secure?"https://":"http://",t=this.includeNamespaceInQueryParams?`?ns=${this.namespace}`:"";return`${e}${this.host}/${t}`}}function uh(n){return n.host!==n.internalHost||n.isCustomHost()||n.includeNamespaceInQueryParams}function aa(n,e,t){f(typeof e=="string","typeof type must == string"),f(typeof t=="object","typeof params must == object");let i;if(e===sa)i=(n.secure?"wss://":"ws://")+n.internalHost+"/.ws?";else if(e===ra)i=(n.secure?"https://":"http://")+n.internalHost+"/.lp?";else throw new Error("Unknown connection type: "+e);uh(n)&&(t.ns=n.namespace);const s=[];return W(t,(r,o)=>{s.push(r+"="+o)}),i+s.join("&")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hh{constructor(){this.counters_={}}incrementCounter(e,t=1){de(this.counters_,e)||(this.counters_[e]=0),this.counters_[e]+=t}get(){return Sl(this.counters_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ii={},vi={};function ds(n){const e=n.toString();return Ii[e]||(Ii[e]=new hh),Ii[e]}function dh(n,e){const t=n.toString();return vi[t]||(vi[t]=e()),vi[t]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fh{constructor(e){this.onMessage_=e,this.pendingResponses=[],this.currentResponseNum=0,this.closeAfterResponse=-1,this.onClose=null}closeAfter(e,t){this.closeAfterResponse=e,this.onClose=t,this.closeAfterResponse<this.currentResponseNum&&(this.onClose(),this.onClose=null)}handleResponse(e,t){for(this.pendingResponses[e]=t;this.pendingResponses[this.currentResponseNum];){const i=this.pendingResponses[this.currentResponseNum];delete this.pendingResponses[this.currentResponseNum];for(let s=0;s<i.length;++s)i[s]&&Ct(()=>{this.onMessage_(i[s])});if(this.currentResponseNum===this.closeAfterResponse){this.onClose&&(this.onClose(),this.onClose=null);break}this.currentResponseNum++}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Er="start",ph="close",_h="pLPCommand",gh="pRTLPCB",ca="id",la="pw",ua="ser",mh="cb",yh="seg",wh="ts",Ih="d",vh="dframe",ha=1870,da=30,Eh=ha-da,Th=25e3,Ch=3e4;class ct{constructor(e,t,i,s,r,o,a){this.connId=e,this.repoInfo=t,this.applicationId=i,this.appCheckToken=s,this.authToken=r,this.transportSessionId=o,this.lastSessionId=a,this.bytesSent=0,this.bytesReceived=0,this.everConnected_=!1,this.log_=tn(e),this.stats_=ds(t),this.urlFn=c=>(this.appCheckToken&&(c[Wi]=this.appCheckToken),aa(t,ra,c))}open(e,t){this.curSegmentNum=0,this.onDisconnect_=t,this.myPacketOrderer=new fh(e),this.isClosed_=!1,this.connectTimeoutTimer_=setTimeout(()=>{this.log_("Timed out trying to connect."),this.onClosed_(),this.connectTimeoutTimer_=null},Math.floor(Ch)),Zu(()=>{if(this.isClosed_)return;this.scriptTagHolder=new fs((...r)=>{const[o,a,c,l,u]=r;if(this.incrementIncomingBytes_(r),!!this.scriptTagHolder)if(this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null),this.everConnected_=!0,o===Er)this.id=a,this.password=c;else if(o===ph)a?(this.scriptTagHolder.sendNewPolls=!1,this.myPacketOrderer.closeAfter(a,()=>{this.onClosed_()})):this.onClosed_();else throw new Error("Unrecognized command received: "+o)},(...r)=>{const[o,a]=r;this.incrementIncomingBytes_(r),this.myPacketOrderer.handleResponse(o,a)},()=>{this.onClosed_()},this.urlFn);const i={};i[Er]="t",i[ua]=Math.floor(Math.random()*1e8),this.scriptTagHolder.uniqueCallbackIdentifier&&(i[mh]=this.scriptTagHolder.uniqueCallbackIdentifier),i[Jo]=hs,this.transportSessionId&&(i[Xo]=this.transportSessionId),this.lastSessionId&&(i[na]=this.lastSessionId),this.applicationId&&(i[ia]=this.applicationId),this.appCheckToken&&(i[Wi]=this.appCheckToken),typeof location<"u"&&location.hostname&&ta.test(location.hostname)&&(i[Zo]=ea);const s=this.urlFn(i);this.log_("Connecting via long-poll to "+s),this.scriptTagHolder.addTag(s,()=>{})})}start(){this.scriptTagHolder.startLongPoll(this.id,this.password),this.addDisconnectPingFrame(this.id,this.password)}static forceAllow(){ct.forceAllow_=!0}static forceDisallow(){ct.forceDisallow_=!0}static isAvailable(){return ct.forceAllow_?!0:!ct.forceDisallow_&&typeof document<"u"&&document.createElement!=null&&!th()&&!nh()}markConnectionHealthy(){}shutdown_(){this.isClosed_=!0,this.scriptTagHolder&&(this.scriptTagHolder.close(),this.scriptTagHolder=null),this.myDisconnFrame&&(document.body.removeChild(this.myDisconnFrame),this.myDisconnFrame=null),this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null)}onClosed_(){this.isClosed_||(this.log_("Longpoll is closing itself"),this.shutdown_(),this.onDisconnect_&&(this.onDisconnect_(this.everConnected_),this.onDisconnect_=null))}close(){this.isClosed_||(this.log_("Longpoll is being closed."),this.shutdown_())}send(e){const t=L(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const i=Lo(t),s=Yo(i,Eh);for(let r=0;r<s.length;r++)this.scriptTagHolder.enqueueSegment(this.curSegmentNum,s.length,s[r]),this.curSegmentNum++}addDisconnectPingFrame(e,t){this.myDisconnFrame=document.createElement("iframe");const i={};i[vh]="t",i[ca]=e,i[la]=t,this.myDisconnFrame.src=this.urlFn(i),this.myDisconnFrame.style.display="none",document.body.appendChild(this.myDisconnFrame)}incrementIncomingBytes_(e){const t=L(e).length;this.bytesReceived+=t,this.stats_.incrementCounter("bytes_received",t)}}class fs{constructor(e,t,i,s){this.onDisconnect=i,this.urlFn=s,this.outstandingRequests=new Set,this.pendingSegs=[],this.currentSerial=Math.floor(Math.random()*1e8),this.sendNewPolls=!0;{this.uniqueCallbackIdentifier=Qu(),window[_h+this.uniqueCallbackIdentifier]=e,window[gh+this.uniqueCallbackIdentifier]=t,this.myIFrame=fs.createIFrame_();let r="";this.myIFrame.src&&this.myIFrame.src.substr(0,11)==="javascript:"&&(r='<script>document.domain="'+document.domain+'";<\/script>');const o="<html><body>"+r+"</body></html>";try{this.myIFrame.doc.open(),this.myIFrame.doc.write(o),this.myIFrame.doc.close()}catch(a){F("frame writing exception"),a.stack&&F(a.stack),F(a)}}}static createIFrame_(){const e=document.createElement("iframe");if(e.style.display="none",document.body){document.body.appendChild(e);try{e.contentWindow.document||F("No IE domain setting required")}catch{const i=document.domain;e.src="javascript:void((function(){document.open();document.domain='"+i+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";return e.contentDocument?e.doc=e.contentDocument:e.contentWindow?e.doc=e.contentWindow.document:e.document&&(e.doc=e.document),e}close(){this.alive=!1,this.myIFrame&&(this.myIFrame.doc.body.textContent="",setTimeout(()=>{this.myIFrame!==null&&(document.body.removeChild(this.myIFrame),this.myIFrame=null)},Math.floor(0)));const e=this.onDisconnect;e&&(this.onDisconnect=null,e())}startLongPoll(e,t){for(this.myID=e,this.myPW=t,this.alive=!0;this.newRequest_(););}newRequest_(){if(this.alive&&this.sendNewPolls&&this.outstandingRequests.size<(this.pendingSegs.length>0?2:1)){this.currentSerial++;const e={};e[ca]=this.myID,e[la]=this.myPW,e[ua]=this.currentSerial;let t=this.urlFn(e),i="",s=0;for(;this.pendingSegs.length>0&&this.pendingSegs[0].d.length+da+i.length<=ha;){const o=this.pendingSegs.shift();i=i+"&"+yh+s+"="+o.seg+"&"+wh+s+"="+o.ts+"&"+Ih+s+"="+o.d,s++}return t=t+i,this.addLongPollTag_(t,this.currentSerial),!0}else return!1}enqueueSegment(e,t,i){this.pendingSegs.push({seg:e,ts:t,d:i}),this.alive&&this.newRequest_()}addLongPollTag_(e,t){this.outstandingRequests.add(t);const i=()=>{this.outstandingRequests.delete(t),this.newRequest_()},s=setTimeout(i,Math.floor(Th)),r=()=>{clearTimeout(s),i()};this.addTag(e,r)}addTag(e,t){setTimeout(()=>{try{if(!this.sendNewPolls)return;const i=this.myIFrame.doc.createElement("script");i.type="text/javascript",i.async=!0,i.src=e,i.onload=i.onreadystatechange=function(){const s=i.readyState;(!s||s==="loaded"||s==="complete")&&(i.onload=i.onreadystatechange=null,i.parentNode&&i.parentNode.removeChild(i),t())},i.onerror=()=>{F("Long-poll script failed to load: "+e),this.sendNewPolls=!1,this.close()},this.myIFrame.doc.body.appendChild(i)}catch{}},Math.floor(1))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bh=16384,Sh=45e3;let Sn=null;typeof MozWebSocket<"u"?Sn=MozWebSocket:typeof WebSocket<"u"&&(Sn=WebSocket);class ie{constructor(e,t,i,s,r,o,a){this.connId=e,this.applicationId=i,this.appCheckToken=s,this.authToken=r,this.keepaliveTimer=null,this.frames=null,this.totalFrames=0,this.bytesSent=0,this.bytesReceived=0,this.log_=tn(this.connId),this.stats_=ds(t),this.connURL=ie.connectionURL_(t,o,a,s,i),this.nodeAdmin=t.nodeAdmin}static connectionURL_(e,t,i,s,r){const o={};return o[Jo]=hs,typeof location<"u"&&location.hostname&&ta.test(location.hostname)&&(o[Zo]=ea),t&&(o[Xo]=t),i&&(o[na]=i),s&&(o[Wi]=s),r&&(o[ia]=r),aa(e,sa,o)}open(e,t){this.onDisconnect=t,this.onMessage=e,this.log_("Websocket connecting to "+this.connURL),this.everConnected_=!1,Ve.set("previous_websocket_failure",!0);try{let i;Ll(),this.mySock=new Sn(this.connURL,[],i)}catch(i){this.log_("Error instantiating WebSocket.");const s=i.message||i.data;s&&this.log_(s),this.onClosed_();return}this.mySock.onopen=()=>{this.log_("Websocket connected."),this.everConnected_=!0},this.mySock.onclose=()=>{this.log_("Websocket connection was disconnected."),this.mySock=null,this.onClosed_()},this.mySock.onmessage=i=>{this.handleIncomingFrame(i)},this.mySock.onerror=i=>{this.log_("WebSocket error.  Closing connection.");const s=i.message||i.data;s&&this.log_(s),this.onClosed_()}}start(){}static forceDisallow(){ie.forceDisallow_=!0}static isAvailable(){let e=!1;if(typeof navigator<"u"&&navigator.userAgent){const t=/Android ([0-9]{0,}\.[0-9]{0,})/,i=navigator.userAgent.match(t);i&&i.length>1&&parseFloat(i[1])<4.4&&(e=!0)}return!e&&Sn!==null&&!ie.forceDisallow_}static previouslyFailed(){return Ve.isInMemoryStorage||Ve.get("previous_websocket_failure")===!0}markConnectionHealthy(){Ve.remove("previous_websocket_failure")}appendFrame_(e){if(this.frames.push(e),this.frames.length===this.totalFrames){const t=this.frames.join("");this.frames=null;const i=$t(t);this.onMessage(i)}}handleNewFrameCount_(e){this.totalFrames=e,this.frames=[]}extractFrameCount_(e){if(f(this.frames===null,"We already have a frame buffer"),e.length<=6){const t=Number(e);if(!isNaN(t))return this.handleNewFrameCount_(t),null}return this.handleNewFrameCount_(1),e}handleIncomingFrame(e){if(this.mySock===null)return;const t=e.data;if(this.bytesReceived+=t.length,this.stats_.incrementCounter("bytes_received",t.length),this.resetKeepAlive(),this.frames!==null)this.appendFrame_(t);else{const i=this.extractFrameCount_(t);i!==null&&this.appendFrame_(i)}}send(e){this.resetKeepAlive();const t=L(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const i=Yo(t,bh);i.length>1&&this.sendString_(String(i.length));for(let s=0;s<i.length;s++)this.sendString_(i[s])}shutdown_(){this.isClosed_=!0,this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null),this.mySock&&(this.mySock.close(),this.mySock=null)}onClosed_(){this.isClosed_||(this.log_("WebSocket is closing itself"),this.shutdown_(),this.onDisconnect&&(this.onDisconnect(this.everConnected_),this.onDisconnect=null))}close(){this.isClosed_||(this.log_("WebSocket is being closed"),this.shutdown_())}resetKeepAlive(){clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>{this.mySock&&this.sendString_("0"),this.resetKeepAlive()},Math.floor(Sh))}sendString_(e){try{this.mySock.send(e)}catch(t){this.log_("Exception thrown from WebSocket.send():",t.message||t.data,"Closing connection."),setTimeout(this.onClosed_.bind(this),0)}}}ie.responsesRequiredToBeHealthy=2;ie.healthyTimeout=3e4;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jt{static get ALL_TRANSPORTS(){return[ct,ie]}static get IS_TRANSPORT_INITIALIZED(){return this.globalTransportInitialized_}constructor(e){this.initTransports_(e)}initTransports_(e){const t=ie&&ie.isAvailable();let i=t&&!ie.previouslyFailed();if(e.webSocketOnly&&(t||V("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),i=!0),i)this.transports_=[ie];else{const s=this.transports_=[];for(const r of jt.ALL_TRANSPORTS)r&&r.isAvailable()&&s.push(r);jt.globalTransportInitialized_=!0}}initialTransport(){if(this.transports_.length>0)return this.transports_[0];throw new Error("No transports available")}upgradeTransport(){return this.transports_.length>1?this.transports_[1]:null}}jt.globalTransportInitialized_=!1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rh=6e4,kh=5e3,Ah=10*1024,Ph=100*1024,Ei="t",Tr="d",Nh="s",Cr="r",Oh="e",br="o",Sr="a",Rr="n",kr="p",Dh="h";class Lh{constructor(e,t,i,s,r,o,a,c,l,u){this.id=e,this.repoInfo_=t,this.applicationId_=i,this.appCheckToken_=s,this.authToken_=r,this.onMessage_=o,this.onReady_=a,this.onDisconnect_=c,this.onKill_=l,this.lastSessionId=u,this.connectionCount=0,this.pendingDataMessages=[],this.state_=0,this.log_=tn("c:"+this.id+":"),this.transportManager_=new jt(t),this.log_("Connection created"),this.start_()}start_(){const e=this.transportManager_.initialTransport();this.conn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,null,this.lastSessionId),this.primaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.conn_),i=this.disconnReceiver_(this.conn_);this.tx_=this.conn_,this.rx_=this.conn_,this.secondaryConn_=null,this.isHealthy_=!1,setTimeout(()=>{this.conn_&&this.conn_.open(t,i)},Math.floor(0));const s=e.healthyTimeout||0;s>0&&(this.healthyTimeout_=xt(()=>{this.healthyTimeout_=null,this.isHealthy_||(this.conn_&&this.conn_.bytesReceived>Ph?(this.log_("Connection exceeded healthy timeout but has received "+this.conn_.bytesReceived+" bytes.  Marking connection healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()):this.conn_&&this.conn_.bytesSent>Ah?this.log_("Connection exceeded healthy timeout but has sent "+this.conn_.bytesSent+" bytes.  Leaving connection alive."):(this.log_("Closing unhealthy connection after timeout."),this.close()))},Math.floor(s)))}nextTransportId_(){return"c:"+this.id+":"+this.connectionCount++}disconnReceiver_(e){return t=>{e===this.conn_?this.onConnectionLost_(t):e===this.secondaryConn_?(this.log_("Secondary connection lost."),this.onSecondaryConnectionLost_()):this.log_("closing an old connection")}}connReceiver_(e){return t=>{this.state_!==2&&(e===this.rx_?this.onPrimaryMessageReceived_(t):e===this.secondaryConn_?this.onSecondaryMessageReceived_(t):this.log_("message on old connection"))}}sendRequest(e){const t={t:"d",d:e};this.sendData_(t)}tryCleanupConnection(){this.tx_===this.secondaryConn_&&this.rx_===this.secondaryConn_&&(this.log_("cleaning up and promoting a connection: "+this.secondaryConn_.connId),this.conn_=this.secondaryConn_,this.secondaryConn_=null)}onSecondaryControl_(e){if(Ei in e){const t=e[Ei];t===Sr?this.upgradeIfSecondaryHealthy_():t===Cr?(this.log_("Got a reset on secondary, closing it"),this.secondaryConn_.close(),(this.tx_===this.secondaryConn_||this.rx_===this.secondaryConn_)&&this.close()):t===br&&(this.log_("got pong on secondary."),this.secondaryResponsesRequired_--,this.upgradeIfSecondaryHealthy_())}}onSecondaryMessageReceived_(e){const t=kt("t",e),i=kt("d",e);if(t==="c")this.onSecondaryControl_(i);else if(t==="d")this.pendingDataMessages.push(i);else throw new Error("Unknown protocol layer: "+t)}upgradeIfSecondaryHealthy_(){this.secondaryResponsesRequired_<=0?(this.log_("Secondary connection is healthy."),this.isHealthy_=!0,this.secondaryConn_.markConnectionHealthy(),this.proceedWithUpgrade_()):(this.log_("sending ping on secondary."),this.secondaryConn_.send({t:"c",d:{t:kr,d:{}}}))}proceedWithUpgrade_(){this.secondaryConn_.start(),this.log_("sending client ack on secondary"),this.secondaryConn_.send({t:"c",d:{t:Sr,d:{}}}),this.log_("Ending transmission on primary"),this.conn_.send({t:"c",d:{t:Rr,d:{}}}),this.tx_=this.secondaryConn_,this.tryCleanupConnection()}onPrimaryMessageReceived_(e){const t=kt("t",e),i=kt("d",e);t==="c"?this.onControl_(i):t==="d"&&this.onDataMessage_(i)}onDataMessage_(e){this.onPrimaryResponse_(),this.onMessage_(e)}onPrimaryResponse_(){this.isHealthy_||(this.primaryResponsesRequired_--,this.primaryResponsesRequired_<=0&&(this.log_("Primary connection is healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()))}onControl_(e){const t=kt(Ei,e);if(Tr in e){const i=e[Tr];if(t===Dh){const s={...i};this.repoInfo_.isUsingEmulator&&(s.h=this.repoInfo_.host),this.onHandshake_(s)}else if(t===Rr){this.log_("recvd end transmission on primary"),this.rx_=this.secondaryConn_;for(let s=0;s<this.pendingDataMessages.length;++s)this.onDataMessage_(this.pendingDataMessages[s]);this.pendingDataMessages=[],this.tryCleanupConnection()}else t===Nh?this.onConnectionShutdown_(i):t===Cr?this.onReset_(i):t===Oh?Fi("Server Error: "+i):t===br?(this.log_("got pong on primary."),this.onPrimaryResponse_(),this.sendPingOnPrimaryIfNecessary_()):Fi("Unknown control packet command: "+t)}}onHandshake_(e){const t=e.ts,i=e.v,s=e.h;this.sessionId=e.s,this.repoInfo_.host=s,this.state_===0&&(this.conn_.start(),this.onConnectionEstablished_(this.conn_,t),hs!==i&&V("Protocol version mismatch detected"),this.tryStartUpgrade_())}tryStartUpgrade_(){const e=this.transportManager_.upgradeTransport();e&&this.startUpgrade_(e)}startUpgrade_(e){this.secondaryConn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,this.sessionId),this.secondaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.secondaryConn_),i=this.disconnReceiver_(this.secondaryConn_);this.secondaryConn_.open(t,i),xt(()=>{this.secondaryConn_&&(this.log_("Timed out trying to upgrade."),this.secondaryConn_.close())},Math.floor(Rh))}onReset_(e){this.log_("Reset packet received.  New host: "+e),this.repoInfo_.host=e,this.state_===1?this.close():(this.closeConnections_(),this.start_())}onConnectionEstablished_(e,t){this.log_("Realtime connection established."),this.conn_=e,this.state_=1,this.onReady_&&(this.onReady_(t,this.sessionId),this.onReady_=null),this.primaryResponsesRequired_===0?(this.log_("Primary connection is healthy."),this.isHealthy_=!0):xt(()=>{this.sendPingOnPrimaryIfNecessary_()},Math.floor(kh))}sendPingOnPrimaryIfNecessary_(){!this.isHealthy_&&this.state_===1&&(this.log_("sending ping on primary."),this.sendData_({t:"c",d:{t:kr,d:{}}}))}onSecondaryConnectionLost_(){const e=this.secondaryConn_;this.secondaryConn_=null,(this.tx_===e||this.rx_===e)&&this.close()}onConnectionLost_(e){this.conn_=null,!e&&this.state_===0?(this.log_("Realtime connection failed."),this.repoInfo_.isCacheableHost()&&(Ve.remove("host:"+this.repoInfo_.host),this.repoInfo_.internalHost=this.repoInfo_.host)):this.state_===1&&this.log_("Realtime connection lost."),this.close()}onConnectionShutdown_(e){this.log_("Connection shutdown command received. Shutting down..."),this.onKill_&&(this.onKill_(e),this.onKill_=null),this.onDisconnect_=null,this.close()}sendData_(e){if(this.state_!==1)throw"Connection is not connected";this.tx_.send(e)}close(){this.state_!==2&&(this.log_("Closing realtime connection."),this.state_=2,this.closeConnections_(),this.onDisconnect_&&(this.onDisconnect_(),this.onDisconnect_=null))}closeConnections_(){this.log_("Shutting down all connections"),this.conn_&&(this.conn_.close(),this.conn_=null),this.secondaryConn_&&(this.secondaryConn_.close(),this.secondaryConn_=null),this.healthyTimeout_&&(clearTimeout(this.healthyTimeout_),this.healthyTimeout_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fa{put(e,t,i,s){}merge(e,t,i,s){}refreshAuthToken(e){}refreshAppCheckToken(e){}onDisconnectPut(e,t,i){}onDisconnectMerge(e,t,i){}onDisconnectCancel(e,t){}reportStats(e){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pa{constructor(e){this.allowedEvents_=e,this.listeners_={},f(Array.isArray(e)&&e.length>0,"Requires a non-empty array")}trigger(e,...t){if(Array.isArray(this.listeners_[e])){const i=[...this.listeners_[e]];for(let s=0;s<i.length;s++)i[s].callback.apply(i[s].context,t)}}on(e,t,i){this.validateEventType_(e),this.listeners_[e]=this.listeners_[e]||[],this.listeners_[e].push({callback:t,context:i});const s=this.getInitialEvent(e);s&&t.apply(i,s)}off(e,t,i){this.validateEventType_(e);const s=this.listeners_[e]||[];for(let r=0;r<s.length;r++)if(s[r].callback===t&&(!i||i===s[r].context)){s.splice(r,1);return}}validateEventType_(e){f(this.allowedEvents_.find(t=>t===e),"Unknown event: "+e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rn extends pa{static getInstance(){return new Rn}constructor(){super(["online"]),this.online_=!0,typeof window<"u"&&typeof window.addEventListener<"u"&&!ss()&&(window.addEventListener("online",()=>{this.online_||(this.online_=!0,this.trigger("online",!0))},!1),window.addEventListener("offline",()=>{this.online_&&(this.online_=!1,this.trigger("online",!1))},!1))}getInitialEvent(e){return f(e==="online","Unknown event type: "+e),[this.online_]}currentlyOnline(){return this.online_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ar=32,Pr=768;class b{constructor(e,t){if(t===void 0){this.pieces_=e.split("/");let i=0;for(let s=0;s<this.pieces_.length;s++)this.pieces_[s].length>0&&(this.pieces_[i]=this.pieces_[s],i++);this.pieces_.length=i,this.pieceNum_=0}else this.pieces_=e,this.pieceNum_=t}toString(){let e="";for(let t=this.pieceNum_;t<this.pieces_.length;t++)this.pieces_[t]!==""&&(e+="/"+this.pieces_[t]);return e||"/"}}function T(){return new b("")}function w(n){return n.pieceNum_>=n.pieces_.length?null:n.pieces_[n.pieceNum_]}function Ue(n){return n.pieces_.length-n.pieceNum_}function R(n){let e=n.pieceNum_;return e<n.pieces_.length&&e++,new b(n.pieces_,e)}function ps(n){return n.pieceNum_<n.pieces_.length?n.pieces_[n.pieces_.length-1]:null}function Mh(n){let e="";for(let t=n.pieceNum_;t<n.pieces_.length;t++)n.pieces_[t]!==""&&(e+="/"+encodeURIComponent(String(n.pieces_[t])));return e||"/"}function Gt(n,e=0){return n.pieces_.slice(n.pieceNum_+e)}function _a(n){if(n.pieceNum_>=n.pieces_.length)return null;const e=[];for(let t=n.pieceNum_;t<n.pieces_.length-1;t++)e.push(n.pieces_[t]);return new b(e,0)}function A(n,e){const t=[];for(let i=n.pieceNum_;i<n.pieces_.length;i++)t.push(n.pieces_[i]);if(e instanceof b)for(let i=e.pieceNum_;i<e.pieces_.length;i++)t.push(e.pieces_[i]);else{const i=e.split("/");for(let s=0;s<i.length;s++)i[s].length>0&&t.push(i[s])}return new b(t,0)}function v(n){return n.pieceNum_>=n.pieces_.length}function $(n,e){const t=w(n),i=w(e);if(t===null)return e;if(t===i)return $(R(n),R(e));throw new Error("INTERNAL ERROR: innerPath ("+e+") is not within outerPath ("+n+")")}function xh(n,e){const t=Gt(n,0),i=Gt(e,0);for(let s=0;s<t.length&&s<i.length;s++){const r=rt(t[s],i[s]);if(r!==0)return r}return t.length===i.length?0:t.length<i.length?-1:1}function _s(n,e){if(Ue(n)!==Ue(e))return!1;for(let t=n.pieceNum_,i=e.pieceNum_;t<=n.pieces_.length;t++,i++)if(n.pieces_[t]!==e.pieces_[i])return!1;return!0}function Z(n,e){let t=n.pieceNum_,i=e.pieceNum_;if(Ue(n)>Ue(e))return!1;for(;t<n.pieces_.length;){if(n.pieces_[t]!==e.pieces_[i])return!1;++t,++i}return!0}class Uh{constructor(e,t){this.errorPrefix_=t,this.parts_=Gt(e,0),this.byteLength_=Math.max(1,this.parts_.length);for(let i=0;i<this.parts_.length;i++)this.byteLength_+=Yn(this.parts_[i]);ga(this)}}function Fh(n,e){n.parts_.length>0&&(n.byteLength_+=1),n.parts_.push(e),n.byteLength_+=Yn(e),ga(n)}function Wh(n){const e=n.parts_.pop();n.byteLength_-=Yn(e),n.parts_.length>0&&(n.byteLength_-=1)}function ga(n){if(n.byteLength_>Pr)throw new Error(n.errorPrefix_+"has a key path longer than "+Pr+" bytes ("+n.byteLength_+").");if(n.parts_.length>Ar)throw new Error(n.errorPrefix_+"path specified exceeds the maximum depth that can be written ("+Ar+") or object contains a cycle "+$e(n))}function $e(n){return n.parts_.length===0?"":"in property '"+n.parts_.join(".")+"'"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gs extends pa{static getInstance(){return new gs}constructor(){super(["visible"]);let e,t;typeof document<"u"&&typeof document.addEventListener<"u"&&(typeof document.hidden<"u"?(t="visibilitychange",e="hidden"):typeof document.mozHidden<"u"?(t="mozvisibilitychange",e="mozHidden"):typeof document.msHidden<"u"?(t="msvisibilitychange",e="msHidden"):typeof document.webkitHidden<"u"&&(t="webkitvisibilitychange",e="webkitHidden")),this.visible_=!0,t&&document.addEventListener(t,()=>{const i=!document[e];i!==this.visible_&&(this.visible_=i,this.trigger("visible",i))},!1)}getInitialEvent(e){return f(e==="visible","Unknown event type: "+e),[this.visible_]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const At=1e3,Bh=300*1e3,Nr=30*1e3,Hh=1.3,$h=3e4,Vh="server_kill",Or=3;class ye extends fa{constructor(e,t,i,s,r,o,a,c){if(super(),this.repoInfo_=e,this.applicationId_=t,this.onDataUpdate_=i,this.onConnectStatus_=s,this.onServerInfoUpdate_=r,this.authTokenProvider_=o,this.appCheckTokenProvider_=a,this.authOverride_=c,this.id=ye.nextPersistentConnectionId_++,this.log_=tn("p:"+this.id+":"),this.interruptReasons_={},this.listens=new Map,this.outstandingPuts_=[],this.outstandingGets_=[],this.outstandingPutCount_=0,this.outstandingGetCount_=0,this.onDisconnectRequestQueue_=[],this.connected_=!1,this.reconnectDelay_=At,this.maxReconnectDelay_=Bh,this.securityDebugCallback_=null,this.lastSessionId=null,this.establishConnectionTimer_=null,this.visible_=!1,this.requestCBHash_={},this.requestNumber_=0,this.realtime_=null,this.authToken_=null,this.appCheckToken_=null,this.forceTokenRefresh_=!1,this.invalidAuthTokenCount_=0,this.invalidAppCheckTokenCount_=0,this.firstConnection_=!0,this.lastConnectionAttemptTime_=null,this.lastConnectionEstablishedTime_=null,c)throw new Error("Auth override specified in options, but not supported on non Node.js platforms");gs.getInstance().on("visible",this.onVisible_,this),e.host.indexOf("fblocal")===-1&&Rn.getInstance().on("online",this.onOnline_,this)}sendRequest(e,t,i){const s=++this.requestNumber_,r={r:s,a:e,b:t};this.log_(L(r)),f(this.connected_,"sendRequest call when we're not connected not allowed."),this.realtime_.sendRequest(r),i&&(this.requestCBHash_[s]=i)}get(e){this.initConnection_();const t=new Et,s={action:"g",request:{p:e._path.toString(),q:e._queryObject},onComplete:o=>{const a=o.d;o.s==="ok"?t.resolve(a):t.reject(a)}};this.outstandingGets_.push(s),this.outstandingGetCount_++;const r=this.outstandingGets_.length-1;return this.connected_&&this.sendGet_(r),t.promise}listen(e,t,i,s){this.initConnection_();const r=e._queryIdentifier,o=e._path.toString();this.log_("Listen called for "+o+" "+r),this.listens.has(o)||this.listens.set(o,new Map),f(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"listen() called for non-default but complete query"),f(!this.listens.get(o).has(r),"listen() called twice for same path/queryId.");const a={onComplete:s,hashFn:t,query:e,tag:i};this.listens.get(o).set(r,a),this.connected_&&this.sendListen_(a)}sendGet_(e){const t=this.outstandingGets_[e];this.sendRequest("g",t.request,i=>{delete this.outstandingGets_[e],this.outstandingGetCount_--,this.outstandingGetCount_===0&&(this.outstandingGets_=[]),t.onComplete&&t.onComplete(i)})}sendListen_(e){const t=e.query,i=t._path.toString(),s=t._queryIdentifier;this.log_("Listen on "+i+" for "+s);const r={p:i},o="q";e.tag&&(r.q=t._queryObject,r.t=e.tag),r.h=e.hashFn(),this.sendRequest(o,r,a=>{const c=a.d,l=a.s;ye.warnOnListenWarnings_(c,t),(this.listens.get(i)&&this.listens.get(i).get(s))===e&&(this.log_("listen response",a),l!=="ok"&&this.removeListen_(i,s),e.onComplete&&e.onComplete(l,c))})}static warnOnListenWarnings_(e,t){if(e&&typeof e=="object"&&de(e,"w")){const i=pt(e,"w");if(Array.isArray(i)&&~i.indexOf("no_index")){const s='".indexOn": "'+t._queryParams.getIndex().toString()+'"',r=t._path.toString();V(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${s} at ${r} to your security rules for better performance.`)}}}refreshAuthToken(e){this.authToken_=e,this.log_("Auth token refreshed"),this.authToken_?this.tryAuth():this.connected_&&this.sendRequest("unauth",{},()=>{}),this.reduceReconnectDelayIfAdminCredential_(e)}reduceReconnectDelayIfAdminCredential_(e){(e&&e.length===40||Fl(e))&&(this.log_("Admin auth credential detected.  Reducing max reconnect time."),this.maxReconnectDelay_=Nr)}refreshAppCheckToken(e){this.appCheckToken_=e,this.log_("App check token refreshed"),this.appCheckToken_?this.tryAppCheck():this.connected_&&this.sendRequest("unappeck",{},()=>{})}tryAuth(){if(this.connected_&&this.authToken_){const e=this.authToken_,t=Ul(e)?"auth":"gauth",i={cred:e};this.authOverride_===null?i.noauth=!0:typeof this.authOverride_=="object"&&(i.authvar=this.authOverride_),this.sendRequest(t,i,s=>{const r=s.s,o=s.d||"error";this.authToken_===e&&(r==="ok"?this.invalidAuthTokenCount_=0:this.onAuthRevoked_(r,o))})}}tryAppCheck(){this.connected_&&this.appCheckToken_&&this.sendRequest("appcheck",{token:this.appCheckToken_},e=>{const t=e.s,i=e.d||"error";t==="ok"?this.invalidAppCheckTokenCount_=0:this.onAppCheckRevoked_(t,i)})}unlisten(e,t){const i=e._path.toString(),s=e._queryIdentifier;this.log_("Unlisten called for "+i+" "+s),f(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"unlisten() called for non-default but complete query"),this.removeListen_(i,s)&&this.connected_&&this.sendUnlisten_(i,s,e._queryObject,t)}sendUnlisten_(e,t,i,s){this.log_("Unlisten on "+e+" for "+t);const r={p:e},o="n";s&&(r.q=i,r.t=s),this.sendRequest(o,r)}onDisconnectPut(e,t,i){this.initConnection_(),this.connected_?this.sendOnDisconnect_("o",e,t,i):this.onDisconnectRequestQueue_.push({pathString:e,action:"o",data:t,onComplete:i})}onDisconnectMerge(e,t,i){this.initConnection_(),this.connected_?this.sendOnDisconnect_("om",e,t,i):this.onDisconnectRequestQueue_.push({pathString:e,action:"om",data:t,onComplete:i})}onDisconnectCancel(e,t){this.initConnection_(),this.connected_?this.sendOnDisconnect_("oc",e,null,t):this.onDisconnectRequestQueue_.push({pathString:e,action:"oc",data:null,onComplete:t})}sendOnDisconnect_(e,t,i,s){const r={p:t,d:i};this.log_("onDisconnect "+e,r),this.sendRequest(e,r,o=>{s&&setTimeout(()=>{s(o.s,o.d)},Math.floor(0))})}put(e,t,i,s){this.putInternal("p",e,t,i,s)}merge(e,t,i,s){this.putInternal("m",e,t,i,s)}putInternal(e,t,i,s,r){this.initConnection_();const o={p:t,d:i};r!==void 0&&(o.h=r),this.outstandingPuts_.push({action:e,request:o,onComplete:s}),this.outstandingPutCount_++;const a=this.outstandingPuts_.length-1;this.connected_?this.sendPut_(a):this.log_("Buffering put: "+t)}sendPut_(e){const t=this.outstandingPuts_[e].action,i=this.outstandingPuts_[e].request,s=this.outstandingPuts_[e].onComplete;this.outstandingPuts_[e].queued=this.connected_,this.sendRequest(t,i,r=>{this.log_(t+" response",r),delete this.outstandingPuts_[e],this.outstandingPutCount_--,this.outstandingPutCount_===0&&(this.outstandingPuts_=[]),s&&s(r.s,r.d)})}reportStats(e){if(this.connected_){const t={c:e};this.log_("reportStats",t),this.sendRequest("s",t,i=>{if(i.s!=="ok"){const r=i.d;this.log_("reportStats","Error sending stats: "+r)}})}}onDataMessage_(e){if("r"in e){this.log_("from server: "+L(e));const t=e.r,i=this.requestCBHash_[t];i&&(delete this.requestCBHash_[t],i(e.b))}else{if("error"in e)throw"A server-side error has occurred: "+e.error;"a"in e&&this.onDataPush_(e.a,e.b)}}onDataPush_(e,t){this.log_("handleServerMessage",e,t),e==="d"?this.onDataUpdate_(t.p,t.d,!1,t.t):e==="m"?this.onDataUpdate_(t.p,t.d,!0,t.t):e==="c"?this.onListenRevoked_(t.p,t.q):e==="ac"?this.onAuthRevoked_(t.s,t.d):e==="apc"?this.onAppCheckRevoked_(t.s,t.d):e==="sd"?this.onSecurityDebugPacket_(t):Fi("Unrecognized action received from server: "+L(e)+`
Are you using the latest client?`)}onReady_(e,t){this.log_("connection ready"),this.connected_=!0,this.lastConnectionEstablishedTime_=new Date().getTime(),this.handleTimestamp_(e),this.lastSessionId=t,this.firstConnection_&&this.sendConnectStats_(),this.restoreState_(),this.firstConnection_=!1,this.onConnectStatus_(!0)}scheduleConnect_(e){f(!this.realtime_,"Scheduling a connect when we're already connected/ing?"),this.establishConnectionTimer_&&clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=setTimeout(()=>{this.establishConnectionTimer_=null,this.establishConnection_()},Math.floor(e))}initConnection_(){!this.realtime_&&this.firstConnection_&&this.scheduleConnect_(0)}onVisible_(e){e&&!this.visible_&&this.reconnectDelay_===this.maxReconnectDelay_&&(this.log_("Window became visible.  Reducing delay."),this.reconnectDelay_=At,this.realtime_||this.scheduleConnect_(0)),this.visible_=e}onOnline_(e){e?(this.log_("Browser went online."),this.reconnectDelay_=At,this.realtime_||this.scheduleConnect_(0)):(this.log_("Browser went offline.  Killing connection."),this.realtime_&&this.realtime_.close())}onRealtimeDisconnect_(){if(this.log_("data client disconnected"),this.connected_=!1,this.realtime_=null,this.cancelSentTransactions_(),this.requestCBHash_={},this.shouldReconnect_()){this.visible_?this.lastConnectionEstablishedTime_&&(new Date().getTime()-this.lastConnectionEstablishedTime_>$h&&(this.reconnectDelay_=At),this.lastConnectionEstablishedTime_=null):(this.log_("Window isn't visible.  Delaying reconnect."),this.reconnectDelay_=this.maxReconnectDelay_,this.lastConnectionAttemptTime_=new Date().getTime());const e=Math.max(0,new Date().getTime()-this.lastConnectionAttemptTime_);let t=Math.max(0,this.reconnectDelay_-e);t=Math.random()*t,this.log_("Trying to reconnect in "+t+"ms"),this.scheduleConnect_(t),this.reconnectDelay_=Math.min(this.maxReconnectDelay_,this.reconnectDelay_*Hh)}this.onConnectStatus_(!1)}async establishConnection_(){if(this.shouldReconnect_()){this.log_("Making a connection attempt"),this.lastConnectionAttemptTime_=new Date().getTime(),this.lastConnectionEstablishedTime_=null;const e=this.onDataMessage_.bind(this),t=this.onReady_.bind(this),i=this.onRealtimeDisconnect_.bind(this),s=this.id+":"+ye.nextConnectionId_++,r=this.lastSessionId;let o=!1,a=null;const c=function(){a?a.close():(o=!0,i())},l=function(h){f(a,"sendRequest call when we're not connected not allowed."),a.sendRequest(h)};this.realtime_={close:c,sendRequest:l};const u=this.forceTokenRefresh_;this.forceTokenRefresh_=!1;try{const[h,d]=await Promise.all([this.authTokenProvider_.getToken(u),this.appCheckTokenProvider_.getToken(u)]);o?F("getToken() completed but was canceled"):(F("getToken() completed. Creating connection."),this.authToken_=h&&h.accessToken,this.appCheckToken_=d&&d.token,a=new Lh(s,this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,e,t,i,p=>{V(p+" ("+this.repoInfo_.toString()+")"),this.interrupt(Vh)},r))}catch(h){this.log_("Failed to get token: "+h),o||(this.repoInfo_.nodeAdmin&&V(h),c())}}}interrupt(e){F("Interrupting connection for reason: "+e),this.interruptReasons_[e]=!0,this.realtime_?this.realtime_.close():(this.establishConnectionTimer_&&(clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=null),this.connected_&&this.onRealtimeDisconnect_())}resume(e){F("Resuming connection for reason: "+e),delete this.interruptReasons_[e],Li(this.interruptReasons_)&&(this.reconnectDelay_=At,this.realtime_||this.scheduleConnect_(0))}handleTimestamp_(e){const t=e-new Date().getTime();this.onServerInfoUpdate_({serverTimeOffset:t})}cancelSentTransactions_(){for(let e=0;e<this.outstandingPuts_.length;e++){const t=this.outstandingPuts_[e];t&&"h"in t.request&&t.queued&&(t.onComplete&&t.onComplete("disconnect"),delete this.outstandingPuts_[e],this.outstandingPutCount_--)}this.outstandingPutCount_===0&&(this.outstandingPuts_=[])}onListenRevoked_(e,t){let i;t?i=t.map(r=>us(r)).join("$"):i="default";const s=this.removeListen_(e,i);s&&s.onComplete&&s.onComplete("permission_denied")}removeListen_(e,t){const i=new b(e).toString();let s;if(this.listens.has(i)){const r=this.listens.get(i);s=r.get(t),r.delete(t),r.size===0&&this.listens.delete(i)}else s=void 0;return s}onAuthRevoked_(e,t){F("Auth token revoked: "+e+"/"+t),this.authToken_=null,this.forceTokenRefresh_=!0,this.realtime_.close(),(e==="invalid_token"||e==="permission_denied")&&(this.invalidAuthTokenCount_++,this.invalidAuthTokenCount_>=Or&&(this.reconnectDelay_=Nr,this.authTokenProvider_.notifyForInvalidToken()))}onAppCheckRevoked_(e,t){F("App check token revoked: "+e+"/"+t),this.appCheckToken_=null,this.forceTokenRefresh_=!0,(e==="invalid_token"||e==="permission_denied")&&(this.invalidAppCheckTokenCount_++,this.invalidAppCheckTokenCount_>=Or&&this.appCheckTokenProvider_.notifyForInvalidToken())}onSecurityDebugPacket_(e){this.securityDebugCallback_?this.securityDebugCallback_(e):"msg"in e&&console.log("FIREBASE: "+e.msg.replace(`
`,`
FIREBASE: `))}restoreState_(){this.tryAuth(),this.tryAppCheck();for(const e of this.listens.values())for(const t of e.values())this.sendListen_(t);for(let e=0;e<this.outstandingPuts_.length;e++)this.outstandingPuts_[e]&&this.sendPut_(e);for(;this.onDisconnectRequestQueue_.length;){const e=this.onDisconnectRequestQueue_.shift();this.sendOnDisconnect_(e.action,e.pathString,e.data,e.onComplete)}for(let e=0;e<this.outstandingGets_.length;e++)this.outstandingGets_[e]&&this.sendGet_(e)}sendConnectStats_(){const e={};let t="js";e["sdk."+t+"."+Go.replace(/\./g,"-")]=1,ss()?e["framework.cordova"]=1:Ho()&&(e["framework.reactnative"]=1),this.reportStats(e)}shouldReconnect_(){const e=Rn.getInstance().currentlyOnline();return Li(this.interruptReasons_)&&e}}ye.nextPersistentConnectionId_=0;ye.nextConnectionId_=0;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class I{constructor(e,t){this.name=e,this.node=t}static Wrap(e,t){return new I(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xn{getCompare(){return this.compare.bind(this)}indexedValueChanged(e,t){const i=new I(_t,e),s=new I(_t,t);return this.compare(i,s)!==0}minPost(){return I.MIN}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let dn;class ma extends Xn{static get __EMPTY_NODE(){return dn}static set __EMPTY_NODE(e){dn=e}compare(e,t){return rt(e.name,t.name)}isDefinedOn(e){throw vt("KeyIndex.isDefinedOn not expected to be called.")}indexedValueChanged(e,t){return!1}minPost(){return I.MIN}maxPost(){return new I(Ke,dn)}makePost(e,t){return f(typeof e=="string","KeyIndex indexValue must always be a string."),new I(e,dn)}toString(){return".key"}}const ut=new ma;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fn{constructor(e,t,i,s,r=null){this.isReverse_=s,this.resultGenerator_=r,this.nodeStack_=[];let o=1;for(;!e.isEmpty();)if(e=e,o=t?i(e.key,t):1,s&&(o*=-1),o<0)this.isReverse_?e=e.left:e=e.right;else if(o===0){this.nodeStack_.push(e);break}else this.nodeStack_.push(e),this.isReverse_?e=e.right:e=e.left}getNext(){if(this.nodeStack_.length===0)return null;let e=this.nodeStack_.pop(),t;if(this.resultGenerator_?t=this.resultGenerator_(e.key,e.value):t={key:e.key,value:e.value},this.isReverse_)for(e=e.left;!e.isEmpty();)this.nodeStack_.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack_.push(e),e=e.left;return t}hasNext(){return this.nodeStack_.length>0}peek(){if(this.nodeStack_.length===0)return null;const e=this.nodeStack_[this.nodeStack_.length-1];return this.resultGenerator_?this.resultGenerator_(e.key,e.value):{key:e.key,value:e.value}}}class x{constructor(e,t,i,s,r){this.key=e,this.value=t,this.color=i??x.RED,this.left=s??Y.EMPTY_NODE,this.right=r??Y.EMPTY_NODE}copy(e,t,i,s,r){return new x(e??this.key,t??this.value,i??this.color,s??this.left,r??this.right)}count(){return this.left.count()+1+this.right.count()}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||!!e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min_(){return this.left.isEmpty()?this:this.left.min_()}minKey(){return this.min_().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,i){let s=this;const r=i(e,s.key);return r<0?s=s.copy(null,null,null,s.left.insert(e,t,i),null):r===0?s=s.copy(null,t,null,null,null):s=s.copy(null,null,null,null,s.right.insert(e,t,i)),s.fixUp_()}removeMin_(){if(this.left.isEmpty())return Y.EMPTY_NODE;let e=this;return!e.left.isRed_()&&!e.left.left.isRed_()&&(e=e.moveRedLeft_()),e=e.copy(null,null,null,e.left.removeMin_(),null),e.fixUp_()}remove(e,t){let i,s;if(i=this,t(e,i.key)<0)!i.left.isEmpty()&&!i.left.isRed_()&&!i.left.left.isRed_()&&(i=i.moveRedLeft_()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed_()&&(i=i.rotateRight_()),!i.right.isEmpty()&&!i.right.isRed_()&&!i.right.left.isRed_()&&(i=i.moveRedRight_()),t(e,i.key)===0){if(i.right.isEmpty())return Y.EMPTY_NODE;s=i.right.min_(),i=i.copy(s.key,s.value,null,null,i.right.removeMin_())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp_()}isRed_(){return this.color}fixUp_(){let e=this;return e.right.isRed_()&&!e.left.isRed_()&&(e=e.rotateLeft_()),e.left.isRed_()&&e.left.left.isRed_()&&(e=e.rotateRight_()),e.left.isRed_()&&e.right.isRed_()&&(e=e.colorFlip_()),e}moveRedLeft_(){let e=this.colorFlip_();return e.right.left.isRed_()&&(e=e.copy(null,null,null,null,e.right.rotateRight_()),e=e.rotateLeft_(),e=e.colorFlip_()),e}moveRedRight_(){let e=this.colorFlip_();return e.left.left.isRed_()&&(e=e.rotateRight_(),e=e.colorFlip_()),e}rotateLeft_(){const e=this.copy(null,null,x.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight_(){const e=this.copy(null,null,x.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip_(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth_(){const e=this.check_();return Math.pow(2,e)<=this.count()+1}check_(){if(this.isRed_()&&this.left.isRed_())throw new Error("Red node has red child("+this.key+","+this.value+")");if(this.right.isRed_())throw new Error("Right child of ("+this.key+","+this.value+") is red");const e=this.left.check_();if(e!==this.right.check_())throw new Error("Black depths differ");return e+(this.isRed_()?0:1)}}x.RED=!0;x.BLACK=!1;class qh{copy(e,t,i,s,r){return this}insert(e,t,i){return new x(e,t,null)}remove(e,t){return this}count(){return 0}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}check_(){return 0}isRed_(){return!1}}class Y{constructor(e,t=Y.EMPTY_NODE){this.comparator_=e,this.root_=t}insert(e,t){return new Y(this.comparator_,this.root_.insert(e,t,this.comparator_).copy(null,null,x.BLACK,null,null))}remove(e){return new Y(this.comparator_,this.root_.remove(e,this.comparator_).copy(null,null,x.BLACK,null,null))}get(e){let t,i=this.root_;for(;!i.isEmpty();){if(t=this.comparator_(e,i.key),t===0)return i.value;t<0?i=i.left:t>0&&(i=i.right)}return null}getPredecessorKey(e){let t,i=this.root_,s=null;for(;!i.isEmpty();)if(t=this.comparator_(e,i.key),t===0){if(i.left.isEmpty())return s?s.key:null;for(i=i.left;!i.right.isEmpty();)i=i.right;return i.key}else t<0?i=i.left:t>0&&(s=i,i=i.right);throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?")}isEmpty(){return this.root_.isEmpty()}count(){return this.root_.count()}minKey(){return this.root_.minKey()}maxKey(){return this.root_.maxKey()}inorderTraversal(e){return this.root_.inorderTraversal(e)}reverseTraversal(e){return this.root_.reverseTraversal(e)}getIterator(e){return new fn(this.root_,null,this.comparator_,!1,e)}getIteratorFrom(e,t){return new fn(this.root_,e,this.comparator_,!1,t)}getReverseIteratorFrom(e,t){return new fn(this.root_,e,this.comparator_,!0,t)}getReverseIterator(e){return new fn(this.root_,null,this.comparator_,!0,e)}}Y.EMPTY_NODE=new qh;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jh(n,e){return rt(n.name,e.name)}function ms(n,e){return rt(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Bi;function Gh(n){Bi=n}const ya=function(n){return typeof n=="number"?"number:"+Qo(n):"string:"+n},wa=function(n){if(n.isLeafNode()){const e=n.val();f(typeof e=="string"||typeof e=="number"||typeof e=="object"&&de(e,".sv"),"Priority must be a string or number.")}else f(n===Bi||n.isEmpty(),"priority of unexpected type.");f(n===Bi||n.getPriority().isEmpty(),"Priority nodes can't have a priority of their own.")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Dr;class M{static set __childrenNodeConstructor(e){Dr=e}static get __childrenNodeConstructor(){return Dr}constructor(e,t=M.__childrenNodeConstructor.EMPTY_NODE){this.value_=e,this.priorityNode_=t,this.lazyHash_=null,f(this.value_!==void 0&&this.value_!==null,"LeafNode shouldn't be created with null/undefined value."),wa(this.priorityNode_)}isLeafNode(){return!0}getPriority(){return this.priorityNode_}updatePriority(e){return new M(this.value_,e)}getImmediateChild(e){return e===".priority"?this.priorityNode_:M.__childrenNodeConstructor.EMPTY_NODE}getChild(e){return v(e)?this:w(e)===".priority"?this.priorityNode_:M.__childrenNodeConstructor.EMPTY_NODE}hasChild(){return!1}getPredecessorChildName(e,t){return null}updateImmediateChild(e,t){return e===".priority"?this.updatePriority(t):t.isEmpty()&&e!==".priority"?this:M.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e,t).updatePriority(this.priorityNode_)}updateChild(e,t){const i=w(e);return i===null?t:t.isEmpty()&&i!==".priority"?this:(f(i!==".priority"||Ue(e)===1,".priority must be the last token in a path"),this.updateImmediateChild(i,M.__childrenNodeConstructor.EMPTY_NODE.updateChild(R(e),t)))}isEmpty(){return!1}numChildren(){return 0}forEachChild(e,t){return!1}val(e){return e&&!this.getPriority().isEmpty()?{".value":this.getValue(),".priority":this.getPriority().val()}:this.getValue()}hash(){if(this.lazyHash_===null){let e="";this.priorityNode_.isEmpty()||(e+="priority:"+ya(this.priorityNode_.val())+":");const t=typeof this.value_;e+=t+":",t==="number"?e+=Qo(this.value_):e+=this.value_,this.lazyHash_=Ko(e)}return this.lazyHash_}getValue(){return this.value_}compareTo(e){return e===M.__childrenNodeConstructor.EMPTY_NODE?1:e instanceof M.__childrenNodeConstructor?-1:(f(e.isLeafNode(),"Unknown node type"),this.compareToLeafNode_(e))}compareToLeafNode_(e){const t=typeof e.value_,i=typeof this.value_,s=M.VALUE_TYPE_ORDER.indexOf(t),r=M.VALUE_TYPE_ORDER.indexOf(i);return f(s>=0,"Unknown leaf type: "+t),f(r>=0,"Unknown leaf type: "+i),s===r?i==="object"?0:this.value_<e.value_?-1:this.value_===e.value_?0:1:r-s}withIndex(){return this}isIndexed(){return!0}equals(e){if(e===this)return!0;if(e.isLeafNode()){const t=e;return this.value_===t.value_&&this.priorityNode_.equals(t.priorityNode_)}else return!1}}M.VALUE_TYPE_ORDER=["object","boolean","number","string"];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ia,va;function zh(n){Ia=n}function Kh(n){va=n}class Yh extends Xn{compare(e,t){const i=e.node.getPriority(),s=t.node.getPriority(),r=i.compareTo(s);return r===0?rt(e.name,t.name):r}isDefinedOn(e){return!e.getPriority().isEmpty()}indexedValueChanged(e,t){return!e.getPriority().equals(t.getPriority())}minPost(){return I.MIN}maxPost(){return new I(Ke,new M("[PRIORITY-POST]",va))}makePost(e,t){const i=Ia(e);return new I(t,new M("[PRIORITY-POST]",i))}toString(){return".priority"}}const P=new Yh;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qh=Math.log(2);class Jh{constructor(e){const t=r=>parseInt(Math.log(r)/Qh,10),i=r=>parseInt(Array(r+1).join("1"),2);this.count=t(e+1),this.current_=this.count-1;const s=i(this.count);this.bits_=e+1&s}nextBitIsOne(){const e=!(this.bits_&1<<this.current_);return this.current_--,e}}const kn=function(n,e,t,i){n.sort(e);const s=function(c,l){const u=l-c;let h,d;if(u===0)return null;if(u===1)return h=n[c],d=t?t(h):h,new x(d,h.node,x.BLACK,null,null);{const p=parseInt(u/2,10)+c,_=s(c,p),y=s(p+1,l);return h=n[p],d=t?t(h):h,new x(d,h.node,x.BLACK,_,y)}},r=function(c){let l=null,u=null,h=n.length;const d=function(_,y){const E=h-_,U=h;h-=_;const G=s(E+1,U),z=n[E],B=t?t(z):z;p(new x(B,z.node,y,null,G))},p=function(_){l?(l.left=_,l=_):(u=_,l=_)};for(let _=0;_<c.count;++_){const y=c.nextBitIsOne(),E=Math.pow(2,c.count-(_+1));y?d(E,x.BLACK):(d(E,x.BLACK),d(E,x.RED))}return u},o=new Jh(n.length),a=r(o);return new Y(i||e,a)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ti;const at={};class _e{static get Default(){return f(at&&P,"ChildrenNode.ts has not been loaded"),Ti=Ti||new _e({".priority":at},{".priority":P}),Ti}constructor(e,t){this.indexes_=e,this.indexSet_=t}get(e){const t=pt(this.indexes_,e);if(!t)throw new Error("No index defined for "+e);return t instanceof Y?t:null}hasIndex(e){return de(this.indexSet_,e.toString())}addIndex(e,t){f(e!==ut,"KeyIndex always exists and isn't meant to be added to the IndexMap.");const i=[];let s=!1;const r=t.getIterator(I.Wrap);let o=r.getNext();for(;o;)s=s||e.isDefinedOn(o.node),i.push(o),o=r.getNext();let a;s?a=kn(i,e.getCompare()):a=at;const c=e.toString(),l={...this.indexSet_};l[c]=e;const u={...this.indexes_};return u[c]=a,new _e(u,l)}addToIndexes(e,t){const i=bn(this.indexes_,(s,r)=>{const o=pt(this.indexSet_,r);if(f(o,"Missing index implementation for "+r),s===at)if(o.isDefinedOn(e.node)){const a=[],c=t.getIterator(I.Wrap);let l=c.getNext();for(;l;)l.name!==e.name&&a.push(l),l=c.getNext();return a.push(e),kn(a,o.getCompare())}else return at;else{const a=t.get(e.name);let c=s;return a&&(c=c.remove(new I(e.name,a))),c.insert(e,e.node)}});return new _e(i,this.indexSet_)}removeFromIndexes(e,t){const i=bn(this.indexes_,s=>{if(s===at)return s;{const r=t.get(e.name);return r?s.remove(new I(e.name,r)):s}});return new _e(i,this.indexSet_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Pt;class m{static get EMPTY_NODE(){return Pt||(Pt=new m(new Y(ms),null,_e.Default))}constructor(e,t,i){this.children_=e,this.priorityNode_=t,this.indexMap_=i,this.lazyHash_=null,this.priorityNode_&&wa(this.priorityNode_),this.children_.isEmpty()&&f(!this.priorityNode_||this.priorityNode_.isEmpty(),"An empty node cannot have a priority")}isLeafNode(){return!1}getPriority(){return this.priorityNode_||Pt}updatePriority(e){return this.children_.isEmpty()?this:new m(this.children_,e,this.indexMap_)}getImmediateChild(e){if(e===".priority")return this.getPriority();{const t=this.children_.get(e);return t===null?Pt:t}}getChild(e){const t=w(e);return t===null?this:this.getImmediateChild(t).getChild(R(e))}hasChild(e){return this.children_.get(e)!==null}updateImmediateChild(e,t){if(f(t,"We should always be passing snapshot nodes"),e===".priority")return this.updatePriority(t);{const i=new I(e,t);let s,r;t.isEmpty()?(s=this.children_.remove(e),r=this.indexMap_.removeFromIndexes(i,this.children_)):(s=this.children_.insert(e,t),r=this.indexMap_.addToIndexes(i,this.children_));const o=s.isEmpty()?Pt:this.priorityNode_;return new m(s,o,r)}}updateChild(e,t){const i=w(e);if(i===null)return t;{f(w(e)!==".priority"||Ue(e)===1,".priority must be the last token in a path");const s=this.getImmediateChild(i).updateChild(R(e),t);return this.updateImmediateChild(i,s)}}isEmpty(){return this.children_.isEmpty()}numChildren(){return this.children_.count()}val(e){if(this.isEmpty())return null;const t={};let i=0,s=0,r=!0;if(this.forEachChild(P,(o,a)=>{t[o]=a.val(e),i++,r&&m.INTEGER_REGEXP_.test(o)?s=Math.max(s,Number(o)):r=!1}),!e&&r&&s<2*i){const o=[];for(const a in t)o[a]=t[a];return o}else return e&&!this.getPriority().isEmpty()&&(t[".priority"]=this.getPriority().val()),t}hash(){if(this.lazyHash_===null){let e="";this.getPriority().isEmpty()||(e+="priority:"+ya(this.getPriority().val())+":"),this.forEachChild(P,(t,i)=>{const s=i.hash();s!==""&&(e+=":"+t+":"+s)}),this.lazyHash_=e===""?"":Ko(e)}return this.lazyHash_}getPredecessorChildName(e,t,i){const s=this.resolveIndex_(i);if(s){const r=s.getPredecessorKey(new I(e,t));return r?r.name:null}else return this.children_.getPredecessorKey(e)}getFirstChildName(e){const t=this.resolveIndex_(e);if(t){const i=t.minKey();return i&&i.name}else return this.children_.minKey()}getFirstChild(e){const t=this.getFirstChildName(e);return t?new I(t,this.children_.get(t)):null}getLastChildName(e){const t=this.resolveIndex_(e);if(t){const i=t.maxKey();return i&&i.name}else return this.children_.maxKey()}getLastChild(e){const t=this.getLastChildName(e);return t?new I(t,this.children_.get(t)):null}forEachChild(e,t){const i=this.resolveIndex_(e);return i?i.inorderTraversal(s=>t(s.name,s.node)):this.children_.inorderTraversal(t)}getIterator(e){return this.getIteratorFrom(e.minPost(),e)}getIteratorFrom(e,t){const i=this.resolveIndex_(t);if(i)return i.getIteratorFrom(e,s=>s);{const s=this.children_.getIteratorFrom(e.name,I.Wrap);let r=s.peek();for(;r!=null&&t.compare(r,e)<0;)s.getNext(),r=s.peek();return s}}getReverseIterator(e){return this.getReverseIteratorFrom(e.maxPost(),e)}getReverseIteratorFrom(e,t){const i=this.resolveIndex_(t);if(i)return i.getReverseIteratorFrom(e,s=>s);{const s=this.children_.getReverseIteratorFrom(e.name,I.Wrap);let r=s.peek();for(;r!=null&&t.compare(r,e)>0;)s.getNext(),r=s.peek();return s}}compareTo(e){return this.isEmpty()?e.isEmpty()?0:-1:e.isLeafNode()||e.isEmpty()?1:e===nn?-1:0}withIndex(e){if(e===ut||this.indexMap_.hasIndex(e))return this;{const t=this.indexMap_.addIndex(e,this.children_);return new m(this.children_,this.priorityNode_,t)}}isIndexed(e){return e===ut||this.indexMap_.hasIndex(e)}equals(e){if(e===this)return!0;if(e.isLeafNode())return!1;{const t=e;if(this.getPriority().equals(t.getPriority()))if(this.children_.count()===t.children_.count()){const i=this.getIterator(P),s=t.getIterator(P);let r=i.getNext(),o=s.getNext();for(;r&&o;){if(r.name!==o.name||!r.node.equals(o.node))return!1;r=i.getNext(),o=s.getNext()}return r===null&&o===null}else return!1;else return!1}}resolveIndex_(e){return e===ut?null:this.indexMap_.get(e.toString())}}m.INTEGER_REGEXP_=/^(0|[1-9]\d*)$/;class Xh extends m{constructor(){super(new Y(ms),m.EMPTY_NODE,_e.Default)}compareTo(e){return e===this?0:1}equals(e){return e===this}getPriority(){return this}getImmediateChild(e){return m.EMPTY_NODE}isEmpty(){return!1}}const nn=new Xh;Object.defineProperties(I,{MIN:{value:new I(_t,m.EMPTY_NODE)},MAX:{value:new I(Ke,nn)}});ma.__EMPTY_NODE=m.EMPTY_NODE;M.__childrenNodeConstructor=m;Gh(nn);Kh(nn);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zh=!0;function D(n,e=null){if(n===null)return m.EMPTY_NODE;if(typeof n=="object"&&".priority"in n&&(e=n[".priority"]),f(e===null||typeof e=="string"||typeof e=="number"||typeof e=="object"&&".sv"in e,"Invalid priority type found: "+typeof e),typeof n=="object"&&".value"in n&&n[".value"]!==null&&(n=n[".value"]),typeof n!="object"||".sv"in n){const t=n;return new M(t,D(e))}if(!(n instanceof Array)&&Zh){const t=[];let i=!1;if(W(n,(o,a)=>{if(o.substring(0,1)!=="."){const c=D(a);c.isEmpty()||(i=i||!c.getPriority().isEmpty(),t.push(new I(o,c)))}}),t.length===0)return m.EMPTY_NODE;const r=kn(t,jh,o=>o.name,ms);if(i){const o=kn(t,P.getCompare());return new m(r,D(e),new _e({".priority":o},{".priority":P}))}else return new m(r,D(e),_e.Default)}else{let t=m.EMPTY_NODE;return W(n,(i,s)=>{if(de(n,i)&&i.substring(0,1)!=="."){const r=D(s);(r.isLeafNode()||!r.isEmpty())&&(t=t.updateImmediateChild(i,r))}}),t.updatePriority(D(e))}}zh(D);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ed extends Xn{constructor(e){super(),this.indexPath_=e,f(!v(e)&&w(e)!==".priority","Can't create PathIndex with empty path or .priority key")}extractChild(e){return e.getChild(this.indexPath_)}isDefinedOn(e){return!e.getChild(this.indexPath_).isEmpty()}compare(e,t){const i=this.extractChild(e.node),s=this.extractChild(t.node),r=i.compareTo(s);return r===0?rt(e.name,t.name):r}makePost(e,t){const i=D(e),s=m.EMPTY_NODE.updateChild(this.indexPath_,i);return new I(t,s)}maxPost(){const e=m.EMPTY_NODE.updateChild(this.indexPath_,nn);return new I(Ke,e)}toString(){return Gt(this.indexPath_,0).join("/")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class td extends Xn{compare(e,t){const i=e.node.compareTo(t.node);return i===0?rt(e.name,t.name):i}isDefinedOn(e){return!0}indexedValueChanged(e,t){return!e.equals(t)}minPost(){return I.MIN}maxPost(){return I.MAX}makePost(e,t){const i=D(e);return new I(t,i)}toString(){return".value"}}const nd=new td;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ea(n){return{type:"value",snapshotNode:n}}function gt(n,e){return{type:"child_added",snapshotNode:e,childName:n}}function zt(n,e){return{type:"child_removed",snapshotNode:e,childName:n}}function Kt(n,e,t){return{type:"child_changed",snapshotNode:e,childName:n,oldSnap:t}}function id(n,e){return{type:"child_moved",snapshotNode:e,childName:n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ys{constructor(e){this.index_=e}updateChild(e,t,i,s,r,o){f(e.isIndexed(this.index_),"A node must be indexed if only a child is updated");const a=e.getImmediateChild(t);return a.getChild(s).equals(i.getChild(s))&&a.isEmpty()===i.isEmpty()||(o!=null&&(i.isEmpty()?e.hasChild(t)?o.trackChildChange(zt(t,a)):f(e.isLeafNode(),"A child remove without an old child only makes sense on a leaf node"):a.isEmpty()?o.trackChildChange(gt(t,i)):o.trackChildChange(Kt(t,i,a))),e.isLeafNode()&&i.isEmpty())?e:e.updateImmediateChild(t,i).withIndex(this.index_)}updateFullNode(e,t,i){return i!=null&&(e.isLeafNode()||e.forEachChild(P,(s,r)=>{t.hasChild(s)||i.trackChildChange(zt(s,r))}),t.isLeafNode()||t.forEachChild(P,(s,r)=>{if(e.hasChild(s)){const o=e.getImmediateChild(s);o.equals(r)||i.trackChildChange(Kt(s,r,o))}else i.trackChildChange(gt(s,r))})),t.withIndex(this.index_)}updatePriority(e,t){return e.isEmpty()?m.EMPTY_NODE:e.updatePriority(t)}filtersNodes(){return!1}getIndexedFilter(){return this}getIndex(){return this.index_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yt{constructor(e){this.indexedFilter_=new ys(e.getIndex()),this.index_=e.getIndex(),this.startPost_=Yt.getStartPost_(e),this.endPost_=Yt.getEndPost_(e),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}getStartPost(){return this.startPost_}getEndPost(){return this.endPost_}matches(e){const t=this.startIsInclusive_?this.index_.compare(this.getStartPost(),e)<=0:this.index_.compare(this.getStartPost(),e)<0,i=this.endIsInclusive_?this.index_.compare(e,this.getEndPost())<=0:this.index_.compare(e,this.getEndPost())<0;return t&&i}updateChild(e,t,i,s,r,o){return this.matches(new I(t,i))||(i=m.EMPTY_NODE),this.indexedFilter_.updateChild(e,t,i,s,r,o)}updateFullNode(e,t,i){t.isLeafNode()&&(t=m.EMPTY_NODE);let s=t.withIndex(this.index_);s=s.updatePriority(m.EMPTY_NODE);const r=this;return t.forEachChild(P,(o,a)=>{r.matches(new I(o,a))||(s=s.updateImmediateChild(o,m.EMPTY_NODE))}),this.indexedFilter_.updateFullNode(e,s,i)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.indexedFilter_}getIndex(){return this.index_}static getStartPost_(e){if(e.hasStart()){const t=e.getIndexStartName();return e.getIndex().makePost(e.getIndexStartValue(),t)}else return e.getIndex().minPost()}static getEndPost_(e){if(e.hasEnd()){const t=e.getIndexEndName();return e.getIndex().makePost(e.getIndexEndValue(),t)}else return e.getIndex().maxPost()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sd{constructor(e){this.withinDirectionalStart=t=>this.reverse_?this.withinEndPost(t):this.withinStartPost(t),this.withinDirectionalEnd=t=>this.reverse_?this.withinStartPost(t):this.withinEndPost(t),this.withinStartPost=t=>{const i=this.index_.compare(this.rangedFilter_.getStartPost(),t);return this.startIsInclusive_?i<=0:i<0},this.withinEndPost=t=>{const i=this.index_.compare(t,this.rangedFilter_.getEndPost());return this.endIsInclusive_?i<=0:i<0},this.rangedFilter_=new Yt(e),this.index_=e.getIndex(),this.limit_=e.getLimit(),this.reverse_=!e.isViewFromLeft(),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}updateChild(e,t,i,s,r,o){return this.rangedFilter_.matches(new I(t,i))||(i=m.EMPTY_NODE),e.getImmediateChild(t).equals(i)?e:e.numChildren()<this.limit_?this.rangedFilter_.getIndexedFilter().updateChild(e,t,i,s,r,o):this.fullLimitUpdateChild_(e,t,i,r,o)}updateFullNode(e,t,i){let s;if(t.isLeafNode()||t.isEmpty())s=m.EMPTY_NODE.withIndex(this.index_);else if(this.limit_*2<t.numChildren()&&t.isIndexed(this.index_)){s=m.EMPTY_NODE.withIndex(this.index_);let r;this.reverse_?r=t.getReverseIteratorFrom(this.rangedFilter_.getEndPost(),this.index_):r=t.getIteratorFrom(this.rangedFilter_.getStartPost(),this.index_);let o=0;for(;r.hasNext()&&o<this.limit_;){const a=r.getNext();if(this.withinDirectionalStart(a))if(this.withinDirectionalEnd(a))s=s.updateImmediateChild(a.name,a.node),o++;else break;else continue}}else{s=t.withIndex(this.index_),s=s.updatePriority(m.EMPTY_NODE);let r;this.reverse_?r=s.getReverseIterator(this.index_):r=s.getIterator(this.index_);let o=0;for(;r.hasNext();){const a=r.getNext();o<this.limit_&&this.withinDirectionalStart(a)&&this.withinDirectionalEnd(a)?o++:s=s.updateImmediateChild(a.name,m.EMPTY_NODE)}}return this.rangedFilter_.getIndexedFilter().updateFullNode(e,s,i)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.rangedFilter_.getIndexedFilter()}getIndex(){return this.index_}fullLimitUpdateChild_(e,t,i,s,r){let o;if(this.reverse_){const h=this.index_.getCompare();o=(d,p)=>h(p,d)}else o=this.index_.getCompare();const a=e;f(a.numChildren()===this.limit_,"");const c=new I(t,i),l=this.reverse_?a.getFirstChild(this.index_):a.getLastChild(this.index_),u=this.rangedFilter_.matches(c);if(a.hasChild(t)){const h=a.getImmediateChild(t);let d=s.getChildAfterChild(this.index_,l,this.reverse_);for(;d!=null&&(d.name===t||a.hasChild(d.name));)d=s.getChildAfterChild(this.index_,d,this.reverse_);const p=d==null?1:o(d,c);if(u&&!i.isEmpty()&&p>=0)return r?.trackChildChange(Kt(t,i,h)),a.updateImmediateChild(t,i);{r?.trackChildChange(zt(t,h));const y=a.updateImmediateChild(t,m.EMPTY_NODE);return d!=null&&this.rangedFilter_.matches(d)?(r?.trackChildChange(gt(d.name,d.node)),y.updateImmediateChild(d.name,d.node)):y}}else return i.isEmpty()?e:u&&o(l,c)>=0?(r!=null&&(r.trackChildChange(zt(l.name,l.node)),r.trackChildChange(gt(t,i))),a.updateImmediateChild(t,i).updateImmediateChild(l.name,m.EMPTY_NODE)):e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ws{constructor(){this.limitSet_=!1,this.startSet_=!1,this.startNameSet_=!1,this.startAfterSet_=!1,this.endSet_=!1,this.endNameSet_=!1,this.endBeforeSet_=!1,this.limit_=0,this.viewFrom_="",this.indexStartValue_=null,this.indexStartName_="",this.indexEndValue_=null,this.indexEndName_="",this.index_=P}hasStart(){return this.startSet_}isViewFromLeft(){return this.viewFrom_===""?this.startSet_:this.viewFrom_==="l"}getIndexStartValue(){return f(this.startSet_,"Only valid if start has been set"),this.indexStartValue_}getIndexStartName(){return f(this.startSet_,"Only valid if start has been set"),this.startNameSet_?this.indexStartName_:_t}hasEnd(){return this.endSet_}getIndexEndValue(){return f(this.endSet_,"Only valid if end has been set"),this.indexEndValue_}getIndexEndName(){return f(this.endSet_,"Only valid if end has been set"),this.endNameSet_?this.indexEndName_:Ke}hasLimit(){return this.limitSet_}hasAnchoredLimit(){return this.limitSet_&&this.viewFrom_!==""}getLimit(){return f(this.limitSet_,"Only valid if limit has been set"),this.limit_}getIndex(){return this.index_}loadsAllData(){return!(this.startSet_||this.endSet_||this.limitSet_)}isDefault(){return this.loadsAllData()&&this.index_===P}copy(){const e=new ws;return e.limitSet_=this.limitSet_,e.limit_=this.limit_,e.startSet_=this.startSet_,e.startAfterSet_=this.startAfterSet_,e.indexStartValue_=this.indexStartValue_,e.startNameSet_=this.startNameSet_,e.indexStartName_=this.indexStartName_,e.endSet_=this.endSet_,e.endBeforeSet_=this.endBeforeSet_,e.indexEndValue_=this.indexEndValue_,e.endNameSet_=this.endNameSet_,e.indexEndName_=this.indexEndName_,e.index_=this.index_,e.viewFrom_=this.viewFrom_,e}}function rd(n){return n.loadsAllData()?new ys(n.getIndex()):n.hasLimit()?new sd(n):new Yt(n)}function Lr(n){const e={};if(n.isDefault())return e;let t;if(n.index_===P?t="$priority":n.index_===nd?t="$value":n.index_===ut?t="$key":(f(n.index_ instanceof ed,"Unrecognized index type!"),t=n.index_.toString()),e.orderBy=L(t),n.startSet_){const i=n.startAfterSet_?"startAfter":"startAt";e[i]=L(n.indexStartValue_),n.startNameSet_&&(e[i]+=","+L(n.indexStartName_))}if(n.endSet_){const i=n.endBeforeSet_?"endBefore":"endAt";e[i]=L(n.indexEndValue_),n.endNameSet_&&(e[i]+=","+L(n.indexEndName_))}return n.limitSet_&&(n.isViewFromLeft()?e.limitToFirst=n.limit_:e.limitToLast=n.limit_),e}function Mr(n){const e={};if(n.startSet_&&(e.sp=n.indexStartValue_,n.startNameSet_&&(e.sn=n.indexStartName_),e.sin=!n.startAfterSet_),n.endSet_&&(e.ep=n.indexEndValue_,n.endNameSet_&&(e.en=n.indexEndName_),e.ein=!n.endBeforeSet_),n.limitSet_){e.l=n.limit_;let t=n.viewFrom_;t===""&&(n.isViewFromLeft()?t="l":t="r"),e.vf=t}return n.index_!==P&&(e.i=n.index_.toString()),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class An extends fa{reportStats(e){throw new Error("Method not implemented.")}static getListenId_(e,t){return t!==void 0?"tag$"+t:(f(e._queryParams.isDefault(),"should have a tag if it's not a default query."),e._path.toString())}constructor(e,t,i,s){super(),this.repoInfo_=e,this.onDataUpdate_=t,this.authTokenProvider_=i,this.appCheckTokenProvider_=s,this.log_=tn("p:rest:"),this.listens_={}}listen(e,t,i,s){const r=e._path.toString();this.log_("Listen called for "+r+" "+e._queryIdentifier);const o=An.getListenId_(e,i),a={};this.listens_[o]=a;const c=Lr(e._queryParams);this.restRequest_(r+".json",c,(l,u)=>{let h=u;if(l===404&&(h=null,l=null),l===null&&this.onDataUpdate_(r,h,!1,i),pt(this.listens_,o)===a){let d;l?l===401?d="permission_denied":d="rest_error:"+l:d="ok",s(d,null)}})}unlisten(e,t){const i=An.getListenId_(e,t);delete this.listens_[i]}get(e){const t=Lr(e._queryParams),i=e._path.toString(),s=new Et;return this.restRequest_(i+".json",t,(r,o)=>{let a=o;r===404&&(a=null,r=null),r===null?(this.onDataUpdate_(i,a,!1,null),s.resolve(a)):s.reject(new Error(a))}),s.promise}refreshAuthToken(e){}restRequest_(e,t={},i){return t.format="export",Promise.all([this.authTokenProvider_.getToken(!1),this.appCheckTokenProvider_.getToken(!1)]).then(([s,r])=>{s&&s.accessToken&&(t.auth=s.accessToken),r&&r.token&&(t.ac=r.token);const o=(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host+e+"?ns="+this.repoInfo_.namespace+Tt(t);this.log_("Sending REST request for "+o);const a=new XMLHttpRequest;a.onreadystatechange=()=>{if(i&&a.readyState===4){this.log_("REST Response for "+o+" received. status:",a.status,"response:",a.responseText);let c=null;if(a.status>=200&&a.status<300){try{c=$t(a.responseText)}catch{V("Failed to parse JSON response for "+o+": "+a.responseText)}i(null,c)}else a.status!==401&&a.status!==404&&V("Got unsuccessful REST response for "+o+" Status: "+a.status),i(a.status);i=null}},a.open("GET",o,!0),a.send()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class od{constructor(){this.rootNode_=m.EMPTY_NODE}getNode(e){return this.rootNode_.getChild(e)}updateSnapshot(e,t){this.rootNode_=this.rootNode_.updateChild(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pn(){return{value:null,children:new Map}}function Ta(n,e,t){if(v(e))n.value=t,n.children.clear();else if(n.value!==null)n.value=n.value.updateChild(e,t);else{const i=w(e);n.children.has(i)||n.children.set(i,Pn());const s=n.children.get(i);e=R(e),Ta(s,e,t)}}function Hi(n,e,t){n.value!==null?t(e,n.value):ad(n,(i,s)=>{const r=new b(e.toString()+"/"+i);Hi(s,r,t)})}function ad(n,e){n.children.forEach((t,i)=>{e(i,t)})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cd{constructor(e){this.collection_=e,this.last_=null}get(){const e=this.collection_.get(),t={...e};return this.last_&&W(this.last_,(i,s)=>{t[i]=t[i]-s}),this.last_=e,t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xr=10*1e3,ld=30*1e3,ud=300*1e3;class hd{constructor(e,t){this.server_=t,this.statsToReport_={},this.statsListener_=new cd(e);const i=xr+(ld-xr)*Math.random();xt(this.reportStats_.bind(this),Math.floor(i))}reportStats_(){const e=this.statsListener_.get(),t={};let i=!1;W(e,(s,r)=>{r>0&&de(this.statsToReport_,s)&&(t[s]=r,i=!0)}),i&&this.server_.reportStats(t),xt(this.reportStats_.bind(this),Math.floor(Math.random()*2*ud))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var se;(function(n){n[n.OVERWRITE=0]="OVERWRITE",n[n.MERGE=1]="MERGE",n[n.ACK_USER_WRITE=2]="ACK_USER_WRITE",n[n.LISTEN_COMPLETE=3]="LISTEN_COMPLETE"})(se||(se={}));function Is(){return{fromUser:!0,fromServer:!1,queryId:null,tagged:!1}}function vs(){return{fromUser:!1,fromServer:!0,queryId:null,tagged:!1}}function Es(n){return{fromUser:!1,fromServer:!0,queryId:n,tagged:!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nn{constructor(e,t,i){this.path=e,this.affectedTree=t,this.revert=i,this.type=se.ACK_USER_WRITE,this.source=Is()}operationForChild(e){if(v(this.path)){if(this.affectedTree.value!=null)return f(this.affectedTree.children.isEmpty(),"affectedTree should not have overlapping affected paths."),this;{const t=this.affectedTree.subtree(new b(e));return new Nn(T(),t,this.revert)}}else return f(w(this.path)===e,"operationForChild called for unrelated child."),new Nn(R(this.path),this.affectedTree,this.revert)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qt{constructor(e,t){this.source=e,this.path=t,this.type=se.LISTEN_COMPLETE}operationForChild(e){return v(this.path)?new Qt(this.source,T()):new Qt(this.source,R(this.path))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ye{constructor(e,t,i){this.source=e,this.path=t,this.snap=i,this.type=se.OVERWRITE}operationForChild(e){return v(this.path)?new Ye(this.source,T(),this.snap.getImmediateChild(e)):new Ye(this.source,R(this.path),this.snap)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mt{constructor(e,t,i){this.source=e,this.path=t,this.children=i,this.type=se.MERGE}operationForChild(e){if(v(this.path)){const t=this.children.subtree(new b(e));return t.isEmpty()?null:t.value?new Ye(this.source,T(),t.value):new mt(this.source,T(),t)}else return f(w(this.path)===e,"Can't get a merge for a child not on the path of the operation"),new mt(this.source,R(this.path),this.children)}toString(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fe{constructor(e,t,i){this.node_=e,this.fullyInitialized_=t,this.filtered_=i}isFullyInitialized(){return this.fullyInitialized_}isFiltered(){return this.filtered_}isCompleteForPath(e){if(v(e))return this.isFullyInitialized()&&!this.filtered_;const t=w(e);return this.isCompleteForChild(t)}isCompleteForChild(e){return this.isFullyInitialized()&&!this.filtered_||this.node_.hasChild(e)}getNode(){return this.node_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dd{constructor(e){this.query_=e,this.index_=this.query_._queryParams.getIndex()}}function fd(n,e,t,i){const s=[],r=[];return e.forEach(o=>{o.type==="child_changed"&&n.index_.indexedValueChanged(o.oldSnap,o.snapshotNode)&&r.push(id(o.childName,o.snapshotNode))}),Nt(n,s,"child_removed",e,i,t),Nt(n,s,"child_added",e,i,t),Nt(n,s,"child_moved",r,i,t),Nt(n,s,"child_changed",e,i,t),Nt(n,s,"value",e,i,t),s}function Nt(n,e,t,i,s,r){const o=i.filter(a=>a.type===t);o.sort((a,c)=>_d(n,a,c)),o.forEach(a=>{const c=pd(n,a,r);s.forEach(l=>{l.respondsTo(a.type)&&e.push(l.createEvent(c,n.query_))})})}function pd(n,e,t){return e.type==="value"||e.type==="child_removed"||(e.prevName=t.getPredecessorChildName(e.childName,e.snapshotNode,n.index_)),e}function _d(n,e,t){if(e.childName==null||t.childName==null)throw vt("Should only compare child_ events.");const i=new I(e.childName,e.snapshotNode),s=new I(t.childName,t.snapshotNode);return n.index_.compare(i,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zn(n,e){return{eventCache:n,serverCache:e}}function Ut(n,e,t,i){return Zn(new Fe(e,t,i),n.serverCache)}function Ca(n,e,t,i){return Zn(n.eventCache,new Fe(e,t,i))}function On(n){return n.eventCache.isFullyInitialized()?n.eventCache.getNode():null}function Qe(n){return n.serverCache.isFullyInitialized()?n.serverCache.getNode():null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ci;const gd=()=>(Ci||(Ci=new Y(eh)),Ci);class S{static fromObject(e){let t=new S(null);return W(e,(i,s)=>{t=t.set(new b(i),s)}),t}constructor(e,t=gd()){this.value=e,this.children=t}isEmpty(){return this.value===null&&this.children.isEmpty()}findRootMostMatchingPathAndValue(e,t){if(this.value!=null&&t(this.value))return{path:T(),value:this.value};if(v(e))return null;{const i=w(e),s=this.children.get(i);if(s!==null){const r=s.findRootMostMatchingPathAndValue(R(e),t);return r!=null?{path:A(new b(i),r.path),value:r.value}:null}else return null}}findRootMostValueAndPath(e){return this.findRootMostMatchingPathAndValue(e,()=>!0)}subtree(e){if(v(e))return this;{const t=w(e),i=this.children.get(t);return i!==null?i.subtree(R(e)):new S(null)}}set(e,t){if(v(e))return new S(t,this.children);{const i=w(e),r=(this.children.get(i)||new S(null)).set(R(e),t),o=this.children.insert(i,r);return new S(this.value,o)}}remove(e){if(v(e))return this.children.isEmpty()?new S(null):new S(null,this.children);{const t=w(e),i=this.children.get(t);if(i){const s=i.remove(R(e));let r;return s.isEmpty()?r=this.children.remove(t):r=this.children.insert(t,s),this.value===null&&r.isEmpty()?new S(null):new S(this.value,r)}else return this}}get(e){if(v(e))return this.value;{const t=w(e),i=this.children.get(t);return i?i.get(R(e)):null}}setTree(e,t){if(v(e))return t;{const i=w(e),r=(this.children.get(i)||new S(null)).setTree(R(e),t);let o;return r.isEmpty()?o=this.children.remove(i):o=this.children.insert(i,r),new S(this.value,o)}}fold(e){return this.fold_(T(),e)}fold_(e,t){const i={};return this.children.inorderTraversal((s,r)=>{i[s]=r.fold_(A(e,s),t)}),t(e,this.value,i)}findOnPath(e,t){return this.findOnPath_(e,T(),t)}findOnPath_(e,t,i){const s=this.value?i(t,this.value):!1;if(s)return s;if(v(e))return null;{const r=w(e),o=this.children.get(r);return o?o.findOnPath_(R(e),A(t,r),i):null}}foreachOnPath(e,t){return this.foreachOnPath_(e,T(),t)}foreachOnPath_(e,t,i){if(v(e))return this;{this.value&&i(t,this.value);const s=w(e),r=this.children.get(s);return r?r.foreachOnPath_(R(e),A(t,s),i):new S(null)}}foreach(e){this.foreach_(T(),e)}foreach_(e,t){this.children.inorderTraversal((i,s)=>{s.foreach_(A(e,i),t)}),this.value&&t(e,this.value)}foreachChild(e){this.children.inorderTraversal((t,i)=>{i.value&&e(t,i.value)})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oe{constructor(e){this.writeTree_=e}static empty(){return new oe(new S(null))}}function Ft(n,e,t){if(v(e))return new oe(new S(t));{const i=n.writeTree_.findRootMostValueAndPath(e);if(i!=null){const s=i.path;let r=i.value;const o=$(s,e);return r=r.updateChild(o,t),new oe(n.writeTree_.set(s,r))}else{const s=new S(t),r=n.writeTree_.setTree(e,s);return new oe(r)}}}function $i(n,e,t){let i=n;return W(t,(s,r)=>{i=Ft(i,A(e,s),r)}),i}function Ur(n,e){if(v(e))return oe.empty();{const t=n.writeTree_.setTree(e,new S(null));return new oe(t)}}function Vi(n,e){return ot(n,e)!=null}function ot(n,e){const t=n.writeTree_.findRootMostValueAndPath(e);return t!=null?n.writeTree_.get(t.path).getChild($(t.path,e)):null}function Fr(n){const e=[],t=n.writeTree_.value;return t!=null?t.isLeafNode()||t.forEachChild(P,(i,s)=>{e.push(new I(i,s))}):n.writeTree_.children.inorderTraversal((i,s)=>{s.value!=null&&e.push(new I(i,s.value))}),e}function Le(n,e){if(v(e))return n;{const t=ot(n,e);return t!=null?new oe(new S(t)):new oe(n.writeTree_.subtree(e))}}function qi(n){return n.writeTree_.isEmpty()}function yt(n,e){return ba(T(),n.writeTree_,e)}function ba(n,e,t){if(e.value!=null)return t.updateChild(n,e.value);{let i=null;return e.children.inorderTraversal((s,r)=>{s===".priority"?(f(r.value!==null,"Priority writes must always be leaf nodes"),i=r.value):t=ba(A(n,s),r,t)}),!t.getChild(n).isEmpty()&&i!==null&&(t=t.updateChild(A(n,".priority"),i)),t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ei(n,e){return Aa(e,n)}function md(n,e,t,i,s){f(i>n.lastWriteId,"Stacking an older write on top of newer ones"),s===void 0&&(s=!0),n.allWrites.push({path:e,snap:t,writeId:i,visible:s}),s&&(n.visibleWrites=Ft(n.visibleWrites,e,t)),n.lastWriteId=i}function yd(n,e,t,i){f(i>n.lastWriteId,"Stacking an older merge on top of newer ones"),n.allWrites.push({path:e,children:t,writeId:i,visible:!0}),n.visibleWrites=$i(n.visibleWrites,e,t),n.lastWriteId=i}function wd(n,e){for(let t=0;t<n.allWrites.length;t++){const i=n.allWrites[t];if(i.writeId===e)return i}return null}function Id(n,e){const t=n.allWrites.findIndex(a=>a.writeId===e);f(t>=0,"removeWrite called with nonexistent writeId.");const i=n.allWrites[t];n.allWrites.splice(t,1);let s=i.visible,r=!1,o=n.allWrites.length-1;for(;s&&o>=0;){const a=n.allWrites[o];a.visible&&(o>=t&&vd(a,i.path)?s=!1:Z(i.path,a.path)&&(r=!0)),o--}if(s){if(r)return Ed(n),!0;if(i.snap)n.visibleWrites=Ur(n.visibleWrites,i.path);else{const a=i.children;W(a,c=>{n.visibleWrites=Ur(n.visibleWrites,A(i.path,c))})}return!0}else return!1}function vd(n,e){if(n.snap)return Z(n.path,e);for(const t in n.children)if(n.children.hasOwnProperty(t)&&Z(A(n.path,t),e))return!0;return!1}function Ed(n){n.visibleWrites=Sa(n.allWrites,Td,T()),n.allWrites.length>0?n.lastWriteId=n.allWrites[n.allWrites.length-1].writeId:n.lastWriteId=-1}function Td(n){return n.visible}function Sa(n,e,t){let i=oe.empty();for(let s=0;s<n.length;++s){const r=n[s];if(e(r)){const o=r.path;let a;if(r.snap)Z(t,o)?(a=$(t,o),i=Ft(i,a,r.snap)):Z(o,t)&&(a=$(o,t),i=Ft(i,T(),r.snap.getChild(a)));else if(r.children){if(Z(t,o))a=$(t,o),i=$i(i,a,r.children);else if(Z(o,t))if(a=$(o,t),v(a))i=$i(i,T(),r.children);else{const c=pt(r.children,w(a));if(c){const l=c.getChild(R(a));i=Ft(i,T(),l)}}}else throw vt("WriteRecord should have .snap or .children")}}return i}function Ra(n,e,t,i,s){if(!i&&!s){const r=ot(n.visibleWrites,e);if(r!=null)return r;{const o=Le(n.visibleWrites,e);if(qi(o))return t;if(t==null&&!Vi(o,T()))return null;{const a=t||m.EMPTY_NODE;return yt(o,a)}}}else{const r=Le(n.visibleWrites,e);if(!s&&qi(r))return t;if(!s&&t==null&&!Vi(r,T()))return null;{const o=function(l){return(l.visible||s)&&(!i||!~i.indexOf(l.writeId))&&(Z(l.path,e)||Z(e,l.path))},a=Sa(n.allWrites,o,e),c=t||m.EMPTY_NODE;return yt(a,c)}}}function Cd(n,e,t){let i=m.EMPTY_NODE;const s=ot(n.visibleWrites,e);if(s)return s.isLeafNode()||s.forEachChild(P,(r,o)=>{i=i.updateImmediateChild(r,o)}),i;if(t){const r=Le(n.visibleWrites,e);return t.forEachChild(P,(o,a)=>{const c=yt(Le(r,new b(o)),a);i=i.updateImmediateChild(o,c)}),Fr(r).forEach(o=>{i=i.updateImmediateChild(o.name,o.node)}),i}else{const r=Le(n.visibleWrites,e);return Fr(r).forEach(o=>{i=i.updateImmediateChild(o.name,o.node)}),i}}function bd(n,e,t,i,s){f(i||s,"Either existingEventSnap or existingServerSnap must exist");const r=A(e,t);if(Vi(n.visibleWrites,r))return null;{const o=Le(n.visibleWrites,r);return qi(o)?s.getChild(t):yt(o,s.getChild(t))}}function Sd(n,e,t,i){const s=A(e,t),r=ot(n.visibleWrites,s);if(r!=null)return r;if(i.isCompleteForChild(t)){const o=Le(n.visibleWrites,s);return yt(o,i.getNode().getImmediateChild(t))}else return null}function Rd(n,e){return ot(n.visibleWrites,e)}function kd(n,e,t,i,s,r,o){let a;const c=Le(n.visibleWrites,e),l=ot(c,T());if(l!=null)a=l;else if(t!=null)a=yt(c,t);else return[];if(a=a.withIndex(o),!a.isEmpty()&&!a.isLeafNode()){const u=[],h=o.getCompare(),d=r?a.getReverseIteratorFrom(i,o):a.getIteratorFrom(i,o);let p=d.getNext();for(;p&&u.length<s;)h(p,i)!==0&&u.push(p),p=d.getNext();return u}else return[]}function Ad(){return{visibleWrites:oe.empty(),allWrites:[],lastWriteId:-1}}function Dn(n,e,t,i){return Ra(n.writeTree,n.treePath,e,t,i)}function Ts(n,e){return Cd(n.writeTree,n.treePath,e)}function Wr(n,e,t,i){return bd(n.writeTree,n.treePath,e,t,i)}function Ln(n,e){return Rd(n.writeTree,A(n.treePath,e))}function Pd(n,e,t,i,s,r){return kd(n.writeTree,n.treePath,e,t,i,s,r)}function Cs(n,e,t){return Sd(n.writeTree,n.treePath,e,t)}function ka(n,e){return Aa(A(n.treePath,e),n.writeTree)}function Aa(n,e){return{treePath:n,writeTree:e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nd{constructor(){this.changeMap=new Map}trackChildChange(e){const t=e.type,i=e.childName;f(t==="child_added"||t==="child_changed"||t==="child_removed","Only child changes supported for tracking"),f(i!==".priority","Only non-priority child changes can be tracked.");const s=this.changeMap.get(i);if(s){const r=s.type;if(t==="child_added"&&r==="child_removed")this.changeMap.set(i,Kt(i,e.snapshotNode,s.snapshotNode));else if(t==="child_removed"&&r==="child_added")this.changeMap.delete(i);else if(t==="child_removed"&&r==="child_changed")this.changeMap.set(i,zt(i,s.oldSnap));else if(t==="child_changed"&&r==="child_added")this.changeMap.set(i,gt(i,e.snapshotNode));else if(t==="child_changed"&&r==="child_changed")this.changeMap.set(i,Kt(i,e.snapshotNode,s.oldSnap));else throw vt("Illegal combination of changes: "+e+" occurred after "+s)}else this.changeMap.set(i,e)}getChanges(){return Array.from(this.changeMap.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Od{getCompleteChild(e){return null}getChildAfterChild(e,t,i){return null}}const Pa=new Od;class bs{constructor(e,t,i=null){this.writes_=e,this.viewCache_=t,this.optCompleteServerCache_=i}getCompleteChild(e){const t=this.viewCache_.eventCache;if(t.isCompleteForChild(e))return t.getNode().getImmediateChild(e);{const i=this.optCompleteServerCache_!=null?new Fe(this.optCompleteServerCache_,!0,!1):this.viewCache_.serverCache;return Cs(this.writes_,e,i)}}getChildAfterChild(e,t,i){const s=this.optCompleteServerCache_!=null?this.optCompleteServerCache_:Qe(this.viewCache_),r=Pd(this.writes_,s,t,1,i,e);return r.length===0?null:r[0]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dd(n){return{filter:n}}function Ld(n,e){f(e.eventCache.getNode().isIndexed(n.filter.getIndex()),"Event snap not indexed"),f(e.serverCache.getNode().isIndexed(n.filter.getIndex()),"Server snap not indexed")}function Md(n,e,t,i,s){const r=new Nd;let o,a;if(t.type===se.OVERWRITE){const l=t;l.source.fromUser?o=ji(n,e,l.path,l.snap,i,s,r):(f(l.source.fromServer,"Unknown source."),a=l.source.tagged||e.serverCache.isFiltered()&&!v(l.path),o=Mn(n,e,l.path,l.snap,i,s,a,r))}else if(t.type===se.MERGE){const l=t;l.source.fromUser?o=Ud(n,e,l.path,l.children,i,s,r):(f(l.source.fromServer,"Unknown source."),a=l.source.tagged||e.serverCache.isFiltered(),o=Gi(n,e,l.path,l.children,i,s,a,r))}else if(t.type===se.ACK_USER_WRITE){const l=t;l.revert?o=Bd(n,e,l.path,i,s,r):o=Fd(n,e,l.path,l.affectedTree,i,s,r)}else if(t.type===se.LISTEN_COMPLETE)o=Wd(n,e,t.path,i,r);else throw vt("Unknown operation type: "+t.type);const c=r.getChanges();return xd(e,o,c),{viewCache:o,changes:c}}function xd(n,e,t){const i=e.eventCache;if(i.isFullyInitialized()){const s=i.getNode().isLeafNode()||i.getNode().isEmpty(),r=On(n);(t.length>0||!n.eventCache.isFullyInitialized()||s&&!i.getNode().equals(r)||!i.getNode().getPriority().equals(r.getPriority()))&&t.push(Ea(On(e)))}}function Na(n,e,t,i,s,r){const o=e.eventCache;if(Ln(i,t)!=null)return e;{let a,c;if(v(t))if(f(e.serverCache.isFullyInitialized(),"If change path is empty, we must have complete server data"),e.serverCache.isFiltered()){const l=Qe(e),u=l instanceof m?l:m.EMPTY_NODE,h=Ts(i,u);a=n.filter.updateFullNode(e.eventCache.getNode(),h,r)}else{const l=Dn(i,Qe(e));a=n.filter.updateFullNode(e.eventCache.getNode(),l,r)}else{const l=w(t);if(l===".priority"){f(Ue(t)===1,"Can't have a priority with additional path components");const u=o.getNode();c=e.serverCache.getNode();const h=Wr(i,t,u,c);h!=null?a=n.filter.updatePriority(u,h):a=o.getNode()}else{const u=R(t);let h;if(o.isCompleteForChild(l)){c=e.serverCache.getNode();const d=Wr(i,t,o.getNode(),c);d!=null?h=o.getNode().getImmediateChild(l).updateChild(u,d):h=o.getNode().getImmediateChild(l)}else h=Cs(i,l,e.serverCache);h!=null?a=n.filter.updateChild(o.getNode(),l,h,u,s,r):a=o.getNode()}}return Ut(e,a,o.isFullyInitialized()||v(t),n.filter.filtersNodes())}}function Mn(n,e,t,i,s,r,o,a){const c=e.serverCache;let l;const u=o?n.filter:n.filter.getIndexedFilter();if(v(t))l=u.updateFullNode(c.getNode(),i,null);else if(u.filtersNodes()&&!c.isFiltered()){const p=c.getNode().updateChild(t,i);l=u.updateFullNode(c.getNode(),p,null)}else{const p=w(t);if(!c.isCompleteForPath(t)&&Ue(t)>1)return e;const _=R(t),E=c.getNode().getImmediateChild(p).updateChild(_,i);p===".priority"?l=u.updatePriority(c.getNode(),E):l=u.updateChild(c.getNode(),p,E,_,Pa,null)}const h=Ca(e,l,c.isFullyInitialized()||v(t),u.filtersNodes()),d=new bs(s,h,r);return Na(n,h,t,s,d,a)}function ji(n,e,t,i,s,r,o){const a=e.eventCache;let c,l;const u=new bs(s,e,r);if(v(t))l=n.filter.updateFullNode(e.eventCache.getNode(),i,o),c=Ut(e,l,!0,n.filter.filtersNodes());else{const h=w(t);if(h===".priority")l=n.filter.updatePriority(e.eventCache.getNode(),i),c=Ut(e,l,a.isFullyInitialized(),a.isFiltered());else{const d=R(t),p=a.getNode().getImmediateChild(h);let _;if(v(d))_=i;else{const y=u.getCompleteChild(h);y!=null?ps(d)===".priority"&&y.getChild(_a(d)).isEmpty()?_=y:_=y.updateChild(d,i):_=m.EMPTY_NODE}if(p.equals(_))c=e;else{const y=n.filter.updateChild(a.getNode(),h,_,d,u,o);c=Ut(e,y,a.isFullyInitialized(),n.filter.filtersNodes())}}}return c}function Br(n,e){return n.eventCache.isCompleteForChild(e)}function Ud(n,e,t,i,s,r,o){let a=e;return i.foreach((c,l)=>{const u=A(t,c);Br(e,w(u))&&(a=ji(n,a,u,l,s,r,o))}),i.foreach((c,l)=>{const u=A(t,c);Br(e,w(u))||(a=ji(n,a,u,l,s,r,o))}),a}function Hr(n,e,t){return t.foreach((i,s)=>{e=e.updateChild(i,s)}),e}function Gi(n,e,t,i,s,r,o,a){if(e.serverCache.getNode().isEmpty()&&!e.serverCache.isFullyInitialized())return e;let c=e,l;v(t)?l=i:l=new S(null).setTree(t,i);const u=e.serverCache.getNode();return l.children.inorderTraversal((h,d)=>{if(u.hasChild(h)){const p=e.serverCache.getNode().getImmediateChild(h),_=Hr(n,p,d);c=Mn(n,c,new b(h),_,s,r,o,a)}}),l.children.inorderTraversal((h,d)=>{const p=!e.serverCache.isCompleteForChild(h)&&d.value===null;if(!u.hasChild(h)&&!p){const _=e.serverCache.getNode().getImmediateChild(h),y=Hr(n,_,d);c=Mn(n,c,new b(h),y,s,r,o,a)}}),c}function Fd(n,e,t,i,s,r,o){if(Ln(s,t)!=null)return e;const a=e.serverCache.isFiltered(),c=e.serverCache;if(i.value!=null){if(v(t)&&c.isFullyInitialized()||c.isCompleteForPath(t))return Mn(n,e,t,c.getNode().getChild(t),s,r,a,o);if(v(t)){let l=new S(null);return c.getNode().forEachChild(ut,(u,h)=>{l=l.set(new b(u),h)}),Gi(n,e,t,l,s,r,a,o)}else return e}else{let l=new S(null);return i.foreach((u,h)=>{const d=A(t,u);c.isCompleteForPath(d)&&(l=l.set(u,c.getNode().getChild(d)))}),Gi(n,e,t,l,s,r,a,o)}}function Wd(n,e,t,i,s){const r=e.serverCache,o=Ca(e,r.getNode(),r.isFullyInitialized()||v(t),r.isFiltered());return Na(n,o,t,i,Pa,s)}function Bd(n,e,t,i,s,r){let o;if(Ln(i,t)!=null)return e;{const a=new bs(i,e,s),c=e.eventCache.getNode();let l;if(v(t)||w(t)===".priority"){let u;if(e.serverCache.isFullyInitialized())u=Dn(i,Qe(e));else{const h=e.serverCache.getNode();f(h instanceof m,"serverChildren would be complete if leaf node"),u=Ts(i,h)}u=u,l=n.filter.updateFullNode(c,u,r)}else{const u=w(t);let h=Cs(i,u,e.serverCache);h==null&&e.serverCache.isCompleteForChild(u)&&(h=c.getImmediateChild(u)),h!=null?l=n.filter.updateChild(c,u,h,R(t),a,r):e.eventCache.getNode().hasChild(u)?l=n.filter.updateChild(c,u,m.EMPTY_NODE,R(t),a,r):l=c,l.isEmpty()&&e.serverCache.isFullyInitialized()&&(o=Dn(i,Qe(e)),o.isLeafNode()&&(l=n.filter.updateFullNode(l,o,r)))}return o=e.serverCache.isFullyInitialized()||Ln(i,T())!=null,Ut(e,l,o,n.filter.filtersNodes())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hd{constructor(e,t){this.query_=e,this.eventRegistrations_=[];const i=this.query_._queryParams,s=new ys(i.getIndex()),r=rd(i);this.processor_=Dd(r);const o=t.serverCache,a=t.eventCache,c=s.updateFullNode(m.EMPTY_NODE,o.getNode(),null),l=r.updateFullNode(m.EMPTY_NODE,a.getNode(),null),u=new Fe(c,o.isFullyInitialized(),s.filtersNodes()),h=new Fe(l,a.isFullyInitialized(),r.filtersNodes());this.viewCache_=Zn(h,u),this.eventGenerator_=new dd(this.query_)}get query(){return this.query_}}function $d(n){return n.viewCache_.serverCache.getNode()}function Vd(n){return On(n.viewCache_)}function qd(n,e){const t=Qe(n.viewCache_);return t&&(n.query._queryParams.loadsAllData()||!v(e)&&!t.getImmediateChild(w(e)).isEmpty())?t.getChild(e):null}function $r(n){return n.eventRegistrations_.length===0}function jd(n,e){n.eventRegistrations_.push(e)}function Vr(n,e,t){const i=[];if(t){f(e==null,"A cancel should cancel all event registrations.");const s=n.query._path;n.eventRegistrations_.forEach(r=>{const o=r.createCancelEvent(t,s);o&&i.push(o)})}if(e){let s=[];for(let r=0;r<n.eventRegistrations_.length;++r){const o=n.eventRegistrations_[r];if(!o.matches(e))s.push(o);else if(e.hasAnyCallback()){s=s.concat(n.eventRegistrations_.slice(r+1));break}}n.eventRegistrations_=s}else n.eventRegistrations_=[];return i}function qr(n,e,t,i){e.type===se.MERGE&&e.source.queryId!==null&&(f(Qe(n.viewCache_),"We should always have a full cache before handling merges"),f(On(n.viewCache_),"Missing event cache, even though we have a server cache"));const s=n.viewCache_,r=Md(n.processor_,s,e,t,i);return Ld(n.processor_,r.viewCache),f(r.viewCache.serverCache.isFullyInitialized()||!s.serverCache.isFullyInitialized(),"Once a server snap is complete, it should never go back"),n.viewCache_=r.viewCache,Oa(n,r.changes,r.viewCache.eventCache.getNode(),null)}function Gd(n,e){const t=n.viewCache_.eventCache,i=[];return t.getNode().isLeafNode()||t.getNode().forEachChild(P,(r,o)=>{i.push(gt(r,o))}),t.isFullyInitialized()&&i.push(Ea(t.getNode())),Oa(n,i,t.getNode(),e)}function Oa(n,e,t,i){const s=i?[i]:n.eventRegistrations_;return fd(n.eventGenerator_,e,t,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let xn;class Da{constructor(){this.views=new Map}}function zd(n){f(!xn,"__referenceConstructor has already been defined"),xn=n}function Kd(){return f(xn,"Reference.ts has not been loaded"),xn}function Yd(n){return n.views.size===0}function Ss(n,e,t,i){const s=e.source.queryId;if(s!==null){const r=n.views.get(s);return f(r!=null,"SyncTree gave us an op for an invalid query."),qr(r,e,t,i)}else{let r=[];for(const o of n.views.values())r=r.concat(qr(o,e,t,i));return r}}function La(n,e,t,i,s){const r=e._queryIdentifier,o=n.views.get(r);if(!o){let a=Dn(t,s?i:null),c=!1;a?c=!0:i instanceof m?(a=Ts(t,i),c=!1):(a=m.EMPTY_NODE,c=!1);const l=Zn(new Fe(a,c,!1),new Fe(i,s,!1));return new Hd(e,l)}return o}function Qd(n,e,t,i,s,r){const o=La(n,e,i,s,r);return n.views.has(e._queryIdentifier)||n.views.set(e._queryIdentifier,o),jd(o,t),Gd(o,t)}function Jd(n,e,t,i){const s=e._queryIdentifier,r=[];let o=[];const a=We(n);if(s==="default")for(const[c,l]of n.views.entries())o=o.concat(Vr(l,t,i)),$r(l)&&(n.views.delete(c),l.query._queryParams.loadsAllData()||r.push(l.query));else{const c=n.views.get(s);c&&(o=o.concat(Vr(c,t,i)),$r(c)&&(n.views.delete(s),c.query._queryParams.loadsAllData()||r.push(c.query)))}return a&&!We(n)&&r.push(new(Kd())(e._repo,e._path)),{removed:r,events:o}}function Ma(n){const e=[];for(const t of n.views.values())t.query._queryParams.loadsAllData()||e.push(t);return e}function Me(n,e){let t=null;for(const i of n.views.values())t=t||qd(i,e);return t}function xa(n,e){if(e._queryParams.loadsAllData())return ti(n);{const i=e._queryIdentifier;return n.views.get(i)}}function Ua(n,e){return xa(n,e)!=null}function We(n){return ti(n)!=null}function ti(n){for(const e of n.views.values())if(e.query._queryParams.loadsAllData())return e;return null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Un;function Xd(n){f(!Un,"__referenceConstructor has already been defined"),Un=n}function Zd(){return f(Un,"Reference.ts has not been loaded"),Un}let ef=1;class jr{constructor(e){this.listenProvider_=e,this.syncPointTree_=new S(null),this.pendingWriteTree_=Ad(),this.tagToQueryMap=new Map,this.queryToTagMap=new Map}}function Fa(n,e,t,i,s){return md(n.pendingWriteTree_,e,t,i,s),s?bt(n,new Ye(Is(),e,t)):[]}function tf(n,e,t,i){yd(n.pendingWriteTree_,e,t,i);const s=S.fromObject(t);return bt(n,new mt(Is(),e,s))}function De(n,e,t=!1){const i=wd(n.pendingWriteTree_,e);if(Id(n.pendingWriteTree_,e)){let r=new S(null);return i.snap!=null?r=r.set(T(),!0):W(i.children,o=>{r=r.set(new b(o),!0)}),bt(n,new Nn(i.path,r,t))}else return[]}function sn(n,e,t){return bt(n,new Ye(vs(),e,t))}function nf(n,e,t){const i=S.fromObject(t);return bt(n,new mt(vs(),e,i))}function sf(n,e){return bt(n,new Qt(vs(),e))}function rf(n,e,t){const i=ks(n,t);if(i){const s=As(i),r=s.path,o=s.queryId,a=$(r,e),c=new Qt(Es(o),a);return Ps(n,r,c)}else return[]}function Fn(n,e,t,i,s=!1){const r=e._path,o=n.syncPointTree_.get(r);let a=[];if(o&&(e._queryIdentifier==="default"||Ua(o,e))){const c=Jd(o,e,t,i);Yd(o)&&(n.syncPointTree_=n.syncPointTree_.remove(r));const l=c.removed;if(a=c.events,!s){const u=l.findIndex(d=>d._queryParams.loadsAllData())!==-1,h=n.syncPointTree_.findOnPath(r,(d,p)=>We(p));if(u&&!h){const d=n.syncPointTree_.subtree(r);if(!d.isEmpty()){const p=cf(d);for(let _=0;_<p.length;++_){const y=p[_],E=y.query,U=$a(n,y);n.listenProvider_.startListening(Wt(E),Jt(n,E),U.hashFn,U.onComplete)}}}!h&&l.length>0&&!i&&(u?n.listenProvider_.stopListening(Wt(e),null):l.forEach(d=>{const p=n.queryToTagMap.get(ni(d));n.listenProvider_.stopListening(Wt(d),p)}))}lf(n,l)}return a}function Wa(n,e,t,i){const s=ks(n,i);if(s!=null){const r=As(s),o=r.path,a=r.queryId,c=$(o,e),l=new Ye(Es(a),c,t);return Ps(n,o,l)}else return[]}function of(n,e,t,i){const s=ks(n,i);if(s){const r=As(s),o=r.path,a=r.queryId,c=$(o,e),l=S.fromObject(t),u=new mt(Es(a),c,l);return Ps(n,o,u)}else return[]}function zi(n,e,t,i=!1){const s=e._path;let r=null,o=!1;n.syncPointTree_.foreachOnPath(s,(d,p)=>{const _=$(d,s);r=r||Me(p,_),o=o||We(p)});let a=n.syncPointTree_.get(s);a?(o=o||We(a),r=r||Me(a,T())):(a=new Da,n.syncPointTree_=n.syncPointTree_.set(s,a));let c;r!=null?c=!0:(c=!1,r=m.EMPTY_NODE,n.syncPointTree_.subtree(s).foreachChild((p,_)=>{const y=Me(_,T());y&&(r=r.updateImmediateChild(p,y))}));const l=Ua(a,e);if(!l&&!e._queryParams.loadsAllData()){const d=ni(e);f(!n.queryToTagMap.has(d),"View does not exist, but we have a tag");const p=uf();n.queryToTagMap.set(d,p),n.tagToQueryMap.set(p,d)}const u=ei(n.pendingWriteTree_,s);let h=Qd(a,e,t,u,r,c);if(!l&&!o&&!i){const d=xa(a,e);h=h.concat(hf(n,e,d))}return h}function Rs(n,e,t){const s=n.pendingWriteTree_,r=n.syncPointTree_.findOnPath(e,(o,a)=>{const c=$(o,e),l=Me(a,c);if(l)return l});return Ra(s,e,r,t,!0)}function af(n,e){const t=e._path;let i=null;n.syncPointTree_.foreachOnPath(t,(l,u)=>{const h=$(l,t);i=i||Me(u,h)});let s=n.syncPointTree_.get(t);s?i=i||Me(s,T()):(s=new Da,n.syncPointTree_=n.syncPointTree_.set(t,s));const r=i!=null,o=r?new Fe(i,!0,!1):null,a=ei(n.pendingWriteTree_,e._path),c=La(s,e,a,r?o.getNode():m.EMPTY_NODE,r);return Vd(c)}function bt(n,e){return Ba(e,n.syncPointTree_,null,ei(n.pendingWriteTree_,T()))}function Ba(n,e,t,i){if(v(n.path))return Ha(n,e,t,i);{const s=e.get(T());t==null&&s!=null&&(t=Me(s,T()));let r=[];const o=w(n.path),a=n.operationForChild(o),c=e.children.get(o);if(c&&a){const l=t?t.getImmediateChild(o):null,u=ka(i,o);r=r.concat(Ba(a,c,l,u))}return s&&(r=r.concat(Ss(s,n,i,t))),r}}function Ha(n,e,t,i){const s=e.get(T());t==null&&s!=null&&(t=Me(s,T()));let r=[];return e.children.inorderTraversal((o,a)=>{const c=t?t.getImmediateChild(o):null,l=ka(i,o),u=n.operationForChild(o);u&&(r=r.concat(Ha(u,a,c,l)))}),s&&(r=r.concat(Ss(s,n,i,t))),r}function $a(n,e){const t=e.query,i=Jt(n,t);return{hashFn:()=>($d(e)||m.EMPTY_NODE).hash(),onComplete:s=>{if(s==="ok")return i?rf(n,t._path,i):sf(n,t._path);{const r=ih(s,t);return Fn(n,t,null,r)}}}}function Jt(n,e){const t=ni(e);return n.queryToTagMap.get(t)}function ni(n){return n._path.toString()+"$"+n._queryIdentifier}function ks(n,e){return n.tagToQueryMap.get(e)}function As(n){const e=n.indexOf("$");return f(e!==-1&&e<n.length-1,"Bad queryKey."),{queryId:n.substr(e+1),path:new b(n.substr(0,e))}}function Ps(n,e,t){const i=n.syncPointTree_.get(e);f(i,"Missing sync point for query tag that we're tracking");const s=ei(n.pendingWriteTree_,e);return Ss(i,t,s,null)}function cf(n){return n.fold((e,t,i)=>{if(t&&We(t))return[ti(t)];{let s=[];return t&&(s=Ma(t)),W(i,(r,o)=>{s=s.concat(o)}),s}})}function Wt(n){return n._queryParams.loadsAllData()&&!n._queryParams.isDefault()?new(Zd())(n._repo,n._path):n}function lf(n,e){for(let t=0;t<e.length;++t){const i=e[t];if(!i._queryParams.loadsAllData()){const s=ni(i),r=n.queryToTagMap.get(s);n.queryToTagMap.delete(s),n.tagToQueryMap.delete(r)}}}function uf(){return ef++}function hf(n,e,t){const i=e._path,s=Jt(n,e),r=$a(n,t),o=n.listenProvider_.startListening(Wt(e),s,r.hashFn,r.onComplete),a=n.syncPointTree_.subtree(i);if(s)f(!We(a.value),"If we're adding a query, it shouldn't be shadowed");else{const c=a.fold((l,u,h)=>{if(!v(l)&&u&&We(u))return[ti(u).query];{let d=[];return u&&(d=d.concat(Ma(u).map(p=>p.query))),W(h,(p,_)=>{d=d.concat(_)}),d}});for(let l=0;l<c.length;++l){const u=c[l];n.listenProvider_.stopListening(Wt(u),Jt(n,u))}}return o}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ns{constructor(e){this.node_=e}getImmediateChild(e){const t=this.node_.getImmediateChild(e);return new Ns(t)}node(){return this.node_}}class Os{constructor(e,t){this.syncTree_=e,this.path_=t}getImmediateChild(e){const t=A(this.path_,e);return new Os(this.syncTree_,t)}node(){return Rs(this.syncTree_,this.path_)}}const df=function(n){return n=n||{},n.timestamp=n.timestamp||new Date().getTime(),n},Gr=function(n,e,t){if(!n||typeof n!="object")return n;if(f(".sv"in n,"Unexpected leaf node or priority contents"),typeof n[".sv"]=="string")return ff(n[".sv"],e,t);if(typeof n[".sv"]=="object")return pf(n[".sv"],e);f(!1,"Unexpected server value: "+JSON.stringify(n,null,2))},ff=function(n,e,t){if(n==="timestamp")return t.timestamp;f(!1,"Unexpected server value: "+n)},pf=function(n,e,t){n.hasOwnProperty("increment")||f(!1,"Unexpected server value: "+JSON.stringify(n,null,2));const i=n.increment;typeof i!="number"&&f(!1,"Unexpected increment value: "+i);const s=e.node();if(f(s!==null&&typeof s<"u","Expected ChildrenNode.EMPTY_NODE for nulls"),!s.isLeafNode())return i;const o=s.getValue();return typeof o!="number"?i:o+i},Va=function(n,e,t,i){return Ds(e,new Os(t,n),i)},qa=function(n,e,t){return Ds(n,new Ns(e),t)};function Ds(n,e,t){const i=n.getPriority().val(),s=Gr(i,e.getImmediateChild(".priority"),t);let r;if(n.isLeafNode()){const o=n,a=Gr(o.getValue(),e,t);return a!==o.getValue()||s!==o.getPriority().val()?new M(a,D(s)):n}else{const o=n;return r=o,s!==o.getPriority().val()&&(r=r.updatePriority(new M(s))),o.forEachChild(P,(a,c)=>{const l=Ds(c,e.getImmediateChild(a),t);l!==c&&(r=r.updateImmediateChild(a,l))}),r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ls{constructor(e="",t=null,i={children:{},childCount:0}){this.name=e,this.parent=t,this.node=i}}function Ms(n,e){let t=e instanceof b?e:new b(e),i=n,s=w(t);for(;s!==null;){const r=pt(i.node.children,s)||{children:{},childCount:0};i=new Ls(s,i,r),t=R(t),s=w(t)}return i}function St(n){return n.node.value}function ja(n,e){n.node.value=e,Ki(n)}function Ga(n){return n.node.childCount>0}function _f(n){return St(n)===void 0&&!Ga(n)}function ii(n,e){W(n.node.children,(t,i)=>{e(new Ls(t,n,i))})}function za(n,e,t,i){t&&e(n),ii(n,s=>{za(s,e,!0)})}function gf(n,e,t){let i=n.parent;for(;i!==null;){if(e(i))return!0;i=i.parent}return!1}function rn(n){return new b(n.parent===null?n.name:rn(n.parent)+"/"+n.name)}function Ki(n){n.parent!==null&&mf(n.parent,n.name,n)}function mf(n,e,t){const i=_f(t),s=de(n.node.children,e);i&&s?(delete n.node.children[e],n.node.childCount--,Ki(n)):!i&&!s&&(n.node.children[e]=t.node,n.node.childCount++,Ki(n))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yf=/[\[\].#$\/\u0000-\u001F\u007F]/,wf=/[\[\].#$\u0000-\u001F\u007F]/,bi=10*1024*1024,xs=function(n){return typeof n=="string"&&n.length!==0&&!yf.test(n)},Ka=function(n){return typeof n=="string"&&n.length!==0&&!wf.test(n)},If=function(n){return n&&(n=n.replace(/^\/*\.info(\/|$)/,"/")),Ka(n)},vf=function(n){return n===null||typeof n=="string"||typeof n=="number"&&!ls(n)||n&&typeof n=="object"&&de(n,".sv")},Ef=function(n,e,t,i){si(Kn(n,"value"),e,t)},si=function(n,e,t){const i=t instanceof b?new Uh(t,n):t;if(e===void 0)throw new Error(n+"contains undefined "+$e(i));if(typeof e=="function")throw new Error(n+"contains a function "+$e(i)+" with contents = "+e.toString());if(ls(e))throw new Error(n+"contains "+e.toString()+" "+$e(i));if(typeof e=="string"&&e.length>bi/3&&Yn(e)>bi)throw new Error(n+"contains a string greater than "+bi+" utf8 bytes "+$e(i)+" ('"+e.substring(0,50)+"...')");if(e&&typeof e=="object"){let s=!1,r=!1;if(W(e,(o,a)=>{if(o===".value")s=!0;else if(o!==".priority"&&o!==".sv"&&(r=!0,!xs(o)))throw new Error(n+" contains an invalid key ("+o+") "+$e(i)+`.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);Fh(i,o),si(n,a,i),Wh(i)}),s&&r)throw new Error(n+' contains ".value" child '+$e(i)+" in addition to actual children.")}},Tf=function(n,e){let t,i;for(t=0;t<e.length;t++){i=e[t];const r=Gt(i);for(let o=0;o<r.length;o++)if(!(r[o]===".priority"&&o===r.length-1)){if(!xs(r[o]))throw new Error(n+"contains an invalid key ("+r[o]+") in path "+i.toString()+`. Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`)}}e.sort(xh);let s=null;for(t=0;t<e.length;t++){if(i=e[t],s!==null&&Z(s,i))throw new Error(n+"contains a path "+s.toString()+" that is ancestor of another path "+i.toString());s=i}},Cf=function(n,e,t,i){const s=Kn(n,"values");if(!(e&&typeof e=="object")||Array.isArray(e))throw new Error(s+" must be an object containing the children to replace.");const r=[];W(e,(o,a)=>{const c=new b(o);if(si(s,a,A(t,c)),ps(c)===".priority"&&!vf(a))throw new Error(s+"contains an invalid value for '"+c.toString()+"', which must be a valid Firebase priority (a string, finite number, server value, or null).");r.push(c)}),Tf(s,r)},Ya=function(n,e,t,i){if(!Ka(t))throw new Error(Kn(n,e)+'was an invalid path = "'+t+`". Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"`)},bf=function(n,e,t,i){t&&(t=t.replace(/^\/*\.info(\/|$)/,"/")),Ya(n,e,t)},Qa=function(n,e){if(w(e)===".info")throw new Error(n+" failed = Can't modify data under /.info/")},Sf=function(n,e){const t=e.path.toString();if(typeof e.repoInfo.host!="string"||e.repoInfo.host.length===0||!xs(e.repoInfo.namespace)&&e.repoInfo.host.split(":")[0]!=="localhost"||t.length!==0&&!If(t))throw new Error(Kn(n,"url")+`must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rf{constructor(){this.eventLists_=[],this.recursionDepth_=0}}function ri(n,e){let t=null;for(let i=0;i<e.length;i++){const s=e[i],r=s.getPath();t!==null&&!_s(r,t.path)&&(n.eventLists_.push(t),t=null),t===null&&(t={events:[],path:r}),t.events.push(s)}t&&n.eventLists_.push(t)}function Ja(n,e,t){ri(n,t),Xa(n,i=>_s(i,e))}function te(n,e,t){ri(n,t),Xa(n,i=>Z(i,e)||Z(e,i))}function Xa(n,e){n.recursionDepth_++;let t=!0;for(let i=0;i<n.eventLists_.length;i++){const s=n.eventLists_[i];if(s){const r=s.path;e(r)?(kf(n.eventLists_[i]),n.eventLists_[i]=null):t=!1}}t&&(n.eventLists_=[]),n.recursionDepth_--}function kf(n){for(let e=0;e<n.events.length;e++){const t=n.events[e];if(t!==null){n.events[e]=null;const i=t.getEventRunner();Mt&&F("event: "+t.toString()),Ct(i)}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Af="repo_interrupt",Pf=25;class Nf{constructor(e,t,i,s){this.repoInfo_=e,this.forceRestClient_=t,this.authTokenProvider_=i,this.appCheckProvider_=s,this.dataUpdateCount=0,this.statsListener_=null,this.eventQueue_=new Rf,this.nextWriteId_=1,this.interceptServerDataCallback_=null,this.onDisconnect_=Pn(),this.transactionQueueTree_=new Ls,this.persistentConnection_=null,this.key=this.repoInfo_.toURLString()}toString(){return(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host}}function Of(n,e,t){if(n.stats_=ds(n.repoInfo_),n.forceRestClient_||ah())n.server_=new An(n.repoInfo_,(i,s,r,o)=>{zr(n,i,s,r,o)},n.authTokenProvider_,n.appCheckProvider_),setTimeout(()=>Kr(n,!0),0);else{if(typeof t<"u"&&t!==null){if(typeof t!="object")throw new Error("Only objects are supported for option databaseAuthVariableOverride");try{L(t)}catch(i){throw new Error("Invalid authOverride provided: "+i)}}n.persistentConnection_=new ye(n.repoInfo_,e,(i,s,r,o)=>{zr(n,i,s,r,o)},i=>{Kr(n,i)},i=>{Lf(n,i)},n.authTokenProvider_,n.appCheckProvider_,t),n.server_=n.persistentConnection_}n.authTokenProvider_.addTokenChangeListener(i=>{n.server_.refreshAuthToken(i)}),n.appCheckProvider_.addTokenChangeListener(i=>{n.server_.refreshAppCheckToken(i.token)}),n.statsReporter_=dh(n.repoInfo_,()=>new hd(n.stats_,n.server_)),n.infoData_=new od,n.infoSyncTree_=new jr({startListening:(i,s,r,o)=>{let a=[];const c=n.infoData_.getNode(i._path);return c.isEmpty()||(a=sn(n.infoSyncTree_,i._path,c),setTimeout(()=>{o("ok")},0)),a},stopListening:()=>{}}),Us(n,"connected",!1),n.serverSyncTree_=new jr({startListening:(i,s,r,o)=>(n.server_.listen(i,r,s,(a,c)=>{const l=o(a,c);te(n.eventQueue_,i._path,l)}),[]),stopListening:(i,s)=>{n.server_.unlisten(i,s)}})}function Df(n){const t=n.infoData_.getNode(new b(".info/serverTimeOffset")).val()||0;return new Date().getTime()+t}function oi(n){return df({timestamp:Df(n)})}function zr(n,e,t,i,s){n.dataUpdateCount++;const r=new b(e);t=n.interceptServerDataCallback_?n.interceptServerDataCallback_(e,t):t;let o=[];if(s)if(i){const c=bn(t,l=>D(l));o=of(n.serverSyncTree_,r,c,s)}else{const c=D(t);o=Wa(n.serverSyncTree_,r,c,s)}else if(i){const c=bn(t,l=>D(l));o=nf(n.serverSyncTree_,r,c)}else{const c=D(t);o=sn(n.serverSyncTree_,r,c)}let a=r;o.length>0&&(a=wt(n,r)),te(n.eventQueue_,a,o)}function Kr(n,e){Us(n,"connected",e),e===!1&&Ff(n)}function Lf(n,e){W(e,(t,i)=>{Us(n,t,i)})}function Us(n,e,t){const i=new b("/.info/"+e),s=D(t);n.infoData_.updateSnapshot(i,s);const r=sn(n.infoSyncTree_,i,s);te(n.eventQueue_,i,r)}function Fs(n){return n.nextWriteId_++}function Mf(n,e,t){const i=af(n.serverSyncTree_,e);return i!=null?Promise.resolve(i):n.server_.get(e).then(s=>{const r=D(s).withIndex(e._queryParams.getIndex());zi(n.serverSyncTree_,e,t,!0);let o;if(e._queryParams.loadsAllData())o=sn(n.serverSyncTree_,e._path,r);else{const a=Jt(n.serverSyncTree_,e);o=Wa(n.serverSyncTree_,e._path,r,a)}return te(n.eventQueue_,e._path,o),Fn(n.serverSyncTree_,e,t,null,!0),r},s=>(on(n,"get for query "+L(e)+" failed: "+s),Promise.reject(new Error(s))))}function xf(n,e,t,i,s){on(n,"set",{path:e.toString(),value:t,priority:i});const r=oi(n),o=D(t,i),a=Rs(n.serverSyncTree_,e),c=qa(o,a,r),l=Fs(n),u=Fa(n.serverSyncTree_,e,c,l,!0);ri(n.eventQueue_,u),n.server_.put(e.toString(),o.val(!0),(d,p)=>{const _=d==="ok";_||V("set at "+e+" failed: "+d);const y=De(n.serverSyncTree_,l,!_);te(n.eventQueue_,e,y),Yi(n,s,d,p)});const h=Bs(n,e);wt(n,h),te(n.eventQueue_,h,[])}function Uf(n,e,t,i){on(n,"update",{path:e.toString(),value:t});let s=!0;const r=oi(n),o={};if(W(t,(a,c)=>{s=!1,o[a]=Va(A(e,a),D(c),n.serverSyncTree_,r)}),s)F("update() called with empty data.  Don't do anything."),Yi(n,i,"ok",void 0);else{const a=Fs(n),c=tf(n.serverSyncTree_,e,o,a);ri(n.eventQueue_,c),n.server_.merge(e.toString(),t,(l,u)=>{const h=l==="ok";h||V("update at "+e+" failed: "+l);const d=De(n.serverSyncTree_,a,!h),p=d.length>0?wt(n,e):e;te(n.eventQueue_,p,d),Yi(n,i,l,u)}),W(t,l=>{const u=Bs(n,A(e,l));wt(n,u)}),te(n.eventQueue_,e,[])}}function Ff(n){on(n,"onDisconnectEvents");const e=oi(n),t=Pn();Hi(n.onDisconnect_,T(),(s,r)=>{const o=Va(s,r,n.serverSyncTree_,e);Ta(t,s,o)});let i=[];Hi(t,T(),(s,r)=>{i=i.concat(sn(n.serverSyncTree_,s,r));const o=Bs(n,s);wt(n,o)}),n.onDisconnect_=Pn(),te(n.eventQueue_,T(),i)}function Wf(n,e,t){let i;w(e._path)===".info"?i=zi(n.infoSyncTree_,e,t):i=zi(n.serverSyncTree_,e,t),Ja(n.eventQueue_,e._path,i)}function Yr(n,e,t){let i;w(e._path)===".info"?i=Fn(n.infoSyncTree_,e,t):i=Fn(n.serverSyncTree_,e,t),Ja(n.eventQueue_,e._path,i)}function Bf(n){n.persistentConnection_&&n.persistentConnection_.interrupt(Af)}function on(n,...e){let t="";n.persistentConnection_&&(t=n.persistentConnection_.id+":"),F(t,...e)}function Yi(n,e,t,i){e&&Ct(()=>{if(t==="ok")e(null);else{const s=(t||"error").toUpperCase();let r=s;i&&(r+=": "+i);const o=new Error(r);o.code=s,e(o)}})}function Za(n,e,t){return Rs(n.serverSyncTree_,e,t)||m.EMPTY_NODE}function Ws(n,e=n.transactionQueueTree_){if(e||ai(n,e),St(e)){const t=tc(n,e);f(t.length>0,"Sending zero length transaction queue"),t.every(s=>s.status===0)&&Hf(n,rn(e),t)}else Ga(e)&&ii(e,t=>{Ws(n,t)})}function Hf(n,e,t){const i=t.map(l=>l.currentWriteId),s=Za(n,e,i);let r=s;const o=s.hash();for(let l=0;l<t.length;l++){const u=t[l];f(u.status===0,"tryToSendTransactionQueue_: items in queue should all be run."),u.status=1,u.retryCount++;const h=$(e,u.path);r=r.updateChild(h,u.currentOutputSnapshotRaw)}const a=r.val(!0),c=e;n.server_.put(c.toString(),a,l=>{on(n,"transaction put response",{path:c.toString(),status:l});let u=[];if(l==="ok"){const h=[];for(let d=0;d<t.length;d++)t[d].status=2,u=u.concat(De(n.serverSyncTree_,t[d].currentWriteId)),t[d].onComplete&&h.push(()=>t[d].onComplete(null,!0,t[d].currentOutputSnapshotResolved)),t[d].unwatcher();ai(n,Ms(n.transactionQueueTree_,e)),Ws(n,n.transactionQueueTree_),te(n.eventQueue_,e,u);for(let d=0;d<h.length;d++)Ct(h[d])}else{if(l==="datastale")for(let h=0;h<t.length;h++)t[h].status===3?t[h].status=4:t[h].status=0;else{V("transaction at "+c.toString()+" failed: "+l);for(let h=0;h<t.length;h++)t[h].status=4,t[h].abortReason=l}wt(n,e)}},o)}function wt(n,e){const t=ec(n,e),i=rn(t),s=tc(n,t);return $f(n,s,i),i}function $f(n,e,t){if(e.length===0)return;const i=[];let s=[];const o=e.filter(a=>a.status===0).map(a=>a.currentWriteId);for(let a=0;a<e.length;a++){const c=e[a],l=$(t,c.path);let u=!1,h;if(f(l!==null,"rerunTransactionsUnderNode_: relativePath should not be null."),c.status===4)u=!0,h=c.abortReason,s=s.concat(De(n.serverSyncTree_,c.currentWriteId,!0));else if(c.status===0)if(c.retryCount>=Pf)u=!0,h="maxretry",s=s.concat(De(n.serverSyncTree_,c.currentWriteId,!0));else{const d=Za(n,c.path,o);c.currentInputSnapshot=d;const p=e[a].update(d.val());if(p!==void 0){si("transaction failed: Data returned ",p,c.path);let _=D(p);typeof p=="object"&&p!=null&&de(p,".priority")||(_=_.updatePriority(d.getPriority()));const E=c.currentWriteId,U=oi(n),G=qa(_,d,U);c.currentOutputSnapshotRaw=_,c.currentOutputSnapshotResolved=G,c.currentWriteId=Fs(n),o.splice(o.indexOf(E),1),s=s.concat(Fa(n.serverSyncTree_,c.path,G,c.currentWriteId,c.applyLocally)),s=s.concat(De(n.serverSyncTree_,E,!0))}else u=!0,h="nodata",s=s.concat(De(n.serverSyncTree_,c.currentWriteId,!0))}te(n.eventQueue_,t,s),s=[],u&&(e[a].status=2,(function(d){setTimeout(d,Math.floor(0))})(e[a].unwatcher),e[a].onComplete&&(h==="nodata"?i.push(()=>e[a].onComplete(null,!1,e[a].currentInputSnapshot)):i.push(()=>e[a].onComplete(new Error(h),!1,null))))}ai(n,n.transactionQueueTree_);for(let a=0;a<i.length;a++)Ct(i[a]);Ws(n,n.transactionQueueTree_)}function ec(n,e){let t,i=n.transactionQueueTree_;for(t=w(e);t!==null&&St(i)===void 0;)i=Ms(i,t),e=R(e),t=w(e);return i}function tc(n,e){const t=[];return nc(n,e,t),t.sort((i,s)=>i.order-s.order),t}function nc(n,e,t){const i=St(e);if(i)for(let s=0;s<i.length;s++)t.push(i[s]);ii(e,s=>{nc(n,s,t)})}function ai(n,e){const t=St(e);if(t){let i=0;for(let s=0;s<t.length;s++)t[s].status!==2&&(t[i]=t[s],i++);t.length=i,ja(e,t.length>0?t:void 0)}ii(e,i=>{ai(n,i)})}function Bs(n,e){const t=rn(ec(n,e)),i=Ms(n.transactionQueueTree_,e);return gf(i,s=>{Si(n,s)}),Si(n,i),za(i,s=>{Si(n,s)}),t}function Si(n,e){const t=St(e);if(t){const i=[];let s=[],r=-1;for(let o=0;o<t.length;o++)t[o].status===3||(t[o].status===1?(f(r===o-1,"All SENT items should be at beginning of queue."),r=o,t[o].status=3,t[o].abortReason="set"):(f(t[o].status===0,"Unexpected transaction status in abort"),t[o].unwatcher(),s=s.concat(De(n.serverSyncTree_,t[o].currentWriteId,!0)),t[o].onComplete&&i.push(t[o].onComplete.bind(null,new Error("set"),!1,null))));r===-1?ja(e,void 0):t.length=r+1,te(n.eventQueue_,rn(e),s);for(let o=0;o<i.length;o++)Ct(i[o])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vf(n){let e="";const t=n.split("/");for(let i=0;i<t.length;i++)if(t[i].length>0){let s=t[i];try{s=decodeURIComponent(s.replace(/\+/g," "))}catch{}e+="/"+s}return e}function qf(n){const e={};n.charAt(0)==="?"&&(n=n.substring(1));for(const t of n.split("&")){if(t.length===0)continue;const i=t.split("=");i.length===2?e[decodeURIComponent(i[0])]=decodeURIComponent(i[1]):V(`Invalid query segment '${t}' in query '${n}'`)}return e}const Qr=function(n,e){const t=jf(n),i=t.namespace;t.domain==="firebase.com"&&ve(t.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"),(!i||i==="undefined")&&t.domain!=="localhost"&&ve("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"),t.secure||Xu();const s=t.scheme==="ws"||t.scheme==="wss";return{repoInfo:new oa(t.host,t.secure,i,s,e,"",i!==t.subdomain),path:new b(t.pathString)}},jf=function(n){let e="",t="",i="",s="",r="",o=!0,a="https",c=443;if(typeof n=="string"){let l=n.indexOf("//");l>=0&&(a=n.substring(0,l-1),n=n.substring(l+2));let u=n.indexOf("/");u===-1&&(u=n.length);let h=n.indexOf("?");h===-1&&(h=n.length),e=n.substring(0,Math.min(u,h)),u<h&&(s=Vf(n.substring(u,h)));const d=qf(n.substring(Math.min(n.length,h)));l=e.indexOf(":"),l>=0?(o=a==="https"||a==="wss",c=parseInt(e.substring(l+1),10)):l=e.length;const p=e.slice(0,l);if(p.toLowerCase()==="localhost")t="localhost";else if(p.split(".").length<=2)t=p;else{const _=e.indexOf(".");i=e.substring(0,_).toLowerCase(),t=e.substring(_+1),r=i}"ns"in d&&(r=d.ns)}return{host:e,port:c,domain:t,subdomain:i,secure:o,scheme:a,pathString:s,namespace:r}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gf{constructor(e,t,i,s){this.eventType=e,this.eventRegistration=t,this.snapshot=i,this.prevName=s}getPath(){const e=this.snapshot.ref;return this.eventType==="value"?e._path:e.parent._path}getEventType(){return this.eventType}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.getPath().toString()+":"+this.eventType+":"+L(this.snapshot.exportVal())}}class zf{constructor(e,t,i){this.eventRegistration=e,this.error=t,this.path=i}getPath(){return this.path}getEventType(){return"cancel"}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.path.toString()+":cancel"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ic{constructor(e,t){this.snapshotCallback=e,this.cancelCallback=t}onValue(e,t){this.snapshotCallback.call(null,e,t)}onCancel(e){return f(this.hasCancelCallback,"Raising a cancel event on a listener with no cancel callback"),this.cancelCallback.call(null,e)}get hasCancelCallback(){return!!this.cancelCallback}matches(e){return this.snapshotCallback===e.snapshotCallback||this.snapshotCallback.userCallback!==void 0&&this.snapshotCallback.userCallback===e.snapshotCallback.userCallback&&this.snapshotCallback.context===e.snapshotCallback.context}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hs{constructor(e,t,i,s){this._repo=e,this._path=t,this._queryParams=i,this._orderByCalled=s}get key(){return v(this._path)?null:ps(this._path)}get ref(){return new Te(this._repo,this._path)}get _queryIdentifier(){const e=Mr(this._queryParams),t=us(e);return t==="{}"?"default":t}get _queryObject(){return Mr(this._queryParams)}isEqual(e){if(e=k(e),!(e instanceof Hs))return!1;const t=this._repo===e._repo,i=_s(this._path,e._path),s=this._queryIdentifier===e._queryIdentifier;return t&&i&&s}toJSON(){return this.toString()}toString(){return this._repo.toString()+Mh(this._path)}}class Te extends Hs{constructor(e,t){super(e,t,new ws,!1)}get parent(){const e=_a(this._path);return e===null?null:new Te(this._repo,e)}get root(){let e=this;for(;e.parent!==null;)e=e.parent;return e}}class Xt{constructor(e,t,i){this._node=e,this.ref=t,this._index=i}get priority(){return this._node.getPriority().val()}get key(){return this.ref.key}get size(){return this._node.numChildren()}child(e){const t=new b(e),i=Qi(this.ref,e);return new Xt(this._node.getChild(t),i,P)}exists(){return!this._node.isEmpty()}exportVal(){return this._node.val(!0)}forEach(e){return this._node.isLeafNode()?!1:!!this._node.forEachChild(this._index,(i,s)=>e(new Xt(s,Qi(this.ref,i),P)))}hasChild(e){const t=new b(e);return!this._node.getChild(t).isEmpty()}hasChildren(){return this._node.isLeafNode()?!1:!this._node.isEmpty()}toJSON(){return this.exportVal()}val(){return this._node.val()}}function Jy(n,e){return n=k(n),n._checkNotDeleted("ref"),e!==void 0?Qi(n._root,e):n._root}function Qi(n,e){return n=k(n),w(n._path)===null?bf("child","path",e):Ya("child","path",e),new Te(n._repo,A(n._path,e))}function Xy(n){return Qa("remove",n._path),Kf(n,null)}function Kf(n,e){n=k(n),Qa("set",n._path),Ef("set",e,n._path);const t=new Et;return xf(n._repo,n._path,e,null,t.wrapCallback(()=>{})),t.promise}function Zy(n,e){Cf("update",e,n._path);const t=new Et;return Uf(n._repo,n._path,e,t.wrapCallback(()=>{})),t.promise}function ew(n){n=k(n);const e=new ic(()=>{}),t=new ci(e);return Mf(n._repo,n,t).then(i=>new Xt(i,new Te(n._repo,n._path),n._queryParams.getIndex()))}class ci{constructor(e){this.callbackContext=e}respondsTo(e){return e==="value"}createEvent(e,t){const i=t._queryParams.getIndex();return new Gf("value",this,new Xt(e.snapshotNode,new Te(t._repo,t._path),i))}getEventRunner(e){return e.getEventType()==="cancel"?()=>this.callbackContext.onCancel(e.error):()=>this.callbackContext.onValue(e.snapshot,null)}createCancelEvent(e,t){return this.callbackContext.hasCancelCallback?new zf(this,e,t):null}matches(e){return e instanceof ci?!e.callbackContext||!this.callbackContext?!0:e.callbackContext.matches(this.callbackContext):!1}hasAnyCallback(){return this.callbackContext!==null}}function Yf(n,e,t,i,s){let r;if(typeof i=="object"&&(r=void 0,s=i),typeof i=="function"&&(r=i),s&&s.onlyOnce){const c=t,l=(u,h)=>{Yr(n._repo,n,a),c(u,h)};l.userCallback=t.userCallback,l.context=t.context,t=l}const o=new ic(t,r||void 0),a=new ci(o);return Wf(n._repo,n,a),()=>Yr(n._repo,n,a)}function tw(n,e,t,i){return Yf(n,"value",e,t,i)}zd(Te);Xd(Te);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qf="FIREBASE_DATABASE_EMULATOR_HOST",Ji={};let Jf=!1;function Xf(n,e,t,i){const s=e.lastIndexOf(":"),r=e.substring(0,s),o=it(r);n.repoInfo_=new oa(e,o,n.repoInfo_.namespace,n.repoInfo_.webSocketOnly,n.repoInfo_.nodeAdmin,n.repoInfo_.persistenceKey,n.repoInfo_.includeNamespaceInQueryParams,!0,t),i&&(n.authTokenProvider_=i)}function Zf(n,e,t,i,s){let r=i||n.options.databaseURL;r===void 0&&(n.options.projectId||ve("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."),F("Using default host for project ",n.options.projectId),r=`${n.options.projectId}-default-rtdb.firebaseio.com`);let o=Qr(r,s),a=o.repoInfo,c;typeof process<"u"&&mr&&(c=mr[Qf]),c?(r=`http://${c}?ns=${a.namespace}`,o=Qr(r,s),a=o.repoInfo):o.repoInfo.secure;const l=new lh(n.name,n.options,e);Sf("Invalid Firebase Database URL",o),v(o.path)||ve("Database URL must point to the root of a Firebase Database (not including a child path).");const u=tp(a,n,l,new ch(n,t));return new np(u,n)}function ep(n,e){const t=Ji[e];(!t||t[n.key]!==n)&&ve(`Database ${e}(${n.repoInfo_}) has already been deleted.`),Bf(n),delete t[n.key]}function tp(n,e,t,i){let s=Ji[e.name];s||(s={},Ji[e.name]=s);let r=s[n.toURLString()];return r&&ve("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call."),r=new Nf(n,Jf,t,i),s[n.toURLString()]=r,r}class np{constructor(e,t){this._repoInternal=e,this.app=t,this.type="database",this._instanceStarted=!1}get _repo(){return this._instanceStarted||(Of(this._repoInternal,this.app.options.appId,this.app.options.databaseAuthVariableOverride),this._instanceStarted=!0),this._repoInternal}get _root(){return this._rootInternal||(this._rootInternal=new Te(this._repo,T())),this._rootInternal}_delete(){return this._rootInternal!==null&&(ep(this._repo,this.app.name),this._repoInternal=null,this._rootInternal=null),Promise.resolve()}_checkNotDeleted(e){this._rootInternal===null&&ve("Cannot call "+e+" on a deleted database.")}}function nw(n=Jn(),e){const t=Be(n,"database").getImmediate({identifier:e});if(!t._instanceStarted){const i=Uo("database");i&&ip(t,...i)}return t}function ip(n,e,t,i={}){n=k(n),n._checkNotDeleted("useEmulator");const s=`${e}:${t}`,r=n._repoInternal;if(n._instanceStarted){if(s===n._repoInternal.repoInfo_.host&&xe(i,r.repoInfo_.emulatorOptions))return;ve("connectDatabaseEmulator() cannot initialize or alter the emulator configuration after the database instance has started.")}let o;if(r.repoInfo_.nodeAdmin)i.mockUserToken&&ve('mockUserToken is not supported by the Admin SDK. For client access with mock users, please use the "firebase" package instead of "firebase-admin".'),o=new mn(mn.OWNER);else if(i.mockUserToken){const a=typeof i.mockUserToken=="string"?i.mockUserToken:Bo(i.mockUserToken,n.app.options.projectId);o=new mn(a)}it(e)&&cs(e),Xf(r,s,i,o)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sp(n){Gu(st),ce(new ee("database",(e,{instanceIdentifier:t})=>{const i=e.getProvider("app").getImmediate(),s=e.getProvider("auth-internal"),r=e.getProvider("app-check-internal");return Zf(i,s,r,t)},"PUBLIC").setMultipleInstances(!0)),Q(yr,wr,n),Q(yr,wr,"esm2020")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ye.prototype.simpleListen=function(n,e){this.sendRequest("q",{p:n},e)};ye.prototype.echo=function(n,e){this.sendRequest("echo",{d:n},e)};sp();var rp="firebase",op="12.19.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Q(rp,op,"app");function sc(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const ap=sc,rc=new nt("auth","Firebase",sc());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wn=new Qn("@firebase/auth");function yn(n,...e){Wn.logLevel<=C.WARN&&Wn.warn(`Auth (${st}): ${n}`,...e)}function wn(n,...e){Wn.logLevel<=C.ERROR&&Wn.error(`Auth (${st}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ne(n,...e){throw $s(n,...e)}function ae(n,...e){return $s(n,...e)}function li(n,e,t){const i={...ap(),[e]:t};return new nt("auth","Firebase",i).create(e,{appName:n.name})}function we(n){return li(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function cp(n,e,t){const i=t;if(!(e instanceof i))throw i.name!==e.constructor.name&&ne(n,"argument-error"),li(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function $s(n,...e){if(typeof n!="string"){const t=e[0],i=[...e.slice(1)];return i[0]&&(i[0].appName=n.name),n._errorFactory.create(t,...i)}return rc.create(n,...e)}function g(n,e,...t){if(!n)throw $s(e,...t)}function ge(n){const e="INTERNAL ASSERTION FAILED: "+n;throw wn(e),new Error(e)}function Ee(n,e){n||ge(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xi(){return typeof self<"u"&&self.location?.href||""}function lp(){return Jr()==="http:"||Jr()==="https:"}function Jr(){return typeof self<"u"&&self.location?.protocol||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function up(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(lp()||rs()||"connection"in navigator)?navigator.onLine:!0}function hp(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class an{constructor(e,t){this.shortDelay=e,this.longDelay=t,Ee(t>e,"Short delay should be less than long delay!"),this.isMobile=ss()||Ho()}get(){return up()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vs(n,e){Ee(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oc{static initialize(e,t,i){this.fetchImpl=e,t&&(this.headersImpl=t),i&&(this.responseImpl=i)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;ge("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;ge("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;ge("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dp={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fp=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],pp=new an(3e4,6e4);function Ce(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function fe(n,e,t,i,s={}){return ac(n,s,async()=>{let r={},o={};i&&(e==="GET"?o=i:r={body:JSON.stringify(i)});const a=Tt({...o,key:n.config.apiKey}).slice(1),c=await n._getAdditionalHeaders();c["Content-Type"]="application/json",n.languageCode&&(c["X-Firebase-Locale"]=n.languageCode);const l={method:e,headers:c,...r};return Ol()||(l.referrerPolicy="strict-origin-when-cross-origin"),n.emulatorConfig&&it(n.emulatorConfig.host)&&(l.credentials="include"),oc.fetch()(await cc(n,n.config.apiHost,t,a),l)})}async function ac(n,e,t){n._canInitEmulator=!1;const i={...dp,...e};try{const s=new gp(n),r=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await r.json();if("needConfirmation"in o)throw pn(n,"account-exists-with-different-credential",o);if(r.ok&&!("errorMessage"in o))return o;{const a=r.ok?o.errorMessage:o.error.message,[c,l]=a.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw pn(n,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw pn(n,"email-already-in-use",o);if(c==="USER_DISABLED")throw pn(n,"user-disabled",o);const u=i[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(l)throw li(n,u,l);ne(n,u)}}catch(s){if(s instanceof le)throw s;ne(n,"network-request-failed",{message:String(s)})}}async function cn(n,e,t,i,s={}){const r=await fe(n,e,t,i,s);return"mfaPendingCredential"in r&&ne(n,"multi-factor-auth-required",{_serverResponse:r}),r}async function cc(n,e,t,i){const s=`${e}${t}?${i}`,r=n,o=r.config.emulator?Vs(n.config,s):`${n.config.apiScheme}://${s}`;return fp.includes(t)&&(await r._persistenceManagerAvailable,r._getPersistenceType()==="COOKIE")?r._getPersistence()._getFinalTarget(o).toString():o}function _p(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class gp{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,i)=>{this.timer=setTimeout(()=>i(ae(this.auth,"network-request-failed")),pp.get())})}}function pn(n,e,t){const i={appName:n.name};t.email&&(i.email=t.email),t.phoneNumber&&(i.phoneNumber=t.phoneNumber);const s=ae(n,e,i);return s.customData._tokenResponse=t,s}function Xr(n){return n!==void 0&&n.enterprise!==void 0}class mp{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return _p(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function yp(n,e){return fe(n,"GET","/v2/recaptchaConfig",Ce(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wp(n,e){return fe(n,"POST","/v1/accounts:delete",e)}async function Bn(n,e){return fe(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bt(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Ip(n,e=!1){const t=k(n),i=await t.getIdToken(e),s=qs(i);g(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const r=typeof s.firebase=="object"?s.firebase:void 0,o=r?.sign_in_provider;return{claims:s,token:i,authTime:Bt(Ri(s.auth_time)),issuedAtTime:Bt(Ri(s.iat)),expirationTime:Bt(Ri(s.exp)),signInProvider:o||null,signInSecondFactor:r?.sign_in_second_factor||null}}function Ri(n){return Number(n)*1e3}function qs(n){const[e,t,i]=n.split(".");if(e===void 0||t===void 0||i===void 0)return wn("JWT malformed, contained fewer than 3 sections"),null;try{const s=Cn(t);return s?JSON.parse(s):(wn("Failed to decode base64 JWT payload"),null)}catch(s){return wn("Caught error parsing JWT payload as JSON",s?.toString()),null}}function Zr(n){const e=qs(n);return g(e,"internal-error"),g(typeof e.exp<"u","internal-error"),g(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function It(n,e,t=!1){if(t)return e;try{return await e}catch(i){throw i instanceof le&&vp(i)&&n.auth.currentUser===n&&await n.auth.signOut(),i}}function vp({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ep{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const i=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zi{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Bt(this.lastLoginAt),this.creationTime=Bt(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hn(n){const e=n.auth,t=await n.getIdToken(),i=await It(n,Bn(e,{idToken:t}));g(i?.users.length,e,"internal-error");const s=i.users[0];n._notifyReloadListener(s);const r=s.providerUserInfo?.length?lc(s.providerUserInfo):[],o=Cp(n.providerData,r),a=n.isAnonymous,c=!(n.email&&s.passwordHash)&&!o?.length,l=a?c:!1,u={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new Zi(s.createdAt,s.lastLoginAt),isAnonymous:l};Object.assign(n,u)}async function Tp(n){const e=k(n);await Hn(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Cp(n,e){return[...n.filter(i=>!e.some(s=>s.providerId===i.providerId)),...e]}function lc(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function bp(n,e){const t=await ac(n,{},async()=>{const i=Tt({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:r}=n.config,o=await cc(n,s,"/v1/token",`key=${r}`),a=await n._getAdditionalHeaders();a["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:a,body:i};return n.emulatorConfig&&it(n.emulatorConfig.host)&&(c.credentials="include"),oc.fetch()(o,c)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function Sp(n,e){return fe(n,"POST","/v2/accounts:revokeToken",Ce(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ht{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){g(e.idToken,"internal-error"),g(typeof e.idToken<"u","internal-error"),g(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Zr(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){g(e.length!==0,"internal-error");const t=Zr(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(g(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:i,refreshToken:s,expiresIn:r}=await bp(e,t);this.updateTokensAndExpiration(i,s,Number(r))}updateTokensAndExpiration(e,t,i){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+i*1e3}static fromJSON(e,t){const{refreshToken:i,accessToken:s,expirationTime:r}=t,o=new ht;return i&&(g(typeof i=="string","internal-error",{appName:e}),o.refreshToken=i),s&&(g(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),r&&(g(typeof r=="number","internal-error",{appName:e}),o.expirationTime=r),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new ht,this.toJSON())}_performRefresh(){return ge("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Se(n,e){g(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class re{constructor({uid:e,auth:t,stsTokenManager:i,...s}){this.providerId="firebase",this.proactiveRefresh=new Ep(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Zi(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await It(this,this.stsTokenManager.getToken(this.auth,e));return g(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return Ip(this,e)}reload(){return Tp(this)}_assign(e){this!==e&&(g(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new re({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){g(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let i=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),i=!0),t&&await Hn(this),await this.auth._persistUserIfCurrent(this),i&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(K(this.auth.app))return Promise.reject(we(this.auth));const e=await this.getIdToken();return await It(this,wp(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const i=t.displayName??void 0,s=t.email??void 0,r=t.phoneNumber??void 0,o=t.photoURL??void 0,a=t.tenantId??void 0,c=t._redirectEventId??void 0,l=t.createdAt??void 0,u=t.lastLoginAt??void 0,{uid:h,emailVerified:d,isAnonymous:p,providerData:_,stsTokenManager:y}=t;g(h&&y,e,"internal-error");const E=ht.fromJSON(this.name,y);g(typeof h=="string",e,"internal-error"),Se(i,e.name),Se(s,e.name),g(typeof d=="boolean",e,"internal-error"),g(typeof p=="boolean",e,"internal-error"),Se(r,e.name),Se(o,e.name),Se(a,e.name),Se(c,e.name),Se(l,e.name),Se(u,e.name);const U=new re({uid:h,auth:e,email:s,emailVerified:d,displayName:i,isAnonymous:p,photoURL:o,phoneNumber:r,tenantId:a,stsTokenManager:E,createdAt:l,lastLoginAt:u});return _&&Array.isArray(_)&&(U.providerData=_.map(G=>({...G}))),c&&(U._redirectEventId=c),U}static async _fromIdTokenResponse(e,t,i=!1){const s=new ht;s.updateFromServerResponse(t);const r=new re({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:i});return await Hn(r),r}static async _fromGetAccountInfoResponse(e,t,i){const s=t.users[0];g(s.localId!==void 0,"internal-error");const r=s.providerUserInfo!==void 0?lc(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!r?.length,a=new ht;a.updateFromIdToken(i);const c=new re({uid:s.localId,auth:e,stsTokenManager:a,isAnonymous:o}),l={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:r,metadata:new Zi(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!r?.length};return Object.assign(c,l),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eo=new Map;function me(n){Ee(n instanceof Function,"Expected a class definition");let e=eo.get(n);return e?(Ee(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,eo.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uc{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}uc.type="NONE";const to=uc;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function In(n,e,t){return`firebase:${n}:${e}:${t}`}class Ge{constructor(e,t,i){this.persistence=e,this.auth=t,this.userKey=i;const{config:s,name:r}=this.auth;this.fullUserKey=In(this.userKey,s.apiKey,r),this.fullPersistenceKey=In("persistence",s.apiKey,r),this.boundEventHandler=t._onStorageEvent.bind(t);try{this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}catch{}}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Bn(this.auth,{idToken:e}).catch(()=>{});return t?re._fromGetAccountInfoResponse(this.auth,t,e):null}return re._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){try{this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}catch{}}static async create(e,t,i="authUser"){if(!t.length)return new Ge(me(to),e,i);const s=(await Promise.all(t.map(async l=>{try{if(await l._isAvailable())return l}catch{return}}))).filter(l=>l);let r=s[0]||me(to);const o=In(i,e.config.apiKey,e.name);let a=null;for(const l of t)try{const u=await l._get(o);if(u){let h;if(typeof u=="string"){const d=await Bn(e,{idToken:u}).catch(()=>{});if(!d)break;h=await re._fromGetAccountInfoResponse(e,d,u)}else h=re._fromJSON(e,u);l!==r&&(a=h),r=l;break}}catch{}const c=s.filter(l=>l._shouldAllowMigration);return!r._shouldAllowMigration||!c.length?new Ge(r,e,i):(r=c[0],a&&await r._set(o,a.toJSON()),await Promise.all(t.map(async l=>{if(l!==r)try{await l._remove(o)}catch{}})),new Ge(r,e,i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function no(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(pc(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(hc(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(gc(e))return"Blackberry";if(mc(e))return"Webos";if(dc(e))return"Safari";if((e.includes("chrome/")||fc(e))&&!e.includes("edge/"))return"Chrome";if(_c(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,i=n.match(t);if(i?.length===2)return i[1]}return"Other"}function hc(n=j()){return/firefox\//i.test(n)}function dc(n=j()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function fc(n=j()){return/crios\//i.test(n)}function pc(n=j()){return/iemobile/i.test(n)}function _c(n=j()){return/android/i.test(n)}function gc(n=j()){return/blackberry/i.test(n)}function mc(n=j()){return/webos/i.test(n)}function js(n=j()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function Rp(n=j()){return js(n)&&!!window.navigator?.standalone}function kp(){return Dl()&&document.documentMode===10}function yc(n=j()){return js(n)||_c(n)||mc(n)||gc(n)||/windows phone/i.test(n)||pc(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wc(n,e=[]){let t;switch(n){case"Browser":t=no(j());break;case"Worker":t=`${no(j())}-${n}`;break;default:t=n}const i=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${st}/${i}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ap{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const i=r=>new Promise((o,a)=>{try{const c=e(r);o(c)}catch(c){a(c)}});i.onAbort=t,this.queue.push(i);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const i of this.queue)await i(e),i.onAbort&&t.push(i.onAbort)}catch(i){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:i?.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Pp(n,e={}){return fe(n,"GET","/v2/passwordPolicy",Ce(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Np=6;class Op{constructor(e){const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??Np,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const i=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;i&&(t.meetsMinPasswordLength=e.length>=i),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let i;for(let s=0;s<e.length;s++)i=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,i>="a"&&i<="z",i>="A"&&i<="Z",i>="0"&&i<="9",this.allowedNonAlphanumericCharacters.includes(i))}updatePasswordCharacterOptionsStatuses(e,t,i,s,r){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=i)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dp{constructor(e,t,i,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=i,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new io(this),this.idTokenSubscription=new io(this),this.beforeStateQueue=new Ap(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=rc,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(r=>this._resolvePersistenceManagerAvailable=r)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=me(t)),this._initializationPromise=this.queue(async()=>{if(!this._deleted){try{this.persistenceManager=await Ge.create(this,e)}catch(i){yn(`Failed to initialize persistence: ${i}`),this.persistenceManager=await Ge.create(this,[])}finally{this._resolvePersistenceManagerAvailable?.()}if(!this._deleted){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}try{await this.initializeCurrentUser(t)}catch(i){yn(`Failed to initialize current user: ${i}`),await this.directlySetCurrentUser(null).catch(()=>{})}this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Bn(this,{idToken:e}),i=await re._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(i)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(K(this.app)){const r=this.app.settings.authIdToken;return r?new Promise(o=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(r).then(o,o))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let i=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const r=this.redirectUser?._redirectEventId,o=i?._redirectEventId,a=await this.tryRedirectSignIn(e);(!r||r===o)&&a?.user&&(i=a.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(r){i=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(r))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return g(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Hn(e)}catch(t){if(t?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=hp()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(K(this.app))return Promise.reject(we(this));const t=e?k(e):null;return t&&g(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&g(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return K(this.app)?Promise.reject(we(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return K(this.app)?Promise.reject(we(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(me(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Pp(this),t=new Op(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new nt("auth","Firebase",e())}onAuthStateChanged(e,t,i){return this.registerStateListener(this.authStateSubscription,e,t,i)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,i){return this.registerStateListener(this.idTokenSubscription,e,t,i)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const i=this.onAuthStateChanged(()=>{i(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),i={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(i.tenantId=this.tenantId),await Sp(this,i)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,t){const i=await this.getOrInitRedirectPersistenceManager(t);return e===null?i.removeCurrentUser():i.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&me(e)||this._popupRedirectResolver;g(t,this,"argument-error"),this.redirectPersistenceManager=await Ge.create(this,[me(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,i,s){if(this._deleted)return()=>{};const r=typeof t=="function"?t:t.next.bind(t);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(g(a,this,"internal-error"),a.then(()=>{o||r(this.currentUser)}).catch(c=>{if(!o)if(typeof t!="function"&&t.error)t.error(c);else if(i)i(c);else throw c}),typeof t=="function"){const c=e.addObserver(t,i,s);return()=>{o=!0,c()}}else{const c=e.addObserver(t);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){if(this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,this.persistenceManager)try{e?await this.persistenceManager.setCurrentUser(e):await this.persistenceManager.removeCurrentUser()}catch(t){const i=t?.message||String(t),s=li(this,"internal-error",`An internal AuthError has occurred: ${i}`);throw s.customData={originalError:t},s}}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return g(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=wc(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();t&&(e["X-Firebase-Client"]=t);const i=await this._getAppCheckToken();return i&&(e["X-Firebase-AppCheck"]=i),e}async _getAppCheckToken(){if(K(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&yn(`Error while retrieving App Check token: ${e.error}`),e?.token}}function be(n){return k(n)}class io{constructor(e){this.auth=e,this.observer=null,this.addObserver=Bl(t=>this.observer=t)}get next(){return g(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ui={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Lp(n){ui=n}function Ic(n){return ui.loadJS(n)}function Mp(){return ui.recaptchaEnterpriseScript}function xp(){return ui.gapiScript}function Up(n){return`__${n}${Math.floor(Math.random()*1e6)}`}class Fp{constructor(){this.enterprise=new Wp}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class Wp{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bp="recaptcha-enterprise",vc="NO_RECAPTCHA",so="onFirebaseAuthREInstanceReady";class Re{constructor(e){this.type=Bp,this.auth=be(e)}async verify(e="verify",t=!1){async function i(r){if(!t){if(r.tenantId==null&&r._agentRecaptchaConfig!=null)return r._agentRecaptchaConfig.siteKey;if(r.tenantId!=null&&r._tenantRecaptchaConfigs[r.tenantId]!==void 0)return r._tenantRecaptchaConfigs[r.tenantId].siteKey}return new Promise(async(o,a)=>{yp(r,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)a(new Error("recaptcha Enterprise site key undefined"));else{const l=new mp(c);return r.tenantId==null?r._agentRecaptchaConfig=l:r._tenantRecaptchaConfigs[r.tenantId]=l,o(l.siteKey)}}).catch(c=>{a(c)})})}function s(r,o,a){const c=window.grecaptcha;Xr(c)?c.enterprise.ready(()=>{c.enterprise.execute(r,{action:e}).then(l=>{o(l)}).catch(()=>{o(vc)})}):a(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new Fp().execute("siteKey",{action:"verify"}):new Promise((r,o)=>{i(this.auth).then(async a=>{if(!t&&Xr(window.grecaptcha)&&Re.scriptInjectionDeferred)await Re.scriptInjectionDeferred.promise,s(a,r,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let c=Mp();c.length!==0&&(c+=a+`&onload=${so}`),Re.scriptInjectionDeferred=new Et,window[so]=()=>{Re.scriptInjectionDeferred?.resolve()},Ic(c).then(()=>Re.scriptInjectionDeferred?.promise).then(()=>{s(a,r,o)}).catch(l=>{o(l)})}}).catch(a=>{o(a)})})}}Re.scriptInjectionDeferred=null;async function ro(n,e,t,i=!1,s=!1){const r=new Re(n);let o;if(s)o=vc;else try{o=await r.verify(t)}catch{o=await r.verify(t,!0)}const a={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in a){const c=a.phoneEnrollmentInfo.phoneNumber,l=a.phoneEnrollmentInfo.recaptchaToken;Object.assign(a,{phoneEnrollmentInfo:{phoneNumber:c,recaptchaToken:l,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in a){const c=a.phoneSignInInfo.recaptchaToken;Object.assign(a,{phoneSignInInfo:{recaptchaToken:c,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return a}return i?Object.assign(a,{captchaResp:o}):Object.assign(a,{captchaResponse:o}),Object.assign(a,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(a,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),a}async function $n(n,e,t,i,s){if(n._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const r=await ro(n,e,t,t==="getOobCode");return i(n,r)}else return i(n,e).catch(async r=>{if(r.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const o=await ro(n,e,t,t==="getOobCode");return i(n,o)}else return Promise.reject(r)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hp(n,e){const t=Be(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),r=t.getOptions();if(xe(r,e??{}))return s;ne(s,"already-initialized")}return t.initialize({options:e})}function $p(n,e){const t=e?.persistence||[],i=(Array.isArray(t)?t:[t]).map(me);e?.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(i,e?.popupRedirectResolver)}function Vp(n,e,t){const i=be(n);g(/^https?:\/\//.test(e),i,"invalid-emulator-scheme");const s=!1,r=Ec(e),{host:o,port:a}=qp(e),c=a===null?"":`:${a}`,l={url:`${r}//${o}${c}/`},u=Object.freeze({host:o,port:a,protocol:r.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!i._canInitEmulator){g(i.config.emulator&&i.emulatorConfig,i,"emulator-config-failed"),g(xe(l,i.config.emulator)&&xe(u,i.emulatorConfig),i,"emulator-config-failed");return}i.config.emulator=l,i.emulatorConfig=u,i.settings.appVerificationDisabledForTesting=!0,it(o)?cs(`${r}//${o}${c}`):jp()}function Ec(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function qp(n){const e=Ec(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const i=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(i);if(s){const r=s[1];return{host:r,port:oo(i.substr(r.length+1))}}else{const[r,o]=i.split(":");return{host:r,port:oo(o)}}}function oo(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function jp(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gs{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return ge("not implemented")}_getIdTokenResponse(e){return ge("not implemented")}_linkToIdToken(e,t){return ge("not implemented")}_getReauthenticationResolver(e){return ge("not implemented")}}async function Gp(n,e){return fe(n,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function zp(n,e){return cn(n,"POST","/v1/accounts:signInWithPassword",Ce(n,e))}async function Tc(n,e){return fe(n,"POST","/v1/accounts:sendOobCode",Ce(n,e))}async function Kp(n,e){return Tc(n,e)}async function Yp(n,e){return Tc(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Qp(n,e){return cn(n,"POST","/v1/accounts:signInWithEmailLink",Ce(n,e))}async function Jp(n,e){return cn(n,"POST","/v1/accounts:signInWithEmailLink",Ce(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zt extends Gs{constructor(e,t,i,s=null){super("password",i),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new Zt(e,t,"password")}static _fromEmailAndCode(e,t,i=null){return new Zt(e,t,"emailLink",i)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t?.email&&t?.password){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return $n(e,t,"signInWithPassword",zp);case"emailLink":return Qp(e,{email:this._email,oobCode:this._password});default:ne(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const i={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return $n(e,i,"signUpPassword",Gp);case"emailLink":return Jp(e,{idToken:t,email:this._email,oobCode:this._password});default:ne(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function dt(n,e){return cn(n,"POST","/v1/accounts:signInWithIdp",Ce(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xp="http://localhost";class Je extends Gs{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Je(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):ne("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:i,signInMethod:s,...r}=t;if(!i||!s)return null;const o=new Je(i,s);return o.idToken=r.idToken||void 0,o.accessToken=r.accessToken||void 0,o.secret=r.secret,o.nonce=r.nonce,o.pendingToken=r.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return dt(e,t)}_linkToIdToken(e,t){const i=this.buildRequest();return i.idToken=t,dt(e,i)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,dt(e,t)}buildRequest(){const e={requestUri:Xp,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Tt(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zp(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function e_(n){const e=Dt(Lt(n)).link,t=e?Dt(Lt(e)).deep_link_id:null,i=Dt(Lt(n)).deep_link_id;return(i?Dt(Lt(i)).link:null)||i||t||e||n}class zs{constructor(e){const t=Dt(Lt(e)),i=t.apiKey??null,s=t.oobCode??null,r=Zp(t.mode??null);g(i&&s&&r,"argument-error"),this.apiKey=i,this.operation=r,this.code=s,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=e_(e);try{return new zs(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt{constructor(){this.providerId=Rt.PROVIDER_ID}static credential(e,t){return Zt._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const i=zs.parseLink(t);return g(i,"argument-error"),Zt._fromEmailAndCode(e,i.code,i.tenantId)}}Rt.PROVIDER_ID="password";Rt.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Rt.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ks{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ln extends Ks{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ke extends ln{constructor(){super("facebook.com")}static credential(e){return Je._fromParams({providerId:ke.PROVIDER_ID,signInMethod:ke.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ke.credentialFromTaggedObject(e)}static credentialFromError(e){return ke.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ke.credential(e.oauthAccessToken)}catch{return null}}}ke.FACEBOOK_SIGN_IN_METHOD="facebook.com";ke.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ae extends ln{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Je._fromParams({providerId:Ae.PROVIDER_ID,signInMethod:Ae.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Ae.credentialFromTaggedObject(e)}static credentialFromError(e){return Ae.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:i}=e;if(!t&&!i)return null;try{return Ae.credential(t,i)}catch{return null}}}Ae.GOOGLE_SIGN_IN_METHOD="google.com";Ae.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pe extends ln{constructor(){super("github.com")}static credential(e){return Je._fromParams({providerId:Pe.PROVIDER_ID,signInMethod:Pe.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Pe.credentialFromTaggedObject(e)}static credentialFromError(e){return Pe.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Pe.credential(e.oauthAccessToken)}catch{return null}}}Pe.GITHUB_SIGN_IN_METHOD="github.com";Pe.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ne extends ln{constructor(){super("twitter.com")}static credential(e,t){return Je._fromParams({providerId:Ne.PROVIDER_ID,signInMethod:Ne.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Ne.credentialFromTaggedObject(e)}static credentialFromError(e){return Ne.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:i}=e;if(!t||!i)return null;try{return Ne.credential(t,i)}catch{return null}}}Ne.TWITTER_SIGN_IN_METHOD="twitter.com";Ne.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function t_(n,e){return cn(n,"POST","/v1/accounts:signUp",Ce(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xe{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,i,s=!1){const r=await re._fromIdTokenResponse(e,i,s),o=ao(i);return new Xe({user:r,providerId:o,_tokenResponse:i,operationType:t})}static async _forOperation(e,t,i){await e._updateTokensIfNecessary(i,!0);const s=ao(i);return new Xe({user:e,providerId:s,_tokenResponse:i,operationType:t})}}function ao(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vn extends le{constructor(e,t,i,s){super(t.code,t.message),this.operationType=i,this.user=s,Object.setPrototypeOf(this,Vn.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:i}}static _fromErrorAndOperation(e,t,i,s){return new Vn(e,t,i,s)}}function Cc(n,e,t,i){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(r=>{throw r.code==="auth/multi-factor-auth-required"?Vn._fromErrorAndOperation(n,r,e,i):r})}async function n_(n,e,t=!1){const i=await It(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Xe._forOperation(n,"link",i)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function i_(n,e,t=!1){const{auth:i}=n;if(K(i.app))return Promise.reject(we(i));const s="reauthenticate";try{const r=await It(n,Cc(i,s,e,n),t);g(r.idToken,i,"internal-error");const o=qs(r.idToken);g(o,i,"internal-error");const{sub:a}=o;return g(n.uid===a,i,"user-mismatch"),Xe._forOperation(n,s,r)}catch(r){throw r?.code==="auth/user-not-found"&&ne(i,"user-mismatch"),r}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function bc(n,e,t=!1){if(K(n.app))return Promise.reject(we(n));const i="signIn",s=await Cc(n,i,e),r=await Xe._fromIdTokenResponse(n,i,s);return t||await n._updateCurrentUser(r.user),r}async function s_(n,e){return bc(be(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Sc(n){const e=be(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function iw(n,e,t){const i=be(n);await $n(i,{requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"},"getOobCode",Yp)}async function sw(n,e,t){if(K(n.app))return Promise.reject(we(n));const i=be(n),o=await $n(i,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",t_).catch(c=>{throw c.code==="auth/password-does-not-meet-requirements"&&Sc(n),c}),a=await Xe._fromIdTokenResponse(i,"signIn",o);return await i._updateCurrentUser(a.user),a}function rw(n,e,t){return K(n.app)?Promise.reject(we(n)):s_(k(n),Rt.credential(e,t)).catch(async i=>{throw i.code==="auth/password-does-not-meet-requirements"&&Sc(n),i})}async function ow(n,e){const t=k(n),s={requestType:"VERIFY_EMAIL",idToken:await n.getIdToken()},{email:r}=await Kp(t.auth,s);r!==n.email&&await n.reload()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function r_(n,e){return fe(n,"POST","/v1/accounts:update",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function aw(n,e){const{displayName:t,photoURL:i}=e;if(t===void 0&&i===void 0)return;const s=k(n),o={idToken:await s.getIdToken(),displayName:t,photoUrl:i,returnSecureToken:!0},a=await It(s,r_(s.auth,o));s.displayName=a.displayName||null,s.photoURL=a.photoUrl||null;const c=s.providerData.find(({providerId:l})=>l==="password");c&&(c.displayName=s.displayName,c.photoURL=s.photoURL),await s._updateTokensIfNecessary(a)}function o_(n,e,t,i){return k(n).onIdTokenChanged(e,t,i)}function a_(n,e,t){return k(n).beforeAuthStateChanged(e,t)}function cw(n,e,t,i){return k(n).onAuthStateChanged(e,t,i)}function lw(n){return k(n).signOut()}const qn="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rc{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(qn,"1"),this.storage.removeItem(qn),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const c_=1e3,l_=10;class kc extends Rc{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=yc(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const i=this.storage.getItem(t),s=this.localCache[t];i!==s&&e(t,s,i)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,a,c)=>{this.notifyListeners(o,c)});return}const i=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(i);!t&&this.localCache[i]===o||this.notifyListeners(i,o)},r=this.storage.getItem(i);kp()&&r!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,l_):s()}notifyListeners(e,t){this.localCache[e]=t;const i=this.listeners[e];if(i)for(const s of Array.from(i))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,i)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:i}),!0)})},c_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}kc.type="LOCAL";const u_=kc;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ac extends Rc{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Ac.type="SESSION";const Pc=Ac;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function h_(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hi{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const i=new hi(e);return this.receivers.push(i),i}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:i,eventType:s,data:r}=t.data,o=this.handlersMap[s];if(!o?.size)return;t.ports[0].postMessage({status:"ack",eventId:i,eventType:s});const a=Array.from(o).map(async l=>l(t.origin,r)),c=await h_(a);t.ports[0].postMessage({status:"done",eventId:i,eventType:s,response:c})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}hi.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ys(n="",e=10){let t="";for(let i=0;i<e;i++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class d_{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,i=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let r,o;return new Promise((a,c)=>{const l=Ys("",20);s.port1.start();const u=setTimeout(()=>{c(new Error("unsupported_event"))},i);o={messageChannel:s,onMessage(h){const d=h;if(d.data.eventId===l)switch(d.data.status){case"ack":clearTimeout(u),r=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(r),a(d.data.response);break;default:clearTimeout(u),clearTimeout(r),c(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:l,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function he(){return window}function f_(n){he().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nc(){return typeof he().WorkerGlobalScope<"u"&&typeof he().importScripts=="function"}async function p_(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function __(){return navigator?.serviceWorker?.controller||null}function g_(){return Nc()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oc="firebaseLocalStorageDb",m_=1,jn="firebaseLocalStorage",Dc="fbase_key";class un{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function di(n,e){return n.transaction([jn],e?"readwrite":"readonly").objectStore(jn)}function y_(){const n=indexedDB.deleteDatabase(Oc);return new un(n).toPromise()}function Lc(){const n=indexedDB.open(Oc,m_);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const i=n.result;try{i.createObjectStore(jn,{keyPath:Dc})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const i=n.result;i.objectStoreNames.contains(jn)?e(i):(i.close(),await y_(),e(await Lc()))})})}async function co(n,e,t){const i=di(n,!0).put({[Dc]:e,value:t});return new un(i).toPromise()}async function w_(n,e){const t=di(n,!1).get(e),i=await new un(t).toPromise();return i===void 0?null:i.value}function lo(n,e){const t=di(n,!0).delete(e);return new un(t).toPromise()}const I_=800,v_=3;class Mc{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=Lc(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const i=await this._openDb();return await e(i)}catch(i){if(t++>v_)throw i;if(this.dbPromise){const s=this.dbPromise;this.dbPromise=null;try{(await s).close()}catch{}}}}async initializeServiceWorkerMessaging(){return Nc()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=hi._getInstance(g_()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await p_(),!this.activeServiceWorker)return;this.sender=new d_(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||__()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await co(e,qn,"1"),await lo(e,qn)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(i=>co(i,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(i=>w_(i,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>lo(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(s=>{const r=di(s,!1).getAll();return new un(r).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],i=new Set;if(e.length!==0)for(const{fbase_key:s,value:r}of e)i.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(r)&&(this.notifyListeners(s,r),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!i.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}catch(e){return this.isClosing||yn(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,t){this.localCache[e]=t;const i=this.listeners[e];if(i)for(const s of Array.from(i))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),I_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}Mc.type="LOCAL";const E_=Mc;new an(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xc(n,e){return e?me(e):(g(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qs extends Gs{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return dt(e,this._buildIdpRequest())}_linkToIdToken(e,t){return dt(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return dt(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function T_(n){return bc(n.auth,new Qs(n),n.bypassAuthState)}function C_(n){const{auth:e,user:t}=n;return g(t,e,"internal-error"),i_(t,new Qs(n),n.bypassAuthState)}async function b_(n){const{auth:e,user:t}=n;return g(t,e,"internal-error"),n_(t,new Qs(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uc{constructor(e,t,i,s,r=!1){this.auth=e,this.resolver=i,this.user=s,this.bypassAuthState=r,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(i){this.reject(i)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:i,postBody:s,tenantId:r,error:o,type:a}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:t,sessionId:i,tenantId:r||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(c))}catch(l){this.reject(l)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return T_;case"linkViaPopup":case"linkViaRedirect":return b_;case"reauthViaPopup":case"reauthViaRedirect":return C_;default:ne(this.auth,"internal-error")}}resolve(e){Ee(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Ee(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const S_=new an(2e3,1e4);async function uw(n,e,t){if(K(n.app))return Promise.reject(ae(n,"operation-not-supported-in-this-environment"));const i=be(n);cp(n,e,Ks);const s=xc(i,t);return new qe(i,"signInViaPopup",e,s).executeNotNull()}class qe extends Uc{constructor(e,t,i,s,r){super(e,t,s,r),this.provider=i,this.authWindow=null,this.pollId=null,qe.currentPopupAction&&qe.currentPopupAction.cancel(),qe.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return g(e,this.auth,"internal-error"),e}async onExecution(){Ee(this.filter.length===1,"Popup operations only handle one event");const e=Ys();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(ae(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(ae(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,qe.currentPopupAction=null}pollUserCancellation(){const e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(ae(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,S_.get())};e()}}qe.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const R_="pendingRedirect",vn=new Map;class k_ extends Uc{constructor(e,t,i=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,i),this.eventId=null}async execute(){let e=vn.get(this.auth._key());if(!e){try{const i=await A_(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(i)}catch(t){e=()=>Promise.reject(t)}vn.set(this.auth._key(),e)}return this.bypassAuthState||vn.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function A_(n,e){const t=O_(e),i=N_(n);if(!await i._isAvailable())return!1;const s=await i._get(t)==="true";return await i._remove(t),s}function P_(n,e){vn.set(n._key(),e)}function N_(n){return me(n._redirectPersistence)}function O_(n){return In(R_,n.config.apiKey,n.name)}async function D_(n,e,t=!1){if(K(n.app))return Promise.reject(we(n));const i=be(n),s=xc(i,e),o=await new k_(i,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await i._persistUserIfCurrent(o.user),await i._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const L_=600*1e3;class M_{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(i=>{this.isEventForConsumer(e,i)&&(t=!0,this.sendToConsumer(e,i),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!x_(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){if(e.error&&!Fc(e)){const i=e.error.code?.split("auth/")[1]||"internal-error";t.onError(ae(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const i=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&i}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=L_&&this.cachedEventUids.clear(),this.cachedEventUids.has(uo(e))}saveEventToCache(e){this.cachedEventUids.add(uo(e)),this.lastProcessedEventTime=Date.now()}}function uo(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Fc({type:n,error:e}){return n==="unknown"&&e?.code==="auth/no-auth-event"}function x_(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Fc(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function U_(n,e={}){return fe(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const F_=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,W_=/^https?/;async function B_(n){if(n.config.emulator)return;const{authorizedDomains:e}=await U_(n);for(const t of e)try{if(H_(t))return}catch{}ne(n,"unauthorized-domain")}function H_(n){const e=Xi(),{protocol:t,hostname:i}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&i===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===i}if(!W_.test(t))return!1;if(F_.test(n))return i===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(i)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $_=new an(3e4,6e4);function ho(){const n=he().___jsl;if(n?.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function V_(n){return new Promise((e,t)=>{function i(){ho(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{ho(),t(ae(n,"network-request-failed"))},timeout:$_.get()})}if(he().gapi?.iframes?.Iframe)e(gapi.iframes.getContext());else if(he().gapi?.load)i();else{const s=Up("iframefcb");return he()[s]=()=>{gapi.load?i():t(ae(n,"network-request-failed"))},Ic(`${xp()}?onload=${s}`).catch(r=>t(r))}}).catch(e=>{throw En=null,e})}let En=null;function q_(n){return En=En||V_(n),En}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const j_=new an(5e3,15e3),G_="__/auth/iframe",z_="emulator/auth/iframe",K_={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Y_=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Q_(n){const e=n.config;g(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Vs(e,z_):`https://${n.config.authDomain}/${G_}`,i={apiKey:e.apiKey,appName:n.name,v:st},s=Y_.get(n.config.apiHost);s&&(i.eid=s);const r=n._getFrameworks();return r.length&&(i.fw=r.join(",")),`${t}?${Tt(i).slice(1)}`}async function J_(n){const e=await q_(n),t=he().gapi;return g(t,n,"internal-error"),e.open({where:document.body,url:Q_(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:K_,dontclear:!0},i=>new Promise(async(s,r)=>{await i.restyle({setHideOnLeave:!1});const o=ae(n,"network-request-failed"),a=he().setTimeout(()=>{r(o)},j_.get());function c(){he().clearTimeout(a),s(i)}i.ping(c).then(c,()=>{r(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const X_={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Z_=500,eg=600,tg="_blank",ng="http://localhost";class fo{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function ig(n,e,t,i=Z_,s=eg){const r=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-i)/2,0).toString();let a="";const c={...X_,width:i.toString(),height:s.toString(),top:r,left:o},l=j().toLowerCase();t&&(a=fc(l)?tg:t),hc(l)&&(e=e||ng,c.scrollbars="yes");const u=Object.entries(c).reduce((d,[p,_])=>`${d}${p}=${_},`,"");if(Rp(l)&&a!=="_self")return sg(e||"",a),new fo(null);const h=window.open(e||"",a,u);g(h,n,"popup-blocked");try{h.focus()}catch{}return new fo(h)}function sg(n,e){const t=document.createElement("a");t.href=n,t.target=e;const i=document.createEvent("MouseEvent");i.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(i)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rg="__/auth/handler",og="emulator/auth/handler",ag=encodeURIComponent("fac");async function po(n,e,t,i,s,r){g(n.config.authDomain,n,"auth-domain-config-required"),g(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:i,v:st,eventId:s};if(e instanceof Ks){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",Li(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[u,h]of Object.entries({}))o[u]=h}if(e instanceof ln){const u=e.getScopes().filter(h=>h!=="");u.length>0&&(o.scopes=u.join(","))}n.tenantId&&(o.tid=n.tenantId);const a=o;for(const u of Object.keys(a))a[u]===void 0&&delete a[u];const c=await n._getAppCheckToken(),l=c?`#${ag}=${encodeURIComponent(c)}`:"";return`${cg(n)}?${Tt(a).slice(1)}${l}`}function cg({config:n}){return n.emulator?Vs(n,og):`https://${n.authDomain}/${rg}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ki="webStorageSupport";class lg{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Pc,this._completeRedirectFn=D_,this._overrideRedirectResult=P_}async _openPopup(e,t,i,s){Ee(this.eventManagers[e._key()]?.manager,"_initialize() not called before _openPopup()");const r=await po(e,t,i,Xi(),s);return ig(e,r,Ys())}async _openRedirect(e,t,i,s){await this._originValidation(e);const r=await po(e,t,i,Xi(),s);return f_(r),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:r}=this.eventManagers[t];return s?Promise.resolve(s):(Ee(r,"If manager is not set, promise should be"),r)}const i=this.initAndGetManager(e);return this.eventManagers[t]={promise:i},i.catch(()=>{delete this.eventManagers[t]}),i}async initAndGetManager(e){const t=await J_(e),i=new M_(e);return t.register("authEvent",s=>(g(s?.authEvent,e,"invalid-auth-event"),{status:i.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:i},this.iframes[e._key()]=t,i}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(ki,{type:ki},s=>{const r=s?.[0]?.[ki];r!==void 0&&t(!!r),ne(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=B_(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return yc()||dc()||js()}}const ug=lg;var _o="@firebase/auth",go="1.13.6";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hg{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(i=>{e(i?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){g(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dg(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function fg(n){ce(new ee("auth",(e,{options:t})=>{const i=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),r=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=i.options;g(o&&!o.includes(":"),"invalid-api-key",{appName:i.name});const c={apiKey:o,authDomain:a,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:wc(n)},l=new Dp(i,s,r,c);return $p(l,t),l},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,i)=>{e.getProvider("auth-internal").initialize()})),ce(new ee("auth-internal",e=>{const t=be(e.getProvider("auth").getImmediate());return(i=>new hg(i))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Q(_o,go,dg(n)),Q(_o,go,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pg=300,_g=Wo("authIdTokenMaxAge")||pg;let mo=null;const gg=n=>async e=>{const t=e&&await e.getIdTokenResult(),i=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(i&&i>_g)return;const s=t?.token;mo!==s&&(mo=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function hw(n=Jn()){const e=Be(n,"auth");if(e.isInitialized())return e.getImmediate();const t=Hp(n,{popupRedirectResolver:ug,persistence:[E_,u_,Pc]}),i=Wo("authTokenSyncURL");if(i&&typeof isSecureContext=="boolean"&&isSecureContext){const r=new URL(i,location.origin);if(location.origin===r.origin){const o=gg(r.toString());a_(t,o,()=>o(t.currentUser)),o_(t,a=>o(a))}}const s=xo("auth");return s&&Vp(t,`http://${s}`),t}function mg(){return document.getElementsByTagName("head")?.[0]??document}Lp({loadJS(n){return new Promise((e,t)=>{const i=document.createElement("script");i.setAttribute("src",n),i.onload=e,i.onerror=s=>{const r=ae("internal-error");r.customData=s,t(r)},i.type="text/javascript",i.charset="UTF-8",mg().appendChild(i)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});fg("Browser");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wc="firebasestorage.googleapis.com",Bc="storageBucket",yg=120*1e3,wg=600*1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class O extends le{constructor(e,t,i=0){super(Ai(e),`Firebase Storage: ${t} (${Ai(e)})`),this.status_=i,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,O.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return Ai(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var N;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(N||(N={}));function Ai(n){return"storage/"+n}function Js(){const n="An unknown error occurred, please check the error payload for server response.";return new O(N.UNKNOWN,n)}function Ig(n){return new O(N.OBJECT_NOT_FOUND,"Object '"+n+"' does not exist.")}function vg(n){return new O(N.QUOTA_EXCEEDED,"Quota for bucket '"+n+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function Eg(){const n="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new O(N.UNAUTHENTICATED,n)}function Tg(){return new O(N.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function Cg(n){return new O(N.UNAUTHORIZED,"User does not have permission to access '"+n+"'.")}function bg(){return new O(N.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function Sg(){return new O(N.CANCELED,"User canceled the upload/download.")}function Rg(n){return new O(N.INVALID_URL,"Invalid URL '"+n+"'.")}function kg(n){return new O(N.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function Ag(){return new O(N.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+Bc+"' property when initializing the app?")}function Pg(){return new O(N.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function Ng(){return new O(N.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function Og(n){return new O(N.UNSUPPORTED_ENVIRONMENT,`${n} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function es(n){return new O(N.INVALID_ARGUMENT,n)}function Hc(){return new O(N.APP_DELETED,"The Firebase app was deleted.")}function Dg(n){return new O(N.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function Ht(n,e){return new O(N.INVALID_FORMAT,"String does not match format '"+n+"': "+e)}function Ot(n){throw new O(N.INTERNAL_ERROR,"Internal error: "+n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class J{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let i;try{i=J.makeFromUrl(e,t)}catch{return new J(e,"")}if(i.path==="")return i;throw kg(e)}static makeFromUrl(e,t){let i=null;const s="([A-Za-z0-9.\\-_]+)";function r(B){B.path.charAt(B.path.length-1)==="/"&&(B.path_=B.path_.slice(0,-1))}const o="(/(.*))?$",a=new RegExp("^gs://"+s+o,"i"),c={bucket:1,path:3};function l(B){B.path_=decodeURIComponent(B.path)}const u="v[A-Za-z0-9_]+",h=t.replace(/[.]/g,"\\."),d="(/([^?#]*).*)?$",p=new RegExp(`^https?://${h}/${u}/b/${s}/o${d}`,"i"),_={bucket:1,path:3},y=t===Wc?"(?:storage.googleapis.com|storage.cloud.google.com)":t,E="([^?#]*)",U=new RegExp(`^https?://${y}/${s}/${E}`,"i"),z=[{regex:a,indices:c,postModify:r},{regex:p,indices:_,postModify:l},{regex:U,indices:{bucket:1,path:2},postModify:l}];for(let B=0;B<z.length;B++){const hn=z[B],gi=hn.regex.exec(e);if(gi){const El=gi[hn.indices.bucket];let mi=gi[hn.indices.path];mi||(mi=""),i=new J(El,mi),hn.postModify(i);break}}if(i==null)throw Rg(e);return i}}class Lg{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mg(n,e,t){let i=1,s=null,r=null,o=!1,a=0;function c(){return a===2}let l=!1;function u(...E){l||(l=!0,e.apply(null,E))}function h(E){s=setTimeout(()=>{s=null,n(p,c())},E)}function d(){r&&clearTimeout(r)}function p(E,...U){if(l){d();return}if(E){d(),u.call(null,E,...U);return}if(c()||o){d(),u.call(null,E,...U);return}i<64&&(i*=2);let z;a===1?(a=2,z=0):z=(i+Math.random())*1e3,h(z)}let _=!1;function y(E){_||(_=!0,d(),!l&&(s!==null?(E||(a=2),clearTimeout(s),h(0)):E||(a=1)))}return h(0),r=setTimeout(()=>{o=!0,y(!0)},t),y}function xg(n){n(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ug(n){return n!==void 0}function Fg(n){return typeof n=="object"&&!Array.isArray(n)}function Xs(n){return typeof n=="string"||n instanceof String}function yo(n){return Zs()&&n instanceof Blob}function Zs(){return typeof Blob<"u"}function wo(n,e,t,i){if(i<e)throw es(`Invalid value for '${n}'. Expected ${e} or greater.`);if(i>t)throw es(`Invalid value for '${n}'. Expected ${t} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fi(n,e,t){let i=e;return t==null&&(i=`https://${e}`),`${t}://${i}/v0${n}`}function $c(n){const e=encodeURIComponent;let t="?";for(const i in n)if(n.hasOwnProperty(i)){const s=e(i)+"="+e(n[i]);t=t+s+"&"}return t=t.slice(0,-1),t}var ze;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(ze||(ze={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wg(n,e){const t=n>=500&&n<600,s=[408,429].indexOf(n)!==-1,r=e.indexOf(n)!==-1;return t||s||r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bg{constructor(e,t,i,s,r,o,a,c,l,u,h,d=!0,p=!1){this.url_=e,this.method_=t,this.headers_=i,this.body_=s,this.successCodes_=r,this.additionalRetryCodes_=o,this.callback_=a,this.errorCallback_=c,this.timeout_=l,this.progressCallback_=u,this.connectionFactory_=h,this.retry=d,this.isUsingEmulator=p,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((_,y)=>{this.resolve_=_,this.reject_=y,this.start_()})}start_(){const e=(i,s)=>{if(s){i(!1,new _n(!1,null,!0));return}const r=this.connectionFactory_();this.pendingConnection_=r;const o=a=>{const c=a.loaded,l=a.lengthComputable?a.total:-1;this.progressCallback_!==null&&this.progressCallback_(c,l)};this.progressCallback_!==null&&r.addUploadProgressListener(o),r.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&r.removeUploadProgressListener(o),this.pendingConnection_=null;const a=r.getErrorCode()===ze.NO_ERROR,c=r.getStatus();if(!a||Wg(c,this.additionalRetryCodes_)&&this.retry){const u=r.getErrorCode()===ze.ABORT;i(!1,new _n(!1,null,u));return}const l=this.successCodes_.indexOf(c)!==-1;i(!0,new _n(l,r))})},t=(i,s)=>{const r=this.resolve_,o=this.reject_,a=s.connection;if(s.wasSuccessCode)try{const c=this.callback_(a,a.getResponse());Ug(c)?r(c):r()}catch(c){o(c)}else if(a!==null){const c=Js();c.serverResponse=a.getErrorText(),this.errorCallback_?o(this.errorCallback_(a,c)):o(c)}else if(s.canceled){const c=this.appDelete_?Hc():Sg();o(c)}else{const c=bg();o(c)}};this.canceled_?t(!1,new _n(!1,null,!0)):this.backoffId_=Mg(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&xg(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class _n{constructor(e,t,i){this.wasSuccessCode=e,this.connection=t,this.canceled=!!i}}function Hg(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function $g(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function Vg(n,e){e&&(n["X-Firebase-GMPID"]=e)}function qg(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function jg(n,e,t,i,s,r,o=!0,a=!1){const c=$c(n.urlParams),l=n.url+c,u=Object.assign({},n.headers);return Vg(u,e),Hg(u,t),$g(u,r),qg(u,i),new Bg(l,n.method,u,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,s,o,a)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gg(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function zg(...n){const e=Gg();if(e!==void 0){const t=new e;for(let i=0;i<n.length;i++)t.append(n[i]);return t.getBlob()}else{if(Zs())return new Blob(n);throw new O(N.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function Kg(n,e,t){return n.webkitSlice?n.webkitSlice(e,t):n.mozSlice?n.mozSlice(e,t):n.slice?n.slice(e,t):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yg(n){if(typeof atob>"u")throw Og("base-64");return atob(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ue={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class Pi{constructor(e,t){this.data=e,this.contentType=t||null}}function Qg(n,e){switch(n){case ue.RAW:return new Pi(Vc(e));case ue.BASE64:case ue.BASE64URL:return new Pi(qc(n,e));case ue.DATA_URL:return new Pi(Xg(e),Zg(e))}throw Js()}function Vc(n){const e=[];for(let t=0;t<n.length;t++){let i=n.charCodeAt(t);if(i<=127)e.push(i);else if(i<=2047)e.push(192|i>>6,128|i&63);else if((i&64512)===55296)if(!(t<n.length-1&&(n.charCodeAt(t+1)&64512)===56320))e.push(239,191,189);else{const r=i,o=n.charCodeAt(++t);i=65536|(r&1023)<<10|o&1023,e.push(240|i>>18,128|i>>12&63,128|i>>6&63,128|i&63)}else(i&64512)===56320?e.push(239,191,189):e.push(224|i>>12,128|i>>6&63,128|i&63)}return new Uint8Array(e)}function Jg(n){let e;try{e=decodeURIComponent(n)}catch{throw Ht(ue.DATA_URL,"Malformed data URL.")}return Vc(e)}function qc(n,e){switch(n){case ue.BASE64:{const s=e.indexOf("-")!==-1,r=e.indexOf("_")!==-1;if(s||r)throw Ht(n,"Invalid character '"+(s?"-":"_")+"' found: is it base64url encoded?");break}case ue.BASE64URL:{const s=e.indexOf("+")!==-1,r=e.indexOf("/")!==-1;if(s||r)throw Ht(n,"Invalid character '"+(s?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let t;try{t=Yg(e)}catch(s){throw s.message.includes("polyfill")?s:Ht(n,"Invalid character found")}const i=new Uint8Array(t.length);for(let s=0;s<t.length;s++)i[s]=t.charCodeAt(s);return i}class jc{constructor(e){this.base64=!1,this.contentType=null;const t=e.match(/^data:([^,]+)?,/);if(t===null)throw Ht(ue.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const i=t[1]||null;i!=null&&(this.base64=em(i,";base64"),this.contentType=this.base64?i.substring(0,i.length-7):i),this.rest=e.substring(e.indexOf(",")+1)}}function Xg(n){const e=new jc(n);return e.base64?qc(ue.BASE64,e.rest):Jg(e.rest)}function Zg(n){return new jc(n).contentType}function em(n,e){return n.length>=e.length?n.substring(n.length-e.length)===e:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oe{constructor(e,t){let i=0,s="";yo(e)?(this.data_=e,i=e.size,s=e.type):e instanceof ArrayBuffer?(t?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),i=this.data_.length):e instanceof Uint8Array&&(t?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),i=e.length),this.size_=i,this.type_=s}size(){return this.size_}type(){return this.type_}slice(e,t){if(yo(this.data_)){const i=this.data_,s=Kg(i,e,t);return s===null?null:new Oe(s)}else{const i=new Uint8Array(this.data_.buffer,e,t-e);return new Oe(i,!0)}}static getBlob(...e){if(Zs()){const t=e.map(i=>i instanceof Oe?i.data_:i);return new Oe(zg.apply(null,t))}else{const t=e.map(o=>Xs(o)?Qg(ue.RAW,o).data:o.data_);let i=0;t.forEach(o=>{i+=o.byteLength});const s=new Uint8Array(i);let r=0;return t.forEach(o=>{for(let a=0;a<o.length;a++)s[r++]=o[a]}),new Oe(s,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gc(n){let e;try{e=JSON.parse(n)}catch{return null}return Fg(e)?e:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tm(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function nm(n,e){const t=e.split("/").filter(i=>i.length>0).join("/");return n.length===0?t:n+"/"+t}function zc(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function im(n,e){return e}class H{constructor(e,t,i,s){this.server=e,this.local=t||e,this.writable=!!i,this.xform=s||im}}let gn=null;function sm(n){return!Xs(n)||n.length<2?n:zc(n)}function Kc(){if(gn)return gn;const n=[];n.push(new H("bucket")),n.push(new H("generation")),n.push(new H("metageneration")),n.push(new H("name","fullPath",!0));function e(r,o){return sm(o)}const t=new H("name");t.xform=e,n.push(t);function i(r,o){return o!==void 0?Number(o):o}const s=new H("size");return s.xform=i,n.push(s),n.push(new H("timeCreated")),n.push(new H("updated")),n.push(new H("md5Hash",null,!0)),n.push(new H("cacheControl",null,!0)),n.push(new H("contentDisposition",null,!0)),n.push(new H("contentEncoding",null,!0)),n.push(new H("contentLanguage",null,!0)),n.push(new H("contentType",null,!0)),n.push(new H("metadata","customMetadata",!0)),gn=n,gn}function rm(n,e){function t(){const i=n.bucket,s=n.fullPath,r=new J(i,s);return e._makeStorageReference(r)}Object.defineProperty(n,"ref",{get:t})}function om(n,e,t){const i={};i.type="file";const s=t.length;for(let r=0;r<s;r++){const o=t[r];i[o.local]=o.xform(i,e[o.server])}return rm(i,n),i}function Yc(n,e,t){const i=Gc(e);return i===null?null:om(n,i,t)}function am(n,e,t,i){const s=Gc(e);if(s===null||!Xs(s.downloadTokens))return null;const r=s.downloadTokens;if(r.length===0)return null;const o=encodeURIComponent;return r.split(",").map(l=>{const u=n.bucket,h=n.fullPath,d="/b/"+o(u)+"/o/"+o(h),p=fi(d,t,i),_=$c({alt:"media",token:l});return p+_})[0]}function cm(n,e){const t={},i=e.length;for(let s=0;s<i;s++){const r=e[s];r.writable&&(t[r.server]=n[r.local])}return JSON.stringify(t)}class er{constructor(e,t,i,s){this.url=e,this.method=t,this.handler=i,this.timeout=s,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qc(n){if(!n)throw Js()}function lm(n,e){function t(i,s){const r=Yc(n,s,e);return Qc(r!==null),r}return t}function um(n,e){function t(i,s){const r=Yc(n,s,e);return Qc(r!==null),am(r,s,n.host,n._protocol)}return t}function Jc(n){function e(t,i){let s;return t.getStatus()===401?t.getErrorText().includes("Firebase App Check token is invalid")?s=Tg():s=Eg():t.getStatus()===402?s=vg(n.bucket):t.getStatus()===403?s=Cg(n.path):s=i,s.status=t.getStatus(),s.serverResponse=i.serverResponse,s}return e}function Xc(n){const e=Jc(n);function t(i,s){let r=e(i,s);return i.getStatus()===404&&(r=Ig(n.path)),r.serverResponse=s.serverResponse,r}return t}function hm(n,e,t){const i=e.fullServerUrl(),s=fi(i,n.host,n._protocol),r="GET",o=n.maxOperationRetryTime,a=new er(s,r,um(n,t),o);return a.errorHandler=Xc(e),a}function dm(n,e){const t=e.fullServerUrl(),i=fi(t,n.host,n._protocol),s="DELETE",r=n.maxOperationRetryTime;function o(c,l){}const a=new er(i,s,o,r);return a.successCodes=[200,204],a.errorHandler=Xc(e),a}function fm(n,e){return n&&n.contentType||e&&e.type()||"application/octet-stream"}function pm(n,e,t){const i=Object.assign({},t);return i.fullPath=n.path,i.size=e.size(),i.contentType||(i.contentType=fm(null,e)),i}function _m(n,e,t,i,s){const r=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function a(){let z="";for(let B=0;B<2;B++)z=z+Math.random().toString().slice(2);return z}const c=a();o["Content-Type"]="multipart/related; boundary="+c;const l=pm(e,i,s),u=cm(l,t),h="--"+c+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+u+`\r
--`+c+`\r
Content-Type: `+l.contentType+`\r
\r
`,d=`\r
--`+c+"--",p=Oe.getBlob(h,i,d);if(p===null)throw Pg();const _={name:l.fullPath},y=fi(r,n.host,n._protocol),E="POST",U=n.maxUploadRetryTime,G=new er(y,E,lm(n,t),U);return G.urlParams=_,G.headers=o,G.body=p.uploadData(),G.errorHandler=Jc(e),G}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gm{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=ze.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=ze.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=ze.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,t,i,s,r){if(this.sent_)throw Ot("cannot .send() more than once");if(it(e)&&i&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(t,e,!0),r!==void 0)for(const o in r)r.hasOwnProperty(o)&&this.xhr_.setRequestHeader(o,r[o].toString());return s!==void 0?this.xhr_.send(s):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw Ot("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw Ot("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw Ot("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw Ot("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class mm extends gm{initXhr(){this.xhr_.responseType="text"}}function tr(){return new mm}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ze{constructor(e,t){this._service=e,t instanceof J?this._location=t:this._location=J.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new Ze(e,t)}get root(){const e=new J(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return zc(this._location.path)}get storage(){return this._service}get parent(){const e=tm(this._location.path);if(e===null)return null;const t=new J(this._location.bucket,e);return new Ze(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw Dg(e)}}function ym(n,e,t){n._throwIfRoot("uploadBytes");const i=_m(n.storage,n._location,Kc(),new Oe(e,!0),t);return n.storage.makeRequestWithTokens(i,tr).then(s=>({metadata:s,ref:n}))}function wm(n){n._throwIfRoot("getDownloadURL");const e=hm(n.storage,n._location,Kc());return n.storage.makeRequestWithTokens(e,tr).then(t=>{if(t===null)throw Ng();return t})}function Im(n){n._throwIfRoot("deleteObject");const e=dm(n.storage,n._location);return n.storage.makeRequestWithTokens(e,tr)}function vm(n,e){const t=nm(n._location.path,e),i=new J(n._location.bucket,t);return new Ze(n.storage,i)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Em(n){return/^[A-Za-z]+:\/\//.test(n)}function Tm(n,e){return new Ze(n,e)}function Zc(n,e){if(n instanceof nr){const t=n;if(t._bucket==null)throw Ag();const i=new Ze(t,t._bucket);return e!=null?Zc(i,e):i}else return e!==void 0?vm(n,e):n}function Cm(n,e){if(e&&Em(e)){if(n instanceof nr)return Tm(n,e);throw es("To use ref(service, url), the first argument must be a Storage instance.")}else return Zc(n,e)}function Io(n,e){const t=e?.[Bc];return t==null?null:J.makeFromBucketSpec(t,n)}function bm(n,e,t,i={}){n.host=`${e}:${t}`;const s=it(e);s&&cs(`https://${n.host}/b`),n._isUsingEmulator=!0,n._protocol=s?"https":"http";const{mockUserToken:r}=i;r&&(n._overrideAuthToken=typeof r=="string"?r:Bo(r,n.app.options.projectId))}class nr{constructor(e,t,i,s,r,o=!1){this.app=e,this._authProvider=t,this._appCheckProvider=i,this._url=s,this._firebaseVersion=r,this._isUsingEmulator=o,this._bucket=null,this._host=Wc,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=yg,this._maxUploadRetryTime=wg,this._requests=new Set,s!=null?this._bucket=J.makeFromBucketSpec(s,this._host):this._bucket=Io(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=J.makeFromBucketSpec(this._url,e):this._bucket=Io(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){wo("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){wo("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){if(K(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new Ze(this,e)}_makeRequest(e,t,i,s,r=!0){if(this._deleted)return new Lg(Hc());{const o=jg(e,this._appId,i,s,t,this._firebaseVersion,r,this._isUsingEmulator);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,t){const[i,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,i,s).getPromise()}}const vo="@firebase/storage",Eo="0.14.5";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const el="storage";function dw(n,e,t){return n=k(n),ym(n,e,t)}function fw(n){return n=k(n),wm(n)}function pw(n){return n=k(n),Im(n)}function _w(n,e){return n=k(n),Cm(n,e)}function gw(n=Jn(),e){n=k(n);const i=Be(n,el).getImmediate({identifier:e}),s=Uo("storage");return s&&Sm(i,...s),i}function Sm(n,e,t,i={}){bm(n,e,t,i)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rm(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),i=n.getProvider("auth-internal"),s=n.getProvider("app-check-internal");return new nr(t,i,s,e,st)}function km(){ce(new ee(el,Rm,"PUBLIC").setMultipleInstances(!0)),Q(vo,Eo,""),Q(vo,Eo,"esm2020")}km();const tl="@firebase/installations",ir="0.6.24";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nl=1e4,il=`w:${ir}`,sl="FIS_v2",Am="https://firebaseinstallations.googleapis.com/v1",Pm=3600*1e3,Nm="installations",Om="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dm={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},et=new nt(Nm,Om,Dm);function rl(n){return n instanceof le&&n.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ol({projectId:n}){return`${Am}/projects/${n}/installations`}function al(n){return{token:n.token,requestStatus:2,expiresIn:Mm(n.expiresIn),creationTime:Date.now()}}async function cl(n,e){const i=(await e.json()).error;return et.create("request-failed",{requestName:n,serverCode:i.code,serverMessage:i.message,serverStatus:i.status})}function ll({apiKey:n}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n})}function Lm(n,{refreshToken:e}){const t=ll(n);return t.append("Authorization",xm(e)),t}async function ul(n){const e=await n();return e.status>=500&&e.status<600?n():e}function Mm(n){return Number(n.replace("s","000"))}function xm(n){return`${sl} ${n}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Um({appConfig:n,heartbeatServiceProvider:e},{fid:t}){const i=ol(n),s=ll(n),r=e.getImmediate({optional:!0});if(r){const l=await r.getHeartbeatsHeader();l&&s.append("x-firebase-client",l)}const o={fid:t,authVersion:sl,appId:n.appId,sdkVersion:il},a={method:"POST",headers:s,body:JSON.stringify(o)},c=await ul(()=>fetch(i,a));if(c.ok){const l=await c.json();return{fid:l.fid||t,registrationStatus:2,refreshToken:l.refreshToken,authToken:al(l.authToken)}}else throw await cl("Create Installation",c)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hl(n){return new Promise(e=>{setTimeout(e,n)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fm(n){return btoa(String.fromCharCode(...n)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wm=/^[cdef][\w-]{21}$/,ts="";function Bm(){try{const n=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(n),n[0]=112+n[0]%16;const t=Hm(n);return Wm.test(t)?t:ts}catch{return ts}}function Hm(n){return Fm(n).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pi(n){return`${n.appName}!${n.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dl=new Map;function fl(n,e){const t=pi(n);pl(t,e),$m(t,e)}function pl(n,e){const t=dl.get(n);if(t)for(const i of t)i(e)}function $m(n,e){const t=Vm();t&&t.postMessage({key:n,fid:e}),qm()}let je=null;function Vm(){return!je&&"BroadcastChannel"in self&&(je=new BroadcastChannel("[Firebase] FID Change"),je.onmessage=n=>{pl(n.data.key,n.data.fid)}),je}function qm(){dl.size===0&&je&&(je.close(),je=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jm="firebase-installations-database",Gm=1,tt="firebase-installations-store";let Ni=null;function sr(){return Ni||(Ni=No(jm,Gm,{upgrade:(n,e)=>{e===0&&n.createObjectStore(tt)}})),Ni}async function Gn(n,e){const t=pi(n),s=(await sr()).transaction(tt,"readwrite"),r=s.objectStore(tt),o=await r.get(t);return await r.put(e,t),await s.done,(!o||o.fid!==e.fid)&&fl(n,e.fid),e}async function _l(n){const e=pi(n),i=(await sr()).transaction(tt,"readwrite");await i.objectStore(tt).delete(e),await i.done}async function _i(n,e){const t=pi(n),s=(await sr()).transaction(tt,"readwrite"),r=s.objectStore(tt),o=await r.get(t),a=e(o);return a===void 0?await r.delete(t):await r.put(a,t),await s.done,a&&(!o||o.fid!==a.fid)&&fl(n,a.fid),a}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function rr(n){let e;const t=await _i(n.appConfig,i=>{const s=zm(i),r=Km(n,s);return e=r.registrationPromise,r.installationEntry});return t.fid===ts?{installationEntry:await e}:{installationEntry:t,registrationPromise:e}}function zm(n){const e=n||{fid:Bm(),registrationStatus:0};return gl(e)}function Km(n,e){if(e.registrationStatus===0){if(!navigator.onLine){const s=Promise.reject(et.create("app-offline"));return{installationEntry:e,registrationPromise:s}}const t={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},i=Ym(n,t);return{installationEntry:t,registrationPromise:i}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:Qm(n)}:{installationEntry:e}}async function Ym(n,e){try{const t=await Um(n,e);return Gn(n.appConfig,t)}catch(t){throw rl(t)&&t.customData.serverCode===409?await _l(n.appConfig):await Gn(n.appConfig,{fid:e.fid,registrationStatus:0}),t}}async function Qm(n){let e=await To(n.appConfig);for(;e.registrationStatus===1;)await hl(100),e=await To(n.appConfig);if(e.registrationStatus===0){const{installationEntry:t,registrationPromise:i}=await rr(n);return i||t}return e}function To(n){return _i(n,e=>{if(!e)throw et.create("installation-not-found");return gl(e)})}function gl(n){return Jm(n)?{fid:n.fid,registrationStatus:0}:n}function Jm(n){return n.registrationStatus===1&&n.registrationTime+nl<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xm({appConfig:n,heartbeatServiceProvider:e},t){const i=Zm(n,t),s=Lm(n,t),r=e.getImmediate({optional:!0});if(r){const l=await r.getHeartbeatsHeader();l&&s.append("x-firebase-client",l)}const o={installation:{sdkVersion:il,appId:n.appId}},a={method:"POST",headers:s,body:JSON.stringify(o)},c=await ul(()=>fetch(i,a));if(c.ok){const l=await c.json();return al(l)}else throw await cl("Generate Auth Token",c)}function Zm(n,{fid:e}){return`${ol(n)}/${e}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function or(n,e=!1){let t;const i=await _i(n.appConfig,r=>{if(!ml(r))throw et.create("not-registered");const o=r.authToken;if(!e&&ny(o))return r;if(o.requestStatus===1)return t=ey(n,e),r;{if(!navigator.onLine)throw et.create("app-offline");const a=sy(r);return t=ty(n,a),a}});return t?await t:i.authToken}async function ey(n,e){let t=await Co(n.appConfig);for(;t.authToken.requestStatus===1;)await hl(100),t=await Co(n.appConfig);const i=t.authToken;return i.requestStatus===0?or(n,e):i}function Co(n){return _i(n,e=>{if(!ml(e))throw et.create("not-registered");const t=e.authToken;return ry(t)?{...e,authToken:{requestStatus:0}}:e})}async function ty(n,e){try{const t=await Xm(n,e),i={...e,authToken:t};return await Gn(n.appConfig,i),t}catch(t){if(rl(t)&&(t.customData.serverCode===401||t.customData.serverCode===404))await _l(n.appConfig);else{const i={...e,authToken:{requestStatus:0}};await Gn(n.appConfig,i)}throw t}}function ml(n){return n!==void 0&&n.registrationStatus===2}function ny(n){return n.requestStatus===2&&!iy(n)}function iy(n){const e=Date.now();return e<n.creationTime||n.creationTime+n.expiresIn<e+Pm}function sy(n){const e={requestStatus:1,requestTime:Date.now()};return{...n,authToken:e}}function ry(n){return n.requestStatus===1&&n.requestTime+nl<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function oy(n){const e=n,{installationEntry:t,registrationPromise:i}=await rr(e);return i?i.catch(console.error):or(e).catch(console.error),t.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ay(n,e=!1){const t=n;return await cy(t),(await or(t,e)).token}async function cy(n){const{registrationPromise:e}=await rr(n);e&&await e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ly(n){if(!n||!n.options)throw Oi("App Configuration");if(!n.name)throw Oi("App Name");const e=["projectId","apiKey","appId"];for(const t of e)if(!n.options[t])throw Oi(t);return{appName:n.name,projectId:n.options.projectId,apiKey:n.options.apiKey,appId:n.options.appId}}function Oi(n){return et.create("missing-app-config-values",{valueName:n})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yl="installations",uy="installations-internal",hy=n=>{const e=n.getProvider("app").getImmediate(),t=ly(e),i=Be(e,"heartbeat");return{app:e,appConfig:t,heartbeatServiceProvider:i,_delete:()=>Promise.resolve()}},dy=n=>{const e=n.getProvider("app").getImmediate(),t=Be(e,yl).getImmediate();return{getId:()=>oy(t),getToken:s=>ay(t,s)}};function fy(){ce(new ee(yl,hy,"PUBLIC")),ce(new ee(uy,dy,"PRIVATE"))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */fy();Q(tl,ir);Q(tl,ir,"esm2020");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zn="analytics",py="firebase_id",_y="origin",gy=60*1e3,my="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",ar="https://www.googletagmanager.com/gtag/js";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const q=new Qn("@firebase/analytics");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yy={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},X=new nt("analytics","Analytics",yy);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wy(n){if(!n.startsWith(ar)){const e=X.create("invalid-gtag-resource",{gtagURL:n});return q.warn(e.message),""}return n}function wl(n){return Promise.all(n.map(e=>e.catch(t=>t)))}function Iy(n,e){let t;return window.trustedTypes&&(t=window.trustedTypes.createPolicy(n,e)),t}function vy(n,e){const t=Iy("firebase-js-sdk-policy",{createScriptURL:wy}),i=document.createElement("script"),s=`${ar}?l=${n}&id=${e}`;i.src=t?t?.createScriptURL(s):s,i.async=!0,document.head.appendChild(i)}function Ey(n){let e=[];return Array.isArray(window[n])?e=window[n]:window[n]=e,e}async function Ty(n,e,t,i,s,r){const o=i[s];try{if(o)await e[o];else{const c=(await wl(t)).find(l=>l.measurementId===s);c&&await e[c.appId]}}catch(a){q.error(a)}n("config",s,r)}async function Cy(n,e,t,i,s){try{let r=[];if(s&&s.send_to){let o=s.send_to;Array.isArray(o)||(o=[o]);const a=await wl(t);for(const c of o){const l=a.find(h=>h.measurementId===c),u=l&&e[l.appId];if(u)r.push(u);else{r=[];break}}}r.length===0&&(r=Object.values(e)),await Promise.all(r),n("event",i,s||{})}catch(r){q.error(r)}}function by(n,e,t,i){async function s(r,...o){try{if(r==="event"){const[a,c]=o;await Cy(n,e,t,a,c)}else if(r==="config"){const[a,c]=o;await Ty(n,e,t,i,a,c)}else if(r==="consent"){const[a,c]=o;n("consent",a,c)}else if(r==="get"){const[a,c,l]=o;n("get",a,c,l)}else if(r==="set"){const[a]=o;n("set",a)}else n(r,...o)}catch(a){q.error(a)}}return s}function Sy(n,e,t,i,s){let r=function(...o){window[i].push(arguments)};return window[s]&&typeof window[s]=="function"&&(r=window[s]),window[s]=by(r,n,e,t),{gtagCore:r,wrappedGtag:window[s]}}function Ry(n){const e=window.document.getElementsByTagName("script");for(const t of Object.values(e))if(t.src&&t.src.includes(ar)&&t.src.includes(n))return t;return null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ky=30,Ay=1e3;class Py{constructor(e={},t=Ay){this.throttleMetadata=e,this.intervalMillis=t}getThrottleMetadata(e){return this.throttleMetadata[e]}setThrottleMetadata(e,t){this.throttleMetadata[e]=t}deleteThrottleMetadata(e){delete this.throttleMetadata[e]}}const Il=new Py;function Ny(n){return new Headers({Accept:"application/json","x-goog-api-key":n})}async function Oy(n){const{appId:e,apiKey:t}=n,i={method:"GET",headers:Ny(t)},s=my.replace("{app-id}",e),r=await fetch(s,i);if(r.status!==200&&r.status!==304){let o="";try{const a=await r.json();a.error?.message&&(o=a.error.message)}catch{}throw X.create("config-fetch-failed",{httpStatus:r.status,responseMessage:o})}return r.json()}async function Dy(n,e=Il,t){const{appId:i,apiKey:s,measurementId:r}=n.options;if(!i)throw X.create("no-app-id");if(!s){if(r)return{measurementId:r,appId:i};throw X.create("no-api-key")}const o=e.getThrottleMetadata(i)||{backoffCount:0,throttleEndTimeMillis:Date.now()},a=new xy;return setTimeout(async()=>{a.abort()},gy),vl({appId:i,apiKey:s,measurementId:r},o,a,e)}async function vl(n,{throttleEndTimeMillis:e,backoffCount:t},i,s=Il){const{appId:r,measurementId:o}=n;try{await Ly(i,e)}catch(a){if(o)return q.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${o} provided in the "measurementId" field in the local Firebase config. [${a?.message}]`),{appId:r,measurementId:o};throw a}try{const a=await Oy(n);return s.deleteThrottleMetadata(r),a}catch(a){const c=a;if(!My(c)){if(s.deleteThrottleMetadata(r),o)return q.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${o} provided in the "measurementId" field in the local Firebase config. [${c?.message}]`),{appId:r,measurementId:o};throw a}const l=Number(c?.customData?.httpStatus)===503?hr(t,s.intervalMillis,ky):hr(t,s.intervalMillis),u={throttleEndTimeMillis:Date.now()+l,backoffCount:t+1};return s.setThrottleMetadata(r,u),q.debug(`Calling attemptFetch again in ${l} millis`),vl(n,u,i,s)}}function Ly(n,e){return new Promise((t,i)=>{const s=Math.max(e-Date.now(),0),r=setTimeout(t,s);n.addEventListener(()=>{clearTimeout(r),i(X.create("fetch-throttle",{throttleEndTimeMillis:e}))})})}function My(n){if(!(n instanceof le)||!n.customData)return!1;const e=Number(n.customData.httpStatus);return e===429||e===500||e===503||e===504}class xy{constructor(){this.listeners=[]}addEventListener(e){this.listeners.push(e)}abort(){this.listeners.forEach(e=>e())}}async function Uy(n,e,t,i,s){if(s&&s.global){n("event",t,i);return}else{const r=await e,o={...i,send_to:r};n("event",t,o)}}async function Fy(n,e,t,i){if(i&&i.global){const s={};for(const r of Object.keys(t))s[`user_properties.${r}`]=t[r];return n("set",s),Promise.resolve()}else{const s=await e;n("config",s,{update:!0,user_properties:t})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Wy(){if(os())try{await as()}catch(n){return q.warn(X.create("indexeddb-unavailable",{errorInfo:n?.toString()}).message),!1}else return q.warn(X.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function By(n,e,t,i,s,r,o){const a=Dy(n);a.then(d=>{t[d.measurementId]=d.appId,n.options.measurementId&&d.measurementId!==n.options.measurementId&&q.warn(`The measurement ID in the local Firebase config (${n.options.measurementId}) does not match the measurement ID fetched from the server (${d.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(d=>q.error(d)),e.push(a);const c=Wy().then(d=>{if(d)return i.getId()}),[l,u]=await Promise.all([a,c]);Ry(r)||vy(r,l.measurementId),s("js",new Date);const h=o?.config??{};return h[_y]="firebase",h.update=!0,u!=null&&(h[py]=u),s("config",l.measurementId,h),l.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hy{constructor(e){this.app=e}_delete(){return delete ft[this.app.options.appId],Promise.resolve()}}let ft={},bo=[];const So={};let Di="dataLayer",$y="gtag",Ro,cr,ko=!1;function Vy(){const n=[];if(rs()&&n.push("This is a browser extension environment."),$o()||n.push("Cookies are not available."),n.length>0){const e=n.map((i,s)=>`(${s+1}) ${i}`).join(" "),t=X.create("invalid-analytics-context",{errorInfo:e});q.warn(t.message)}}function qy(n,e,t){Vy();const i=n.options.appId;if(!i)throw X.create("no-app-id");if(!n.options.apiKey)if(n.options.measurementId)q.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${n.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw X.create("no-api-key");if(ft[i]!=null)throw X.create("already-exists",{id:i});if(!ko){Ey(Di);const{wrappedGtag:r,gtagCore:o}=Sy(ft,bo,So,Di,$y);cr=r,Ro=o,ko=!0}return ft[i]=By(n,bo,So,e,Ro,Di,t),new Hy(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mw(n=Jn()){n=k(n);const e=Be(n,zn);return e.isInitialized()?e.getImmediate():jy(n)}function jy(n,e={}){const t=Be(n,zn);if(t.isInitialized()){const s=t.getImmediate();if(xe(e,t.getOptions()))return s;throw X.create("already-initialized")}return t.initialize({options:e})}async function yw(){if(rs()||!$o()||!os())return!1;try{return await as()}catch{return!1}}function Gy(n,e,t){n=k(n),Fy(cr,ft[n.app.options.appId],e,t).catch(i=>q.error(i))}function zy(n,e,t,i){n=k(n),Uy(cr,ft[n.app.options.appId],e,t,i).catch(s=>q.error(s))}const Ao="@firebase/analytics",Po="0.10.25";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ky(){ce(new ee(zn,(e,{options:t})=>{const i=e.getProvider("app").getImmediate(),s=e.getProvider("installations-internal").getImmediate();return qy(i,s,t)},"PUBLIC")),ce(new ee("analytics-internal",n,"PRIVATE")),Q(Ao,Po),Q(Ao,Po,"esm2020");function n(e){try{const t=e.getProvider(zn).getImmediate();return{logEvent:(i,s,r)=>zy(t,i,s,r),setUserProperties:(i,s)=>Gy(t,i,s)}}catch(t){throw X.create("interop-component-reg-failed",{reason:t})}}}Ky();export{Ae as G,Jn as a,hw as b,nw as c,gw as d,yw as e,mw as f,Qy as g,ow as h,Mu as i,iw as j,uw as k,sw as l,rw as m,ew as n,cw as o,Kf as p,Xy as q,Jy as r,lw as s,tw as t,aw as u,Zy as v,_w as w,pw as x,dw as y,fw as z};
