// ================= CONFIG =================
const CHAT_API_URL = "https://quronai112.onrender.com";
const IMAGE_API_URL = "https://quronai112.onrender.com";

// ================= ELEMENTS =================
const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const newChatBtn = document.getElementById("newChat");
const chatArea = document.getElementById("chatArea");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const searchChats = document.getElementById("searchChats");
const chatHistory = document.getElementById("chatHistory");
const profileBtn = document.getElementById("profileBtn");
const attachBtn = document.getElementById("attachBtn");
const voiceBtn = document.getElementById("voiceBtn");
const imageBtn = document.getElementById("imageBtn");
const emptyState = document.getElementById("emptyState");

// ================= STOP / PAUSE CONTROL =================
let controller = null;
let isGenerating = false;

// ================= LOGIN CHECK =================
// ================= LOGIN CHECK =================
let userProfile;
try {
  const stored = localStorage.getItem("chatAIUser");
  userProfile = stored ? JSON.parse(stored) : null;
} catch (e) {
  localStorage.removeItem("chatAIUser");
  userProfile = null;
}
if (!userProfile || (!userProfile.email && !userProfile.phone)) {
  window.location.replace("login.html");
}

// ================= CHAT STORAGE =================
const USER_KEY = userProfile.email || userProfile.phone;
const CHAT_STORAGE_KEY = "chats_" + USER_KEY;
let chats = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
let currentChatId = null;

// ================= DRAWER =================
menuBtn.onclick = (e) => {
  e.stopPropagation();

  drawer.classList.toggle("show");
  menuBtn.classList.toggle("active"); // hamburger → X

  // 🔥 MOVE BUTTON
  if (drawer.classList.contains("show")) {
    menuBtn.style.left = "230px"; // drawer ke andar shift
  } else {
    menuBtn.style.left = "12px"; // normal position
  }
};

// Click outside → close drawer + reset button
document.addEventListener("click", (e) => {
  if (!drawer.contains(e.target) && !menuBtn.contains(e.target)) {
    drawer.classList.remove("show");
    menuBtn.classList.remove("active");

    // 🔥 RESET POSITION
    menuBtn.style.left = "12px";
  }
});
// ================= CHAT FUNCTIONS =================
function createNewChat(title = "GPT-5 Chat") {
  currentChatId = Date.now();
  chats.push({ id: currentChatId, title, messages: [] });
  saveChats();
  renderChatList();
  chatArea.innerHTML = "";
}

newChatBtn.onclick = () => createNewChat();

function saveChats() {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
}

function renderChatList(filter = "") {
  chatHistory.innerHTML = "";
  const filteredChats = chats.filter(c => {
    if (filter && !c.title.toLowerCase().includes(filter.toLowerCase())) return false;
    return c.messages.some(m => m.text || m.image || m.file);

  });

  filteredChats.forEach(chat => {
    const li = document.createElement("li");
    li.textContent = chat.title;
    li.style.position = "relative";

    const menu = document.createElement("span");
    menu.textContent = "⋮";
    menu.style.cursor = "pointer";
    menu.style.position = "absolute";
    menu.style.right = "5px";
    menu.onclick = e => { e.stopPropagation(); showChatMenu(chat, li); };
    li.appendChild(menu);

    li.onclick = () => loadChat(chat.id);
    chatHistory.appendChild(li);
  });







// ✅ Upgrade Button (ADD THIS ABOVE addProjectBtn)
if (!document.getElementById("upgradeBtn")) {
  const upgradeBtn = document.createElement("button");
  upgradeBtn.id = "upgradeBtn";
  upgradeBtn.textContent = "✨ Upgrade to Premium";

  upgradeBtn.onclick = () => {
    window.location.href = "upgrade.html";
  };

  chatHistory.parentElement.appendChild(upgradeBtn);
}


  
  if (!document.getElementById("addProjectBtn")) {
    const btn = document.createElement("button");
    btn.id = "addProjectBtn";
    btn.textContent = "＋ Add Project";
    btn.onclick = () => {
      const name = prompt("Enter Project Name:");
      if (!name) return;
      createNewChat(name);
      alert("Project added!");
    };
    chatHistory.parentElement.appendChild(btn);
  }
}

