const time = document.getElementById("time");
const date = document.getElementById("date");
const memo = document.getElementById("memo");

function updateClock(){

const now=new Date();

time.innerHTML=now.toLocaleTimeString("zh-TW",{

hour:"2-digit",
minute:"2-digit",
second:"2-digit"

});

date.innerHTML=now.toLocaleDateString("zh-TW",{

year:"numeric",
month:"2-digit",
day:"2-digit",
weekday:"long"

});

}

updateClock();

setInterval(updateClock,1000);

memo.value=localStorage.getItem("memo")||"";

memo.oninput=function(){

localStorage.setItem("memo",memo.value);

}

for(let i=1;i<=4;i++){

let cb=document.getElementById("c"+i);

cb.checked=localStorage.getItem("todo"+i)=="true";

cb.onchange=function(){

localStorage.setItem("todo"+i,cb.checked);

}

}