const socket = new WebSocket(`ws://${location.hostname}:3000`);

const chat = document.getElementById("chat") as HTMLDivElement;
const msgInput = document.getElementById("msgInput") as HTMLInputElement;
const sendBtn = document.getElementById("sendBtn") as HTMLButtonElement;

let username = prompt("Digite seu nome:") || "Anônimo";

socket.onopen = () => {
  console.log("Conectado ao servidor WebSocket");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const linha = document.createElement("p");
  linha.textContent = `${data.user}: ${data.text}`;
  chat.appendChild(linha);
  chat.scrollTop = chat.scrollHeight;
};

sendBtn.onclick = () => {
  const texto = msgInput.value.trim();
  if (!texto) return;

  const msg = {
    user: username,
    text: texto,
  };

  socket.send(JSON.stringify(msg));
  msgInput.value = "";
};