function showChatMenu(chat, li) {
  const menuDiv = document.createElement("div");
  menuDiv.className = "chat-menu";
  menuDiv.style.cssText = "position:absolute;background:#111;color:#0ef8e0ff;padding:5px;border-radius:5px;z-index:50;";
  menuDiv.style.top = li.offsetTop + li.offsetHeight + "px";
  menuDiv.style.left = li.offsetLeft + "px";

  const commonBtnStyle = "background:#fff;color:#000;border:none;padding:5px 10px;margin:2px;border-radius:3px;cursor:pointer;";

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete Chat";
  delBtn.style.cssText = commonBtnStyle;
  delBtn.onclick = e => { 
    e.stopPropagation(); 
    chats = chats.filter(c => c.id !== chat.id); 
    saveChats(); 
    renderChatList(); 
    if (currentChatId === chat.id) chatArea.innerHTML = ""; 
    menuDiv.remove(); 
  };

  const pinBtn = document.createElement("button");
  pinBtn.textContent = "Pin Chat";
  pinBtn.style.cssText = commonBtnStyle;
  pinBtn.onclick = e => { 
    e.stopPropagation(); 
    alert("Chat pinned!"); 
    menuDiv.remove(); 
  };

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save Chat";
  saveBtn.style.cssText = commonBtnStyle;
  saveBtn.onclick = e => { 
    e.stopPropagation(); 
    alert("Chat saved!"); 
    menuDiv.remove(); 
  };

  menuDiv.append(delBtn, pinBtn, saveBtn);
  document.body.appendChild(menuDiv);

  document.addEventListener("click", function closeMenu(ev) {
    if (!menuDiv.contains(ev.target)) { 
      menuDiv.remove(); 
      document.removeEventListener("click", closeMenu); 
    }
  });
}

function loadChat(id) {
  currentChatId = id;
  chatArea.innerHTML = "";
  const chat = chats.find(c => c.id === id);
  if (!chat || !Array.isArray(chat.messages)) return;

  chat.messages.forEach(m => {
    if (m.image) addImageMessage(m.image);
    else if (m.file) addFileMessage(m.file, m.type);
    else if (m.text) addMessage(m.text, m.type);
  });

  drawer.classList.remove("show");
}

// ================= UI MESSAGES =================
function addMessage(text, type = "ai") {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerText = text;

  if (type === "ai") {
    const copy = document.createElement("span");
    copy.className = "copy";
    copy.innerText = "Copy";
    copy.onclick = () => navigator.clipboard.writeText(text);

    const speak = document.createElement("span");
    speak.className = "copy";
    speak.style.right = "50px";
    speak.innerText = "🔊";
    speak.onclick = () => speechSynthesis.speak(new SpeechSynthesisUtterance(text));

    div.append(copy, speak);
  }

  chatArea.appendChild(div);
  setTimeout(() => div.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
}

function addImageMessage(url) {
  const div = document.createElement("div");
  div.className = "msg ai image";

  const img = document.createElement("img");
  img.src = url;
  img.style.cssText = "max-width:100%;border-radius:12px;margin-top:5px";
  img.alt = "Generated Image";

  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "💾 Save Image";
  downloadBtn.style.cssText = "margin-top:5px;cursor:pointer";
  downloadBtn.onclick = () => { const link = document.createElement("a"); link.href = url; link.download = `image_${Date.now()}.png`; link.click(); };

  div.append(img, downloadBtn);
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function addFileMessage(file, sender = "user") {
  const div = document.createElement("div");
  div.className = sender === "ai" ? "msg ai" : "msg user";

  const fileName = document.createElement("span");
  fileName.textContent = file.name || "File";
  fileName.style.display = "block";
  fileName.style.marginBottom = "5px";

  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = file.name || `file_${Date.now()}`;
  link.innerText = "📥 Download / View";
  link.style.cursor = "pointer";
  link.style.color = sender === "ai" ? "rgb(255, 255, 255)" : "#000";

  div.append(fileName, link);
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// ================= THINKING =================
function showThinking() {
  removeThinking();
  const div = document.createElement("div");
  div.className = "msg ai thinking";
  div.id = "thinking";
  div.innerHTML = "<span></span><span></span><span></span>";
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function removeThinking() {
  const t = document.getElementById("thinking");
  if (t) t.remove();
}

function setSendButton(state) {
  if (state === "send") { sendBtn.innerHTML = "➤"; sendBtn.title = "Send"; }
  else if (state === "stop") { sendBtn.innerHTML = "⏸"; sendBtn.title = "Stop generating"; }
}

function stopGeneration() {
  if (controller) { controller.abort(); controller = null; }
  removeThinking();
  isGenerating = false;
  setSendButton("send");
}

// ================= IMAGE PROMPT CHECK =================
function isImagePrompt(text) {
  const keywords = ["image","img","photo","picture","draw","generate image","create image","bana","banado","bana do"];
  return keywords.some(k => text.toLowerCase().includes(k));
}

// ================= SEND MESSAGE =================
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isGenerating) return;

  if (!currentChatId) createNewChat();
  const chat = chats.find(c => c.id === currentChatId);

  addMessage(text, "user");
  chat.messages.push({ text, type: "user" });
  saveChats();
  userInput.value = "";
  setTimeout(() => userInput.focus(), 50);

  if (isImagePrompt(text)) { sendImage(text); return; }

  isGenerating = true;
  setSendButton("stop");
  showThinking();
  controller = new AbortController();

  try {
    const res = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: chat.messages }),
      signal: controller.signal
    });

    const data = await res.json();
    removeThinking();

    const reply = data.reply || "No response from GPT-5";
    addMessage(reply, "ai");
    chat.messages.push({ text: reply, type: "ai" });
    saveChats();

  } catch (err) {
    if (err.name !== "AbortError") addMessage("Server error while contacting GPT-5", "ai");
    console.error(err);
  } finally {
    setSendButton("send");
    isGenerating = false;
    controller = null;
  }
}

