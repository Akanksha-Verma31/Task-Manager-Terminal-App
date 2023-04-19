const { myVariable } = require('./app.js');
const socket = new WebSocket(`ws://localhost:${myVariable}/api`);
const terminal = document.getElementById("terminal");
const input = document.getElementById("input");
const clearBtn = document.getElementById("clear");

socket.onopen = () => {
  logMessage("WebSocket connection established");
};

socket.onmessage = (event) => {
  logMessage(event.data);
};

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const inputText = input.value.trim();
    if (inputText !== "") {
      logMessage("$ " + inputText, "command");
      socket.send(inputText);
      input.value = "";
    }
  }
});

clearBtn.addEventListener("click", () => {
  terminal.innerHTML = "";
});

function logMessage(message, type) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  if(message.startsWith("Invalid")|| message.startsWith("No")){
    messageElement.classList.add("error");
  }else if (type === "command") {
    messageElement.classList.add("command");
  } else {
    messageElement.classList.add("output");
  }
  terminal.appendChild(messageElement);
  terminal.scrollTop = terminal.scrollHeight;
}

input.focus();