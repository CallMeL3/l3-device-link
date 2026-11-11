const views = [...document.querySelectorAll(".view")];
const navItems = [...document.querySelectorAll(".nav-item")];
const titleMap = {overview:"Your connected world.",devices:"Your devices.",transfer:"Move files with ease.",sharing:"Share your screen.",remote:"Remote control."};
function showView(name){
  views.forEach(v=>v.classList.toggle("active",v.id===name));
  navItems.forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  document.getElementById("page-title").textContent=titleMap[name]||titleMap.overview;
  document.getElementById("crumb").textContent=name.toUpperCase();
}
navItems.forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.go)));
const dialog=document.getElementById("pair-dialog");
["open-pair","hero-pair","device-pair","empty-pair"].forEach(id=>document.getElementById(id)?.addEventListener("click",()=>dialog.showModal()));
document.getElementById("generate-code").addEventListener("click",()=>{
  const code=String(Math.floor(100000+Math.random()*900000));
  document.getElementById("pair-code").textContent=code;
  document.getElementById("pair-feedback").textContent="Demo code generated locally. Real pairing is not connected yet.";
});
const input=document.getElementById("file-input"), list=document.getElementById("file-list"), drop=document.getElementById("drop-zone");
function prettySize(bytes){if(bytes<1024)return bytes+" B";if(bytes<1048576)return (bytes/1024).toFixed(1)+" KB";return (bytes/1048576).toFixed(1)+" MB";}
function addFiles(files){
  [...files].forEach(file=>{
    const row=document.createElement("div");row.className="file-row";
    const symbol=document.createElement("span");symbol.className="file-symbol";symbol.textContent=file.type.startsWith("image/")?"▧":file.type.startsWith("video/")?"▶":"▤";
    const info=document.createElement("div");const name=document.createElement("b");name.textContent=file.name;const size=document.createElement("small");size.textContent=prettySize(file.size)+" · staged on this device";info.append(name,size);
    const remove=document.createElement("button");remove.type="button";remove.textContent="Remove";remove.setAttribute("aria-label","Remove "+file.name);remove.addEventListener("click",()=>row.remove());
    row.append(symbol,info,remove);list.append(row);
  });
}
input.addEventListener("change",e=>addFiles(e.target.files));
["dragenter","dragover"].forEach(evt=>drop.addEventListener(evt,e=>{e.preventDefault();drop.classList.add("dragging")}));
["dragleave","drop"].forEach(evt=>drop.addEventListener(evt,e=>{e.preventDefault();drop.classList.remove("dragging")}));
drop.addEventListener("drop",e=>addFiles(e.dataTransfer.files));
document.getElementById("share-screen").addEventListener("click",()=>{
  const secure=window.isSecureContext;
  const supported=!!(navigator.mediaDevices&&navigator.mediaDevices.getDisplayMedia);
  document.getElementById("share-feedback").textContent=!secure?"Screen sharing needs HTTPS or localhost.":supported?"This browser supports screen capture. Peer streaming is not implemented yet.":"Screen capture is not supported in this browser.";
});