// ================= IMAGE GENERATION =================
async function sendImage(prompt) {
  if (!prompt) return;
  if (!currentChatId) createNewChat();
  const chat = chats.find(c => c.id === currentChatId);

  addMessage(`Generating image for: "${prompt}"`, "user");
  showThinking();
  setSendButton("stop");
  isGenerating = true;

  try {
    const res = await fetch(IMAGE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, history: chat.messages })
    });

    const data = await res.json();
    removeThinking();

    if (data.url || data.image) {
      const imageSrc = data.url || data.image;
      addImageMessage(imageSrc);
      chat.messages.push({ image: imageSrc, type: "ai" });
      saveChats();
    } else {
      addMessage("Image generation failed", "ai");
      console.error("Image API response:", data);
    }

  } catch (err) {
    removeThinking();
    addMessage("Image generation failed", "ai");
    console.error("Image error:", err);
  } finally {
    setSendButton("send");
    isGenerating = false;
  }
}

// ================= FILE UPLOAD (REAL ICON UI) =================
const fileInput = document.getElementById("fileInput");
const cameraInput = document.getElementById("cameraInput");

attachBtn.onclick = (e) => {
  e.stopPropagation();

  let menu = document.getElementById("attachMenu");
  if (menu) {
    menu.remove();
    return;
  }

  menu = document.createElement("div");
  menu.id = "attachMenu";
  menu.style.cssText = `
    position: fixed;
    bottom: 70px;
    left: 10px;
    background: #2b2b2b;
    border-radius: 12px;
    padding: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    z-index: 100;
    display: flex;
    flex-direction: column;
    min-width: 200px;
  `;

menu.innerHTML = `
  <div class="attach-option" id="openCamera">
    <!-- CAMERA ICON -->
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2">
      <path d="M23 19V7a2 2 0 0 0-2-2h-3l-2-2H8L6 5H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
    Camera
  </div>

  <div class="attach-option" id="openGallery">
    <!-- GALLERY / IMAGE ICON -->
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M21 15l-5-5L5 21"/>
    </svg>
    Photos
  </div>

  <div class="attach-option" id="openFiles">
    <!-- UPLOAD FILE ICON -->
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 5 17 10"/>
      <line x1="12" y1="5" x2="12" y2="15"/>
    </svg>
    Upload files
  </div>
`;

  document.body.appendChild(menu);

  // actions
  document.getElementById("openCamera").onclick = () => {
    cameraInput.click();
    menu.remove();
  };

  document.getElementById("openGallery").onclick = () => {
    fileInput.accept = "image/*";
    fileInput.click();
    menu.remove();
  };

  document.getElementById("openFiles").onclick = () => {
    fileInput.accept = "*/*";
    fileInput.click();
    menu.remove();
  };

  // close outside
  setTimeout(() => {
    const closeMenu = (ev) => {
      if (!menu.contains(ev.target) && ev.target !== attachBtn) {
        menu.remove();
        document.removeEventListener("click", closeMenu);
      }
    };
    document.addEventListener("click", closeMenu);
  }, 0);
};

// ================= VOICE RECORDING =================
let mediaRecorder = null;
let audioChunks = [];
let recording = false;

