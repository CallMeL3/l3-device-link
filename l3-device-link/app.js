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


// L3 Device Link - live pairing connection
const SERVER_URL = "wss://fictional-couscous-w9g49p7p64w3gp75-3000.app.github.dev";

let pairingSocket = null;

function connectPairingServer() {
  pairingSocket = new WebSocket(SERVER_URL);

  pairingSocket.addEventListener("open", () => {
    console.log("Connected to L3 pairing server.");
    document.getElementById("pair-feedback").textContent =
      "Connected to the pairing server.";
  });

  pairingSocket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "room-created") {
      document.getElementById("pair-code").textContent = message.code;
      document.getElementById("pair-feedback").textContent =
        "Pairing code created. Enter it on your other device.";
    }

    if (message.type === "room-joined") {
      document.getElementById("pair-feedback").textContent =
        "Successfully joined the device room.";
    }

   
if (message.type === "peer-joined") {
  document.getElementById("pair-feedback").textContent =
    "Another device has joined!";

  document.getElementById("connected-devices").textContent =
    "This device: Online | Another device: Online";
}

if (message.type === "room-joined") {
  document.getElementById("pair-feedback").textContent =
    "Successfully joined the device room.";

  document.getElementById("connected-devices").textContent =
    "This device: Online | Another device: Online";
}

if (message.type === "peer-left") {
  document.getElementById("connected-devices").textContent =
    "This device: Online | Another device: Offline";
}


    if (message.type === "error") {
      document.getElementById("pair-feedback").textContent = message.message;
    }
  });

  pairingSocket.addEventListener("error", () => {
    document.getElementById("pair-feedback").textContent =
      "Could not connect to the pairing server.";
  });
}

document.getElementById("generate-code").addEventListener("click", () => {
  if (!pairingSocket || pairingSocket.readyState !== WebSocket.OPEN) {
    connectPairingServer();

    pairingSocket.addEventListener("open", () => {
      pairingSocket.send(JSON.stringify({ type: "create-room" }));
    }, { once: true });

    return;
  }

  pairingSocket.send(JSON.stringify({ type: "create-room" }));
});


// Join an existing L3 Device Link room
document.getElementById("join-device").addEventListener("click", () => {
  const code = document.getElementById("join-code").value.trim();
  const feedback = document.getElementById("pair-feedback");

  if (!/^\d{6}$/.test(code)) {
    feedback.textContent = "Please enter a valid six-digit code.";
    return;
  }

  function joinRoom() {
    pairingSocket.send(JSON.stringify({
      type: "join-room",
      code: code
    }));
  }

  if (pairingSocket && pairingSocket.readyState === WebSocket.OPEN) {
    joinRoom();
  } else {
    feedback.textContent = "Connecting to the pairing server...";
    connectPairingServer();
    pairingSocket.addEventListener("open", joinRoom, { once: true });
  }
});



// Register L3 Device Link service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => {
        console.log("L3 app is ready to install.");
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  });
}


let deferredInstallPrompt;

const installButton = document.getElementById("install-app");

if (installButton) {
  installButton.hidden = false;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      alert("Use your browser menu to install L3 Device Link.");
      return;
    }

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;

    deferredInstallPrompt = null;
    installButton.hidden = true;
  });
}
