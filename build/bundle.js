var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function c(t){t.forEach(e)}function o(t){return"function"==typeof t}function r(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function s(t,e){t.appendChild(e)}function l(t,e,n){t.insertBefore(e,n||null)}function i(t){t.parentNode.removeChild(t)}function u(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function a(t){return document.createElement(t)}function h(t){return document.createTextNode(t)}function f(){return h(" ")}function d(t,e,n,c){return t.addEventListener(e,n,c),()=>t.removeEventListener(e,n,c)}function p(t){return function(e){return e.preventDefault(),t.call(this,e)}}function g(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function m(t,e,n){const c=new Set;for(let e=0;e<t.length;e+=1)t[e].checked&&c.add(t[e].__value);return n||c.delete(e),Array.from(c)}function _(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function v(t,e){t.value=null==e?"":e}function $(t,e,n){t.classList[n?"add":"remove"](e)}class b{constructor(t=null){this.a=t,this.e=this.n=null}m(t,e,n=null){this.e||(this.e=a(e.nodeName),this.t=e,this.h(t)),this.i(n)}h(t){this.e.innerHTML=t,this.n=Array.from(this.e.childNodes)}i(t){for(let e=0;e<this.n.length;e+=1)l(this.t,this.n[e],t)}p(t){this.d(),this.h(t),this.i(this.a)}d(){this.n.forEach(i)}}let x;function k(t){x=t}const w=[],y=[],O=[],S=[],A=Promise.resolve();let q=!1;function C(t){O.push(t)}let E=!1;const N=new Set;function j(){if(!E){E=!0;do{for(let t=0;t<w.length;t+=1){const e=w[t];k(e),J(e.$$)}for(k(null),w.length=0;y.length;)y.pop()();for(let t=0;t<O.length;t+=1){const e=O[t];N.has(e)||(N.add(e),e())}O.length=0}while(w.length);for(;S.length;)S.pop()();q=!1,E=!1,N.clear()}}function J(t){if(null!==t.fragment){t.update(),c(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(C)}}const L=new Set;function M(t,e){t&&t.i&&(L.delete(t),t.i(e))}function z(t,n,r,s){const{fragment:l,on_mount:i,on_destroy:u,after_update:a}=t.$$;l&&l.m(n,r),s||C((()=>{const n=i.map(e).filter(o);u?u.push(...n):c(n),t.$$.on_mount=[]})),a.forEach(C)}function I(t,e){const n=t.$$;null!==n.fragment&&(c(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function T(t,e){-1===t.$$.dirty[0]&&(w.push(t),q||(q=!0,A.then(j)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function D(e,o,r,s,l,u,a=[-1]){const h=x;k(e);const f=e.$$={fragment:null,ctx:null,props:u,update:t,not_equal:l,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(h?h.$$.context:o.context||[]),callbacks:n(),dirty:a,skip_bound:!1};let d=!1;if(f.ctx=r?r(e,o.props||{},((t,n,...c)=>{const o=c.length?c[0]:n;return f.ctx&&l(f.ctx[t],f.ctx[t]=o)&&(!f.skip_bound&&f.bound[t]&&f.bound[t](o),d&&T(e,t)),n})):[],f.update(),d=!0,c(f.before_update),f.fragment=!!s&&s(f.ctx),o.target){if(o.hydrate){const t=function(t){return Array.from(t.childNodes)}(o.target);f.fragment&&f.fragment.l(t),t.forEach(i)}else f.fragment&&f.fragment.c();o.intro&&M(e.$$.fragment),z(e,o.target,o.anchor,o.customElement),j()}k(h)}class B{$destroy(){I(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function P(t,e,n){const c=t.slice();return c[10]=e[n],c[11]=e,c[12]=n,c}function R(t,e,n){const c=t.slice();return c[13]=e[n],c}function U(t){let e,n;return{c(){e=a("img"),e.src!==(n=t[10].img_link)&&g(e,"src",n),g(e,"alt","無法顯示圖片"),g(e,"class","svelte-12qzhp3")},m(t,n){l(t,e,n)},p(t,c){1&c&&e.src!==(n=t[10].img_link)&&g(e,"src",n)},d(t){t&&i(e)}}}function H(t){let e,n,c,o,r,u,h,p=t[10].choices[t[13]].text+"";function m(){t[8].call(n,t[11],t[12])}return t[9][0][t[12]]=[],{c(){e=a("label"),n=a("input"),o=f(),g(n,"type","radio"),n.__value=c=t[13],n.value=n.__value,t[9][0][t[12]].push(n),r=new b(null),g(e,"class","svelte-12qzhp3"),$(e,"showing","currentAnswer"in t[10]),$(e,"correct",t[10].choices[t[13]].is_correct),$(e,"incorrect",!t[10].choices[t[13]].is_correct)},m(c,i){l(c,e,i),s(e,n),n.checked=n.__value===t[10].currentAnswer,s(e,o),r.m(p,e),u||(h=d(n,"change",m),u=!0)},p(o,s){t=o,1&s&&c!==(c=t[13])&&(n.__value=c,n.value=n.__value),1&s&&(n.checked=n.__value===t[10].currentAnswer),1&s&&p!==(p=t[10].choices[t[13]].text+"")&&r.p(p),1&s&&$(e,"showing","currentAnswer"in t[10]),1&s&&$(e,"correct",t[10].choices[t[13]].is_correct),1&s&&$(e,"incorrect",!t[10].choices[t[13]].is_correct)},d(c){c&&i(e),t[9][0][t[12]].splice(t[9][0][t[12]].indexOf(n),1),u=!1,h()}}}function F(t){let e,n,o,r,p,m,$,b,x,k,w,y,O,S,A,q,C,E=t[10].session+"",N=t[10].no+"",j=t[10].question+"";function J(){t[6].call($,t[11],t[12])}function L(){return t[7](t[10],t[11],t[12])}let M=t[10].img_link&&U(t),z=t[10].choicesOrder,I=[];for(let e=0;e<z.length;e+=1)I[e]=H(R(t,z,e));return{c(){e=a("div"),n=a("p"),o=h(E),r=h(" 第"),p=h(N),m=h("題 \n              "),$=a("input"),b=f(),x=a("button"),x.textContent="Clear answer",k=f(),w=a("p"),y=h(j),O=f(),M&&M.c(),S=f();for(let t=0;t<I.length;t+=1)I[t].c();A=f(),g(x,"class","svelte-12qzhp3"),g(e,"class","svelte-12qzhp3")},m(c,i){l(c,e,i),s(e,n),s(n,o),s(n,r),s(n,p),s(n,m),s(n,$),v($,t[10].tagString),s(n,b),s(n,x),s(e,k),s(e,w),s(w,y),s(e,O),M&&M.m(e,null),s(e,S);for(let t=0;t<I.length;t+=1)I[t].m(e,null);s(e,A),q||(C=[d($,"input",J),d(x,"click",L)],q=!0)},p(n,c){if(t=n,1&c&&E!==(E=t[10].session+"")&&_(o,E),1&c&&N!==(N=t[10].no+"")&&_(p,N),1&c&&$.value!==t[10].tagString&&v($,t[10].tagString),1&c&&j!==(j=t[10].question+"")&&_(y,j),t[10].img_link?M?M.p(t,c):(M=U(t),M.c(),M.m(e,S)):M&&(M.d(1),M=null),1&c){let n;for(z=t[10].choicesOrder,n=0;n<z.length;n+=1){const o=R(t,z,n);I[n]?I[n].p(o,c):(I[n]=H(o),I[n].c(),I[n].m(e,A))}for(;n<I.length;n+=1)I[n].d(1);I.length=z.length}},d(t){t&&i(e),M&&M.d(),u(I,t),q=!1,c(C)}}}function G(e){let n,c,o,r,g,m,v,$,b,x,k,w,y,O,S,A=e[0].length+"",q=e[0],C=[];for(let t=0;t<q.length;t+=1)C[t]=F(P(e,q,t));return{c(){n=a("main"),c=a("form"),o=a("p"),r=h("共"),g=h(A),m=h("題，已作答"),v=h(e[1]),$=h("題，答對"),b=h(e[2]),x=h(" ("),k=h(e[3]),w=h("%)"),y=f();for(let t=0;t<C.length;t+=1)C[t].c()},m(t,i){l(t,n,i),s(n,c),s(c,o),s(o,r),s(o,g),s(o,m),s(o,v),s(o,$),s(o,b),s(o,x),s(o,k),s(o,w),s(c,y);for(let t=0;t<C.length;t+=1)C[t].m(c,null);O||(S=d(c,"submit",p(e[5])),O=!0)},p(t,[e]){if(1&e&&A!==(A=t[0].length+"")&&_(g,A),2&e&&_(v,t[1]),4&e&&_(b,t[2]),8&e&&_(k,t[3]),1&e){let n;for(q=t[0],n=0;n<q.length;n+=1){const o=P(t,q,n);C[n]?C[n].p(o,e):(C[n]=F(o),C[n].c(),C[n].m(c,null))}for(;n<C.length;n+=1)C[n].d(1);C.length=q.length}},i:t,o:t,d(t){t&&i(n),u(C,t),O=!1,S()}}}function K(t,e,n){let c,o,r,s,{questions:l}=e;return t.$$set=t=>{"questions"in t&&n(0,l=t.questions)},t.$$.update=()=>{1&t.$$.dirty&&n(4,c=l.filter((t=>"currentAnswer"in t))),16&t.$$.dirty&&n(1,o=c.length),16&t.$$.dirty&&n(2,r=c.filter((t=>t.choices[t.currentAnswer].is_correct)).length),6&t.$$.dirty&&n(3,s=0==o?0:Math.round(100*r/o))},[l,o,r,s,c,function(e){!function(t,e){const n=t.$$.callbacks[e.type];n&&n.slice().forEach((t=>t(e)))}(t,e)},function(t,e){t[e].tagString=this.value,n(0,l)},(t,e,c)=>{delete t.currentAnswer,n(0,e[c]=t,l)},function(t,e){t[e].currentAnswer=this.__value,n(0,l)},[[]]]}class Q extends B{constructor(t){super(),D(this,t,K,G,r,{questions:0})}}function V(t){for(var e,n,c=t.length;0!==c;)n=Math.floor(Math.random()*c),e=t[c-=1],t[c]=t[n],t[n]=e;return t}function W(t,e,n){const c=t.slice();return c[22]=e[n],c}function X(t,e,n){const c=t.slice();return c[25]=e[n],c}function Y(t){let e,n,c,o,r,u,p,m,v=t[25]+"";return{c(){e=a("label"),n=a("input"),o=f(),r=h(v),u=f(),g(n,"type","checkbox"),n.__value=c=t[25],n.value=n.__value,t[15][1].push(n),g(e,"class","svelte-1320eoh")},m(c,i){l(c,e,i),s(e,n),n.checked=~t[2].indexOf(n.__value),s(e,o),s(e,r),s(e,u),p||(m=d(n,"change",t[14]),p=!0)},p(t,e){1&e&&c!==(c=t[25])&&(n.__value=c,n.value=n.__value),4&e&&(n.checked=~t[2].indexOf(n.__value)),1&e&&v!==(v=t[25]+"")&&_(r,v)},d(c){c&&i(e),t[15][1].splice(t[15][1].indexOf(n),1),p=!1,m()}}}function Z(t){let e,n,c,o,r,u,p,m,v=t[22]+"";return{c(){e=a("label"),n=a("input"),o=f(),r=h(v),u=f(),g(n,"type","checkbox"),n.__value=c=t[22],n.value=n.__value,t[15][0].push(n)},m(c,i){l(c,e,i),s(e,n),n.checked=~t[3].indexOf(n.__value),s(e,o),s(e,r),s(e,u),p||(m=d(n,"change",t[16]),p=!0)},p(t,e){2&e&&c!==(c=t[22])&&(n.__value=c,n.value=n.__value),8&e&&(n.checked=~t[3].indexOf(n.__value)),2&e&&v!==(v=t[22]+"")&&_(r,v)},d(c){c&&i(e),t[15][0].splice(t[15][0].indexOf(n),1),p=!1,m()}}}function tt(t){let e,n,o,r,m,_,$,b,x,k,w,y,O,S,A,q,C,E,N,j,J,T,D,B,P,R,U,H,F,G,K,V,tt,et,nt,ct,ot,rt,st,lt,it,ut,at=t[0],ht=[];for(let e=0;e<at.length;e+=1)ht[e]=Y(X(t,at,e));let ft=t[1],dt=[];for(let e=0;e<ft.length;e+=1)dt[e]=Z(W(t,ft,e));return st=new Q({props:{questions:t[4]}}),{c(){e=a("main"),n=a("h1"),n.textContent="二階國考題庫",o=f(),r=a("form"),m=a("div");for(let t=0;t<ht.length;t+=1)ht[t].c();_=f(),$=a("div");for(let t=0;t<dt.length;t+=1)dt[t].c();var t;b=f(),x=a("button"),x.textContent="Start",k=f(),w=a("label"),y=a("input"),O=h("\n      隨機排序題目"),S=f(),A=a("label"),q=a("input"),C=h("\n      隨機排序答案"),E=f(),N=a("button"),N.textContent="Clear All On Page Answer",j=f(),J=a("button"),J.textContent="Clear All Answer",T=f(),D=a("details"),B=a("summary"),B.textContent="說明與進階功能",P=f(),R=a("p"),R.textContent="重新整理會直接重置所有紀錄。",U=f(),H=a("p"),H.textContent="科目欄位實際上是 Tag 欄位，可以自行編輯來符合自己需要，以空白鍵分隔關鍵字（如提醒自己該題「重要」等），下一次按下 Start 便會更新篩選表。但網頁重新整理後仍舊會消失，僅供暫時紀錄。",F=f(),G=a("p"),G.textContent="下方 Download JSON 按鈕可以下載修改過後的題庫，但不包括作答記錄。",K=f(),V=a("button"),V.textContent="Download JSON",tt=f(),et=a("div"),nt=a("input"),ct=f(),ot=a("button"),ot.textContent="Append JSON",rt=f(),(t=st.$$.fragment)&&t.c(),g(n,"class","svelte-1320eoh"),g(m,"class","tags-list svelte-1320eoh"),g($,"class","session-list"),g(x,"type","submit"),g(x,"class","svelte-1320eoh"),g(y,"type","checkbox"),g(q,"type","checkbox"),g(N,"class","svelte-1320eoh"),g(J,"class","svelte-1320eoh"),g(V,"class","svelte-1320eoh"),g(nt,"type","textarea"),g(ot,"class","svelte-1320eoh"),g(D,"class","svelte-1320eoh"),g(r,"class","question-selection svelte-1320eoh"),g(e,"class","svelte-1320eoh")},m(c,i){l(c,e,i),s(e,n),s(e,o),s(e,r),s(r,m);for(let t=0;t<ht.length;t+=1)ht[t].m(m,null);s(r,_),s(r,$);for(let t=0;t<dt.length;t+=1)dt[t].m($,null);s(r,b),s(r,x),s(r,k),s(r,w),s(w,y),y.checked=t[5],s(w,O),s(r,S),s(r,A),s(A,q),q.checked=t[6],s(A,C),s(r,E),s(r,N),s(r,j),s(r,J),s(r,T),s(r,D),s(D,B),s(D,P),s(D,R),s(D,U),s(D,H),s(D,F),s(D,G),s(D,K),s(D,V),s(D,tt),s(D,et),s(et,nt),v(nt,t[7]),s(et,ct),s(et,ot),s(e,rt),z(st,e,null),lt=!0,it||(ut=[d(y,"change",t[17]),d(q,"change",t[18]),d(N,"click",p(t[11])),d(J,"click",p(t[12])),d(V,"click",p(t[9])),d(nt,"input",t[19]),d(ot,"click",p(t[10])),d(r,"submit",p(t[8]))],it=!0)},p(t,[e]){if(5&e){let n;for(at=t[0],n=0;n<at.length;n+=1){const c=X(t,at,n);ht[n]?ht[n].p(c,e):(ht[n]=Y(c),ht[n].c(),ht[n].m(m,null))}for(;n<ht.length;n+=1)ht[n].d(1);ht.length=at.length}if(10&e){let n;for(ft=t[1],n=0;n<ft.length;n+=1){const c=W(t,ft,n);dt[n]?dt[n].p(c,e):(dt[n]=Z(c),dt[n].c(),dt[n].m($,null))}for(;n<dt.length;n+=1)dt[n].d(1);dt.length=ft.length}32&e&&(y.checked=t[5]),64&e&&(q.checked=t[6]),128&e&&v(nt,t[7]);const n={};16&e&&(n.questions=t[4]),st.$set(n)},i(t){lt||(M(st.$$.fragment,t),lt=!0)},o(t){!function(t,e,n,c){if(t&&t.o){if(L.has(t))return;L.add(t),(void 0).c.push((()=>{L.delete(t),c&&(n&&t.d(1),c())})),t.o(e)}}(st.$$.fragment,t),lt=!1},d(t){t&&i(e),u(ht,t),u(dt,t),I(st),it=!1,c(ut)}}}function et(t,e,n){let c,o,r=[],s=[],l=[],i=[],u=!1,a=!1;const h=["心臟內科","胸腔內科","腸胃肝膽科","腎臟科","免疫風濕科","血液科","腫瘤科","感染科","新陳代謝科","家庭醫學科","醫學倫理","神經內科","精神科","產科","婦科","婦女生殖內分泌","婦女泌尿","皮膚科","小兒科(心臟血管、呼吸、消化、神經與內分泌系統)","小兒科(感染科學、腎臟疾病與過敏免疫疾病)","小兒科(血液學、腫瘤學、遺傳學與新生兒科)","外科概論及創傷外科","腦神經外科","心臟血管外科","胸腔外科","重建整型外科","腸胃肝膽胰外科","大腸直腸外科","內分泌及乳房外科","小兒外科","眼科","耳鼻喉科","骨科","泌尿外科","復健科","麻醉科"];fetch("./qbank.json").then((t=>t.json())).then((function(t){n(13,r=t),r.map((function(t){}))}));let f="";const d=[[],[]];return t.$$.update=()=>{8192&t.$$.dirty&&n(0,c=[...new Set(r.map((t=>t.tagString.split(" "))).flat())].sort(((t,e)=>{const n=h.indexOf(t),c=h.indexOf(e);return n>=0&&c>=0?n>c:n<0&&c<0?t>e:n<0}))),8192&t.$$.dirty&&n(1,o=[...new Set(r.map((t=>t.session)))].sort(((t,e)=>parseInt(t)>parseInt(e))))},[c,o,s,l,i,u,a,f,function(){n(4,i=function(t){const{tagsSelected:e,sessionsSelected:n}=t;return console.log(`tags (${e})`),console.log(`sessions (${n})`),r.filter((t=>e.some((e=>t.tagString.split(" ").includes(e))))).filter((t=>n.includes(t.session))).sort(((t,e)=>parseInt(t.no)>parseInt(e.no)))}({tagsSelected:s,sessionsSelected:l})),u&&V(i),n(4,i=i.map((t=>(t.choicesOrder=[...Array(t.choices.length).keys()],a&&V(t.choicesOrder),t)))),n(13,r)},function(){let t=JSON.parse(JSON.stringify(r));t=t.map((function(t){return delete t.currentAnswer,delete t.choicesOrder,t})),t=t.map((function(t){return t.tagString=t.tagString,t})),function(t,e){const n=new Blob([e],{type:"text/json"}),c=document.createElement("a");c.download=t,c.href=window.URL.createObjectURL(n),c.dataset.downloadurl=["text/json",c.download,c.href].join(":");const o=new MouseEvent("click",{view:window,bubbles:!0,cancelable:!0});c.dispatchEvent(o),c.remove()}("qbank.json",JSON.stringify(t))},function(){let t=JSON.parse(f);t.map((function(t){})),n(13,r=r.concat(t))},function(){i.map((function(t){"currentAnswer"in t&&delete t.currentAnswer})),n(4,i)},function(){r.map((function(t){"currentAnswer"in t&&delete t.currentAnswer})),n(13,r),n(4,i)},r,function(){s=m(d[1],this.__value,this.checked),n(2,s)},d,function(){l=m(d[0],this.__value,this.checked),n(3,l)},function(){u=this.checked,n(5,u)},function(){a=this.checked,n(6,a)},function(){f=this.value,n(7,f)}]}return new class extends B{constructor(t){super(),D(this,t,et,tt,r,{})}}({target:document.body,props:{}})}();
//# sourceMappingURL=bundle.js.map