voiceBtn.onclick = async () => {
  if (recording) { mediaRecorder.stop(); recording = false; voiceBtn.textContent = "🎙️"; return; }

  if (!navigator.mediaDevices) return alert("Voice recording not supported");
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];
  recording = true;
  voiceBtn.textContent = "⏹️";

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: "audio/webm" });
    const file = new File([blob], `voice_${Date.now()}.webm`);
    if (!currentChatId) createNewChat();
    const chat = chats.find(c => c.id === currentChatId);
    addFileMessage(file, "user");
    chat.messages.push({ file, type: "user" });
    saveChats();

    showThinking();
    setSendButton("stop");
    isGenerating = true;

    try {
      const formData = new FormData();
      formData.append("file", blob);

      const transRes = await fetch("https://new-12-cozw.onrender.com/api/voice-to-text", { method: "POST", body: formData });
      const transData = await transRes.json();
      const userText = transData.text?.trim() || "";
      removeThinking();

      if (!userText) { addMessage("Could not understand your voice", "ai"); setSendButton("send"); isGenerating = false; return; }

      addMessage(userText, "user");
      chat.messages.push({ text: userText, type: "user" });
      saveChats();

      showThinking();
      setSendButton("stop");

      const chatRes = await fetch(CHAT_API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userText, history: chat.messages }) });
      const chatData = await chatRes.json();
      const reply = chatData.reply || "GPT-5 could not respond";

      addMessage(reply, "ai");
      chat.messages.push({ text: reply, type: "ai" });
      saveChats();

    } catch (err) {
      removeThinking();
      addMessage("Voice processing failed", "ai");
      console.error("Voice → GPT-5 error:", err);
    } finally {
      setSendButton("send");
      isGenerating = false;
    }
  };

  mediaRecorder.start();
};

// ================= PROFILE =================
profileBtn.onclick = e => {
  e.stopPropagation();

  const profile = JSON.parse(localStorage.getItem("chatAIUser"));
  if (!profile) {
    alert("User not logged in");
    window.location.href = "login.html";
    return;
  }

  let popup = document.getElementById("profilePopup");

  // Toggle popup
  if (popup) {
    popup.remove();
    return;
  }

  // Create popup
  popup = document.createElement("div");
  popup.id = "profilePopup";
  popup.style.cssText = `
    position: fixed;
    top: 60px;
    right: 15px;
    background: #000; /* black box */
    color: #fff; /* white text */
    padding: 15px;
    border-radius: 8px;
    z-index: 100;
    min-width: 220px;
    box-shadow: 0 0 10px rgba(255,255,255,0.2);
    font-family: Arial, sans-serif;
  `;

  popup.innerHTML = `
    <p><strong>Name:</strong> ${profile.name || "User"}</p>
    <p><strong>Email:</strong> ${profile.email || "Not provided"}</p>
    <p><strong>Phone:</strong> ${profile.phone || profile.mobile || "Not provided"}</p>
    <button id="logoutBtn" style="
      margin-top:10px;
      padding:6px 12px;
      border:none;
      border-radius:5px;
      cursor:pointer;
      background:#fff; /* white button */
      color:#000; /* black text */
      font-weight:bold;
    ">Logout</button>
  `;

  document.body.appendChild(popup);

  // Logout
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("chatAIUser");
    window.location.href = "login.html";
  };

  // Close when clicking outside
  setTimeout(() => {
    const closeProfile = e => {
      if (!popup.contains(e.target) && e.target !== profileBtn) {
        popup.remove();
        document.removeEventListener("click", closeProfile);
      }
    };
    document.addEventListener("click", closeProfile);
  }, 0);
};
// ===== PROMPTS =====
const prompts = [
  "Where should we begin?",
  "What’s on your mind today?",
  "What’s on the agenda today?",
  "How can I help you today?",
  "Ask me anything...",
  "Let’s build something amazing.",
  "Need help with code or ideas?",
  "Start a conversation...",
  "What are you working on?",
  "Tell me your idea..."
];

// ===== RANDOM SINGLE PROMPT =====
function getRandomPrompt() {
  return prompts[Math.floor(Math.random() * prompts.length)];
}

// ===== RENDER EMPTY STATE (ONLY ONE) =====
function renderEmptyState() {
  emptyState.innerHTML = "";

  const text = getRandomPrompt();

  const p = document.createElement("p");
  p.innerText = text;

  // click = auto send
  p.style.cursor = "pointer";
  p.onclick = () => {
    input.value = text;
    sendMessage();
  };

  emptyState.appendChild(p);
}


// ================= EVENTS =================
sendBtn.addEventListener("click", () => { if (isGenerating) stopGeneration(); else sendMessage(); });
userInput.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
searchChats.addEventListener("input", e => renderChatList(e.target.value.trim()));

// ================= INIT =================
renderChatList();
// ===== INIT =====
window.addEventListener("load", () => {
  renderEmptyState();
});
