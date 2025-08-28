# Activity Recorder — Browser Extension + Docker Ingestor

A Chrome extension (Manifest V3) that records browser activity (page visits, clicks, and optionally keystrokes) and ships the events to a Node.js server running in Docker. The server appends events to a log file on the host machine for later analysis.

⚠️ **Privacy note**: Keystroke capture is **disabled by default** and password fields are never recorded. Use responsibly and with user consent.

---

## 📂 Project structure

activity-recorder/
├─ extension/ # Chrome extension (Manifest V3)
│ ├─ manifest.json
│ ├─ background.js
│ ├─ content.js
│ ├─ popup.html / js
│ ├─ options.html / js
│ ├─ styles.css
│ └─ icons/ # extension icons
└─ server/ # Node.js + Express ingestor
├─ server.js
├─ package.json
├─ Dockerfile
├─ docker-compose.yml
└─ data/ # log file is persisted here (events.log)

yaml
Copy

---

## 🚀 Getting started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running
- Google Chrome or Microsoft Edge
- Node.js 18+ (optional, if you want to run the server without Docker)

---

### 1. Start the ingestor server in Docker

```bash
cd server
mkdir -p data   # ensure host log dir exists
docker compose up --build -d
Check health:

bash
Copy
curl http://localhost:4000/health
# -> {"ok":true}
All captured events will be written to server/data/events.log on the host.

2. Load the extension in Chrome
Go to chrome://extensions/

Enable Developer mode

Click Load unpacked

Select the extension/ folder

3. Configure the extension
Click the extension icon → Open Options

Set:

Server URL → http://localhost:4000

Capture clicks → ON ✅

Capture keystrokes → OFF ⬜ (recommended)

Save

4. Verify logs
Click around on any website, then check logs:

bash
Copy
tail -f server/data/events.log
Example log line:

json
Copy
{"receivedAt":1735470000000,"source":"activity-recorder-extension","count":1,"events":[{"kind":"click","time":1735470000123,"href":"https://example.com/","target":{"tag":"a","type":"","name":""},"x":100,"y":250}]}
🔍 Testing manually
Send a test event without the extension:

bash
Copy
curl -X POST http://localhost:4000/events \
  -H 'Content-Type: application/json' \
  -d '{"source":"manual","events":[{"kind":"test","time":1730000000000}]}'
Check server/data/events.log for the entry.

🛠 Development notes
To debug background scripts: chrome://extensions → Inspect the extension’s Service Worker.

To debug the ingestor locally (without Docker):

bash
Copy
cd server
npm install
npm start
To watch logs in container:

bash
Copy
docker compose logs -f
🔒 Security & Privacy Checklist
 Inform users and obtain consent before monitoring.

 Do not capture sensitive input (passwords, banking, healthcare).

 Keep keystroke logging disabled unless essential.

 Use domain allowlists / blocklists if necessary.

 Secure stored logs and rotate regularly.
