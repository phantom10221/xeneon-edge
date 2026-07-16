const memo=document.getElementById("memo");memo.value=localStorage.memo||"";memo.oninput=()=>localStorage.memo=memo.value;
let tasks=JSON.parse(localStorage.tasks||'["FF14","剪影片","買貓飼料"]');
const box=document.getElementById("tasks");
function render(){box.innerHTML="";tasks.forEach((t,i)=>{let l=document.createElement("label");let c=document.createElement("input");c.type="checkbox";c.checked=!!t.done;c.onchange=()=>{tasks[i]={text:t.text||t,done:c.checked};save()};l.append(c," ",t.text||t);box.append(l);});}
function save(){localStorage.tasks=JSON.stringify(tasks);render()}
document.getElementById("add").onclick=()=>{let t=prompt("待辦內容");if(t){tasks.push({text:t,done:false});save();}}
function tick(){let d=new Date();time.textContent=d.toLocaleTimeString("zh-TW");date.textContent=d.toLocaleDateString("zh-TW",{weekday:"long",year:"numeric",month:"2-digit",day:"2-digit"});}
tick();setInterval(tick,1000);render();