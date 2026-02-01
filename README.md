# Hardware Builder Pro

AI-powered electronics prototyping assistant with real API integrations.

## Features

- ✅ **100+ Parts Library** - Microcontrollers, sensors, actuators, drivers, displays
- ✅ **AI Build Planning** - Claude 3.5 Sonnet via OpenRouter
- ✅ **Image Recognition** - Scan components with Gemini Vision
- ✅ **3D Assembly Viewer** - Interactive rotating view
- ✅ **Dual Mode** - Parts→Build or Idea→Shopping
- ✅ **Proactive AI Agent** - Real-time build assistance
- ✅ **MongoDB Persistence** - Cloud project storage
- ✅ **DigitalOcean Spaces** - Image uploads

---

## Quick Start (Frontend Only - Works in Preview)

The frontend works standalone with localStorage. Just open `hardware-builder-pro.jsx` in your React environment.

**APIs Used (already integrated):**
- OpenRouter: `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`
- Gemini: `AIzaSyD8j6OwH2sj33Hp9Tcrji4fJV2ssuOKEuM`

---

## Full Setup with Backend

### Step 1: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add your DigitalOcean Spaces secret key
# (Get it from https://cloud.digitalocean.com/account/api/spaces)

# Start server
npm start
```

The server will start on `http://localhost:3001`

### Step 2: Create DigitalOcean Space

1. Go to https://cloud.digitalocean.com/spaces
2. Click "Create a Space"
3. Name it: `hardware-builder-uploads`
4. Region: `nyc3`
5. Go to API > Spaces Keys
6. Generate a new key pair
7. Add the **Secret Key** to your `.env` file

### Step 3: Verify MongoDB Connection

The MongoDB connection is pre-configured:
```
mongodb+srv://mohsenb_db_user:41pAjvZqq3nfYBQb@cluster0.eqarbok.mongodb.net/hardware-builder
```

Test it by visiting: `http://localhost:3001/api/health`

### Step 4: Run Frontend

For development with Vite:
```bash
npm create vite@latest frontend -- --template react
cd frontend
# Copy hardware-builder-pro.jsx to src/App.jsx
npm install
npm run dev
```

Or use Create React App:
```bash
npx create-react-app frontend
cd frontend
# Copy hardware-builder-pro.jsx to src/App.js
npm start
```

---

## API Endpoints

### Health
- `GET /` - API info
- `GET /api/health` - Health check

### Projects
- `GET /api/projects/:userId` - Get user's projects
- `GET /api/projects/:userId/:projectId` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/:projectId` - Update project
- `DELETE /api/projects/:projectId` - Delete project

### Inventory
- `GET /api/inventory/:userId` - Get user's parts inventory
- `PUT /api/inventory/:userId` - Update inventory
- `POST /api/inventory/:userId/parts` - Add single part
- `DELETE /api/inventory/:userId/parts/:partId` - Remove part

### File Upload
- `POST /api/upload` - Upload image file
- `POST /api/upload/base64` - Upload base64 image
- `DELETE /api/upload/:key` - Delete image

### Chat History
- `GET /api/chat/:userId` - Get chat history
- `POST /api/chat` - Save chat message

### Analytics
- `GET /api/stats/:userId` - Get user statistics

---

## Project Structure

```
hardware-builder/
├── backend/
│   ├── server.js          # Express API server
│   ├── package.json       # Dependencies
│   └── .env.example       # Environment template
├── hardware-builder-pro.jsx  # Complete React frontend
└── README.md              # This file
```

---

## Environment Variables

```env
# Server
PORT=3001

# MongoDB
MONGODB_URI=mongodb+srv://mohsenb_db_user:41pAjvZqq3nfYBQb@cluster0.eqarbok.mongodb.net/hardware-builder

# DigitalOcean Spaces
DO_SPACES_KEY=dop_v1_207b0fe89915fc2e2a22e9090c8c4b988f7e8a5bfc9a827cd5f572b1ec1f9bd0
DO_SPACES_SECRET=your_secret_key_here  # ← Add this!
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=hardware-builder-uploads
DO_SPACES_REGION=nyc3

# AI APIs (used in frontend)
OPENROUTER_API_KEY=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
GEMINI_API_KEY=AIzaSyD8j6OwH2sj33Hp9Tcrji4fJV2ssuOKEuM
```

---

## Troubleshooting

**Backend won't connect to MongoDB:**
- Check your network allows outbound connections to MongoDB Atlas
- Verify the connection string in `.env`

**Images won't upload:**
- Make sure you've added the DigitalOcean Spaces secret key
- Verify the bucket exists and is named correctly

**AI features not working:**
- Check browser console for API errors
- Verify OpenRouter and Gemini API keys are valid

**Frontend shows "Local Mode":**
- Backend isn't running or isn't reachable
- Check that backend is on `http://localhost:3001`

---

## License

MIT - Built with ❤️ for makers
