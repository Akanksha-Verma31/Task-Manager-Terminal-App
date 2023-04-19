const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");

const server = http.createServer((req, res) => {
  const filePath = `.${req.url}`;

  if (req.url === "/") {
    // Serve the index page
    fs.readFile("index.html", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(`An error occurred: ${err.message}`);
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });

    return;
  }

  if (req.url === "/api") {
    // Handle WebSocket connections
    const wss = new WebSocket.Server({ noServer: true });

    wss.on("connection", (socket, req) => {
      socket.on("message", (message) => {
        const str = message.toString();
        const [command, ...args] = str.split(" ");

        switch (command) {
          case "list":
            fs.readFile("data.txt", "utf-8", (err, data) => {
              if (err) {
                socket.send(
                  `An error occurred while reading the file: ${err.message}`
                );
                return;
              }
              const entries = data.trim().split("\n");
              if (entries.length === 0) {
                socket.send("No entries found");
                return;
              }
              const formattedEntries = entries
                .map((entry) => entry.split(":").join(" - "))
                .join("\n");
              socket.send(formattedEntries);
            });
            break;
          case "get":
            const keyToGet = args[0];
            fs.readFile("data.txt", "utf-8", (err, data) => {
              if (err) {
                socket.send(
                  `An error occurred while reading the file: ${err.message}`
                );
                return;
              }
              const entries = data.trim().split("\n");
              const matchingEntry = entries.find(
                (entry) => entry.split(":")[0] === keyToGet
              );
              if (!matchingEntry) {
                socket.send(`No matching entry found for key ${keyToGet}`);
                return;
              }
              socket.send(matchingEntry);
            });
            break;
          case "add":
            const arg = args.join(" ");
            const [keyToAdd, ...entry] = arg.split(" ");
            //const [keyToAdd, ...valueToAdd] = args.join(" ").split(":");
            const entryToAdd = `${keyToAdd}:${entry.join(" ")}\n`;
            fs.appendFile("data.txt", entryToAdd, (err) => {
              if (err) {
                socket.send(
                  `An error occurred while adding the entry: ${err.message}`
                );
                return;
              }
              socket.send(`Entry added: ${entryToAdd.trim()}`);
            });
            break;
          case "update":
            const [keyToUpdate, newValue] = args;
            fs.readFile("data.txt", "utf-8", (err, data) => {
              if (err) {
                socket.send(
                  `An error occurred while reading the file: ${err.message}`
                );
                return;
              }
              const entries = data.trim().split("\n");
              const matchingIndex = entries.findIndex(
                (entry) => entry.split(":")[0] === keyToUpdate
              );
              if (matchingIndex === -1) {
                socket.send(`No matching entry found for key ${keyToUpdate}`);
                return;
              }
              entries[matchingIndex] = `${keyToUpdate}:${newValue}`;
              fs.writeFile("data.txt", entries.join("\n") + "\n", (err) => {
                if (err) {
                  socket.send(
                    `An error occurred while updating the entry: ${err.message}`
                  );
                  return;
                }
                socket.send(`Entry updated: ${keyToUpdate}:${newValue}`);
              });
            });

            break;
          case "delete":
            const keyToDelete = args[0];
            fs.readFile("data.txt", "utf-8", (err, data) => {
              if (err) {
                socket.send(
                  `An error occurred while reading the file: ${err.message}`
                );
                return;
              }
              const entries = data.trim().split("\n");
              const matchingIndex = entries.findIndex(
                (entry) => entry.split(":")[0] === keyToDelete
              );
              if (matchingIndex === -1) {
                socket.send(`No matching entry found for key ${keyToDelete}`);
                return;
              }
              entries.splice(matchingIndex, 1);
              fs.writeFile("data.txt", entries.join("\n") + "\n", (err) => {
                if (err) {
                  socket.send(
                    `An error occurred while deleting the entry: ${err.message}`
                  );
                  return;
                }
                socket.send(`Entry deleted: ${keyToDelete}`);
              });
            });
            break;
          default:
            socket.send(`Invalid command: ${command}`);
            break;
        }
      });
    });

    // Upgrade the connection to a WebSocket connection
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (socket) => {
      wss.emit("connection", socket, req);
    });

    return;
  }

  // Serve static files
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("File Not Found");
      return;
    }

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(data);
  });
});
const PORT = process.env.PORT || 3000;
app.locals.PORT = PORT;
server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
