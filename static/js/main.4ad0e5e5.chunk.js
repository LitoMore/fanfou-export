(this["webpackJsonpfanfou-export"]=this["webpackJsonpfanfou-export"]||[]).push([[0],{251:function(e,t,a){e.exports=a.p+"static/media/Zpix.783bb457.ttf"},253:function(e,t,a){e.exports=a(447)},277:function(e,t){},279:function(e,t){},320:function(e,t){},321:function(e,t){},446:function(e,t,a){},447:function(e,t,a){"use strict";a.r(t);var n=a(6),r=a.n(n),o=a(232),c=a.n(o),s=a(44),l=a(11),i=a.n(l),u=a(25),m=a(29),p=a(33),f=a(69),h=a(99),g=a(233),d=a.n(g),b=a(56),y=a.n(b),k=a(234),E=new(a(252).a)({consumerKey:"7008b986b162eb6ed2db8f50f26bc03e",consumerSecret:"0caea751b828756dca59a8ea7330384b",apiDomain:"api.fanfou.com",oauthDomain:"fanfou.com",protocol:"https:",hooks:{baseString:function(e){return e.replace("https","http")}}}),v=a(86),x=a.n(v),S=a(237),T=a.n(S),w=a(238),_=a.n(w),C=function(e,t){var a=new Blob([e],{type:"text/plain;charset=utf-8"});_.a.saveAs(a,t)},O=function(e){var t=e.map((function(e){var t,a="[".concat(e.user.screen_name,"]"),n="",r=Object(s.a)(e.txt);try{for(r.s();!(t=r.n()).done;){var o=t.value;switch(o.type){case"at":n+="".concat(o.text,":").concat(o.id);break;case"link":n+=o.text;break;case"tag":default:n+=o._text}}}catch(i){r.e(i)}finally{r.f()}if(e.photo){var c="\u56fe:".concat(e.photo.originurl);n+=n.length>0?" ".concat(c):c}var l=x()(new Date(e.created_at)).local().format("YYYY-MM-DD HH:mm:ss");return"".concat(a," ").concat(n," ").concat(l)})).join("\n");C(t,"backup.txt")},N=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"CSV",a=e.map((function(e){var t,a=e.user.screen_name,n=e.photo?e.photo.originurl:"",r=x()(new Date(e.created_at)).local().format("YYYY-MM-DD HH:mm:ss"),o="",c=Object(s.a)(e.txt);try{for(c.s();!(t=c.n()).done;){var l=t.value;switch(l.type){case"at":o+="".concat(l.text,":").concat(l.id);break;case"link":o+=l.text;break;case"tag":default:o+=l._text}}}catch(i){c.e(i)}finally{c.f()}return{ID:a,"\u6d88\u606f\u5185\u5bb9":o,"\u56fe\u7247":n,"\u65f6\u95f4":r}})),n=",";"TSV"===t&&(n="\t");var r=T.a.unparse(a,{delimiter:n,header:!0});C(r,"backup."+t.toLowerCase())},j=function(e){N(e,"TSV")},D=function(e){var t=e.map((function(e){return delete e.txt,delete e.user,e})),a=JSON.stringify(t,null,2);C(a,"backup.json")},I=function(e){var t="| \u996d\u5426\u6d88\u606f\u5907\u4efd |\n| :-- |\n"+e.map((function(e){var t,a=e.photo?e.photo.originurl:"",n=x()(new Date(e.created_at)).local().format("YYYY-MM-DD HH:mm:ss"),r="",o=Object(s.a)(e.txt);try{for(o.s();!(t=o.n()).done;){var c=t.value;switch(c.type){case"at":r+='<a href="https://fanfou.com/'.concat(c.id,'">').concat(c.text,"</a>");break;case"link":r+='<a href="'.concat(c.text,'">').concat(c.text,"</a>");break;case"tag":r+='<a href="https://fanfou.com/q/'.concat(c.query,'">').concat(c._text.replace(/\n/g," "),"</a>");break;default:r+=c._text.replace(/\n/g," ")}}}catch(l){o.e(l)}finally{o.f()}return"| <div>".concat(r,"</div>").concat(a?'<div align="right"><a href="'.concat(a,'"><img width="100px" src="').concat(a,'"/></a></div>'):"",' <div align="right">').concat(n," \u901a\u8fc7 ").concat(e.source_url?'<a href="'.concat(e.source_url,'">').concat(e.source_name,"</a>"):e.source_name,"</div> |")})).join("\n");C(t,"backup.md")},M=a(31),Y=a(30),A=a(251),F=a.n(A);Y.b.register({family:"Zpix",src:F.a});var P=Y.g.create({body:{paddingTop:35,paddingBottom:65,paddingHorizontal:35,fontFamily:"Zpix"},status:{margin:5,fontSize:12},text:{lineHeight:1.5},time:{fontSize:12,lineHeight:1.5,textAlign:"right"},link:{color:"#00ccff"},image:{width:100,marginLeft:"auto",marginRight:0,marginBottom:10},header:{fontSize:12,marginBottom:20,textAlign:"center",color:"grey"},pageNumber:{position:"absolute",fontSize:12,bottom:30,left:0,right:0,textAlign:"center",color:"grey"}}),R=function(e){var t=e.status;return t.txt.map((function(e,a){switch(e.type){case"at":return r.a.createElement(Y.d,{key:"at-".concat(t.id,"-").concat(String(a)),style:Object(M.a)(Object(M.a)({},P.text),P.link),src:"https://fanfou.com/".concat(e.id)},e.text);case"link":return r.a.createElement(Y.d,{key:"link-".concat(t.id,"-").concat(String(a)),style:Object(M.a)(Object(M.a)({},P.text),P.link),src:e.text},e.text);case"tag":return r.a.createElement(Y.d,{key:"tag-".concat(t.id,"-").concat(String(a)),style:Object(M.a)(Object(M.a)({},P.text),P.link),src:"https://fanfou.com/q/".concat(e.query)},e._text.replace(/\n/g," "));default:return r.a.createElement(Y.h,{key:"text-".concat(t.id,"-").concat(String(a)),style:P.text},e.text)}}))},V=function(e){var t=e.fullList;return r.a.createElement(Y.a,null,r.a.createElement(Y.f,{style:P.body},r.a.createElement(Y.h,{style:P.header},"\u996d\u5426\u6d88\u606f\u5907\u4efd"),t.map((function(e,t){return r.a.createElement(r.a.Fragment,{key:"status-".concat(e.id,"-").concat(String(t))},r.a.createElement(Y.h,{style:P.status},r.a.createElement(R,{status:e})),e.photo&&r.a.createElement(Y.d,{src:e.photo.originurl},r.a.createElement(Y.c,{style:P.image,src:e.photo.originurl})),r.a.createElement(Y.h,{style:P.time},"\u901a\u8fc7"," ",e.source_url?r.a.createElement(Y.d,{style:P.link,src:e.source_url},e.source_name):r.a.createElement(Y.h,{style:P.link},e.source_name)),r.a.createElement(Y.h,{style:P.time},x()(new Date(e.created_at)).local().format("YYYY-MM-DD HH:mm:ss")))}))))},H=function(e){var t=e.document,a=e.done;return r.a.createElement(Y.e,{document:t,fileName:"backup.pdf"},(function(e){e._blob,e._url;var t=e.loading;e._error;return a&&!t?r.a.createElement("button",{className:"nes-btn is-success",type:"button"},"\u5bfc\u51fa"):r.a.createElement("button",{disabled:!0,className:"nes-btn is-disabled",type:"button"},"\u6b63\u5728\u751f\u6210 PDF")}))},L=(a(445),a(446),[]),q=[],z={USER_TIMELINE:"\u6d88\u606f",FAVORITES:"\u6536\u85cf"},B={TXT:"TXT",CSV:"CSV",TSV:"TSV",JSON:"JSON",Markdown:"Markdown",PDF:"PDF"},J=function(e){Object(f.a)(a,e);var t=Object(h.a)(a);function a(){var e;Object(m.a)(this,a);for(var n=arguments.length,o=new Array(n),c=0;c<n;c++)o[c]=arguments[c];return(e=t.call.apply(t,[this].concat(o))).state={loged:!1,user:null,message:[],currentPage:0,pageCount:0,prevStatusCount:0,statusCount:0,done:!1,exportType:"TXT",dataType:"\u6d88\u606f"},e.goAuth=Object(u.a)(i.a.mark((function e(){var t;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,E.getRequestToken();case 2:t=e.sent,localStorage.setItem("requestTokenSecret",t.oauthTokenSecret),window.location.replace("https://fanfou.com/oauth/authorize?oauth_token=".concat(t.oauthToken,"&oauth_callback=").concat(window.location.href));case 5:case"end":return e.stop()}}),e)}))),e.getErroredPages=function(){return q},e.fetchStatuses=function(){var t=e.state,a=t.done,n=t.pageCount,r=t.dataType,o=z.USER_TIMELINE,c=z.FAVORITES;if(!a){var l=Array.from({length:n},(function(e,t){return t+1})),i="";switch(q.length>0&&(l=q,console.log("Retry pages",q)),r){case o:i="/statuses/user_timeline";break;case c:i="/favorites";break;default:return}k.a.eachLimit(l,6,(function(t,a){E.get(i,{page:t,count:60,format:"html"}).then((function(n){var r,o=L.length,c=Object(s.a)(n);try{for(c.s();!(r=c.n()).done;){var l=r.value;L.push(l)}}catch(i){c.e(i)}finally{c.f()}q=e.getErroredPages().filter((function(e){return e!==t})),e.setState((function(e){return{currentPage:e.currentPage+1,prevStatusCount:o,statusCount:L.length}}),a)})).catch((function(e){console.error("Page ".concat(t," errored"),e),q.push(t),a()}))}),(function(t){t&&console.error(t),L.sort((function(e,t){return t.rawid-e.rawid})),e.setState({done:0===e.getErroredPages().length},(function(){e.fetchStatuses()}))}))}},e.startAnalyze=function(){var t=e.state,a=t.user,n=t.dataType,r=0;switch(n){case z.USER_TIMELINE:r=a.statuses_count;break;case z.FAVORITES:r=a.favourites_count;break;default:return}var o=Math.ceil(r/60);e.setState((function(e){return{message:e.message.concat(["\u4f60\u6709 ".concat(o," \u9875\u9884\u8ba1 ").concat(r," \u6761").concat(n,"\u5f85\u5bfc\u51fa\uff0c"),"\u5f00\u59cb\u83b7\u53d6".concat(n,"..")]),pageCount:o}}),e.fetchStatuses)},e.exportTypes=function(){var t=e.state.exportType;return r.a.createElement(r.a.Fragment,null,r.a.createElement("p",null,"\u9009\u62e9\u5bfc\u51fa\u683c\u5f0f\uff1a"),r.a.createElement("p",null,Object.values(B).map((function(a){return r.a.createElement("label",{key:a,style:{marginRight:5}},r.a.createElement("input",{checked:t===a,value:a,type:"radio",className:"nes-radio",name:"export-type",onChange:e.onChangeExportType}),r.a.createElement("span",null,a))}))))},e.onChangeExportType=function(t){var a=t.currentTarget.value;e.setState({exportType:a})},e.onChangeDataType=function(t){if(0===e.state.message.length){var a=t.currentTarget.value;e.setState({dataType:a})}},e.doExport=function(){switch(e.state.exportType){case B.TXT:O(L);break;case B.CSV:N(L);break;case B.TSV:j(L);break;case B.JSON:D(L);break;case B.Markdown:I(L)}},e}return Object(p.a)(a,[{key:"componentDidMount",value:function(){var e=Object(u.a)(i.a.mark((function e(){var t,a,n,r,o,c,s,l,u;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t=window,!(a=t.location)||!a.search){e.next=16;break}if(this.setState({loged:!0}),n=y.a.parse(a.search),r=n.oauth_token,!(o=localStorage.getItem("requestTokenSecret"))){e.next=14;break}return e.next=9,E.getAccessToken({oauthToken:r,oauthTokenSecret:o});case 9:c=e.sent,localStorage.setItem("oauthToken",c.oauthToken),localStorage.setItem("oauthTokenSecret",c.oauthTokenSecret),localStorage.removeItem("requestTokenSecret"),window.location.replace(window.location.origin+window.location.pathname);case 14:e.next=26;break;case 16:if(s=localStorage.getItem("oauthToken"),l=localStorage.getItem("oauthTokenSecret"),!s||!l){e.next=26;break}return this.setState({loged:!0}),E.oauthToken=s,E.oauthTokenSecret=l,e.next=24,E.get("/users/show");case 24:u=e.sent,this.setState({user:u});case 26:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){var e=this,t=this.state,a=t.user,n=t.loged,o=t.dataType,c=t.message,s=t.currentPage,l=t.pageCount,i=t.prevStatusCount,u=t.statusCount,m=t.done,p=t.exportType,f=B.PDF;return r.a.createElement("div",null,r.a.createElement("div",{className:"nes-container with-title is-centered",style:{width:"90vw",maxWidth:800,margin:"40px auto 20px auto"}},r.a.createElement("p",{className:"title",style:{fontSize:24,margin:"-3rem auto 1rem"}},"\u996d\u5426\u6d88\u606f\u5907\u4efd\u5de5\u5177"),a?r.a.createElement(r.a.Fragment,null,r.a.createElement("p",null,"\u4f60\u597d\uff0c",r.a.createElement("img",{className:"nes-avatar is-small",alt:"avatar",src:a.profile_image_url,style:{imageRendering:"pixelated"}})," ",a.name,"\u3002"),r.a.createElement("p",null,"\u9009\u62e9\u4f60\u8981\u5907\u4efd\u7684\u5185\u5bb9\uff1a"),r.a.createElement("p",null,Object.values(z).map((function(t){return r.a.createElement("label",{key:t,style:{marginRight:5}},r.a.createElement("input",{checked:o===t,value:t,type:"radio",className:"nes-radio",name:"data-type",onChange:e.onChangeDataType}),r.a.createElement("span",null,t))}))),c.length>0?r.a.createElement(r.a.Fragment,null,c.map((function(e,t){return r.a.createElement("p",{key:String(t)},e)})),r.a.createElement("p",null,r.a.createElement("progress",{className:"nes-progress is-pattern",value:s,max:l})),r.a.createElement("p",null,"\u5b9e\u9645\u5df2\u83b7\u53d6"," ",r.a.createElement(d.a,{start:i,end:u,duration:m?1:3})," ","\u6761",o,"\u3002"),m&&r.a.createElement("p",null,"\u83b7\u53d6\u5b8c\u6bd5\u3002"),m&&this.exportTypes(),r.a.createElement("p",null,p===f?r.a.createElement(H,{done:m,document:r.a.createElement(V,{fullList:L})}):r.a.createElement("button",{className:"nes-btn ".concat(m?"is-success":"is-disabled"),disabled:!m,type:"button",onClick:this.doExport},"\u5bfc\u51fa")),r.a.createElement("button",{type:"button",className:"nes-btn",style:{position:"absolute",left:-4,bottom:-4},onClick:function(){window.location.reload()}},m?"\u8fd4\u56de":"\u505c\u6b62")):r.a.createElement("p",{className:"nes-pointer",onClick:this.startAnalyze},"> \u70b9\u51fb\u8fd9\u91cc\u5f00\u59cb\u5907\u4efd <"),r.a.createElement("button",{type:"button",className:"nes-btn is-error",style:{position:"absolute",right:-4,bottom:0},onClick:function(){localStorage.removeItem("oauthToken"),localStorage.removeItem("oauthTokenSecret"),window.location.reload()}},"\u9000\u51fa")):n?r.a.createElement("p",null,"\u6b63\u5728\u767b\u5f55.."):r.a.createElement("p",null,r.a.createElement("button",{type:"button",className:"nes-btn is-primary",onClick:this.goAuth},"\u767b\u5f55"))),r.a.createElement("p",{style:{textAlign:"center"}},r.a.createElement("span",{style:{fontWeight:700}},"<"),r.a.createElement("span",{style:{fontWeight:700,marginLeft:2}},">")," with ",r.a.createElement("a",{href:"https://fanfou.com/lito",target:"_blank",rel:"noopener noreferrer"},r.a.createElement("i",{className:"nes-icon is-small heart nes-pointer",style:{marginTop:-4,marginBottom:-4}}))," on ",r.a.createElement("a",{href:"https://github.com/LitoMore/fanfou-export",target:"_blank",rel:"noopener noreferrer"},r.a.createElement("i",{className:"nes-icon github is-small",style:{marginTop:-4,marginBottom:-4}}))))}}]),a}(r.a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||/^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/.test(window.location.hostname));function W(){return(W=Object(u.a)(i.a.mark((function e(){return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!("serviceWorker"in navigator)){e.next=5;break}return e.next=3,navigator.serviceWorker.ready;case 3:e.sent.unregister();case 5:case"end":return e.stop()}}),e)})))).apply(this,arguments)}c.a.render(r.a.createElement(J,null),document.querySelector("#root")),function(){W.apply(this,arguments)}()}},[[253,1,2]]]);
//# sourceMappingURL=main.4ad0e5e5.chunk.js.map