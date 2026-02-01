// ============================================================================
// HARDWARE BUILDER PRO - BACKEND SERVER
// Complete API with MongoDB persistence and DigitalOcean Spaces storage
// ============================================================================

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  PORT: process.env.PORT || 3001,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://mohsenb_db_user:41pAjvZqq3nfYBQb@cluster0.eqarbok.mongodb.net/hardware-builder?retryWrites=true&w=majority',
  DO_SPACES_KEY: process.env.DO_SPACES_KEY || 'dop_v1_207b0fe89915fc2e2a22e9090c8c4b988f7e8a5bfc9a827cd5f572b1ec1f9bd0',
  DO_SPACES_SECRET: process.env.DO_SPACES_SECRET || '', // You need to add this from DO dashboard
  DO_SPACES_ENDPOINT: process.env.DO_SPACES_ENDPOINT || 'https://nyc3.digitaloceanspaces.com',
  DO_SPACES_BUCKET: process.env.DO_SPACES_BUCKET || 'hardware-builder-uploads',
  DO_SPACES_REGION: process.env.DO_SPACES_REGION || 'nyc3',
};

// ============================================================================
// EXPRESS APP SETUP
// ============================================================================

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// MONGODB CONNECTION & SCHEMAS
// ============================================================================

mongoose.connect(CONFIG.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
  odun: { type: String, unique: true, required: true },
  email: { type: String, unique: true, sparse: true },
  name: String,
  preferences: {
    theme: { type: String, default: 'dark' },
    defaultCategory: { type: String, default: 'microcontrollers' },
    showAgent: { type: Boolean, default: true },
    show3D: { type: Boolean, default: true },
  },
  skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  completedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Project Schema
const ProjectSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['planning', 'in-progress', 'completed', 'archived'], default: 'planning' },
  mode: { type: String, enum: ['forward', 'reverse'], default: 'forward' },
  template: String,
  inventory: [{
    partId: String,
    name: String,
    quantity: Number,
    price: Number,
    color: String,
  }],
  buildPlan: {
    feasible: Boolean,
    projectName: String,
    summary: String,
    difficulty: String,
    estimatedTime: String,
    assemblySteps: [{
      step: Number,
      title: String,
      instruction: String,
      components: [String],
      checkpoint: String,
      debugHint: String,
      completed: { type: Boolean, default: false },
    }],
    wiring: [{
      from: String,
      to: String,
      wireType: String,
      color: String,
    }],
    pinMap: mongoose.Schema.Types.Mixed,
    firmware: {
      filename: String,
      code: String,
      libraries: [String],
    },
    testChecklist: [{
      test: String,
      expected: String,
      ifFails: String,
      passed: { type: Boolean, default: false },
    }],
  },
  materials: {
    essential: [{
      name: String,
      qty: Number,
      price: Number,
      purpose: String,
      link: String,
      purchased: { type: Boolean, default: false },
    }],
    optional: [{
      name: String,
      qty: Number,
      price: Number,
      purpose: String,
    }],
    totalCost: {
      min: Number,
      recommended: Number,
      premium: Number,
    },
  },
  images: [{
    url: String,
    key: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  notes: String,
  tags: [String],
  isPublic: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Parts Inventory Schema (user's personal inventory)
const InventorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  parts: [{
    partId: String,
    name: String,
    quantity: Number,
    price: Number,
    color: String,
    location: String,
    notes: String,
    addedAt: { type: Date, default: Date.now },
  }],
  updatedAt: { type: Date, default: Date.now },
});

// Chat History Schema (for AI agent conversations)
const ChatSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  messages: [{
    role: { type: String, enum: ['user', 'agent'], required: true },
    text: String,
    timestamp: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

// Create models
const User = mongoose.model('User', UserSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Inventory = mongoose.model('Inventory', InventorySchema);
const Chat = mongoose.model('Chat', ChatSchema);

// ============================================================================
// DIGITALOCEAN SPACES (S3) SETUP
// ============================================================================

let s3Client = null;

if (CONFIG.DO_SPACES_SECRET) {
  s3Client = new S3Client({
    endpoint: CONFIG.DO_SPACES_ENDPOINT,
    region: CONFIG.DO_SPACES_REGION,
    credentials: {
      accessKeyId: CONFIG.DO_SPACES_KEY,
      secretAccessKey: CONFIG.DO_SPACES_SECRET,
    },
    forcePathStyle: false,
  });
  console.log('✅ DigitalOcean Spaces configured');
} else {
  console.log('⚠️ DigitalOcean Spaces not configured (missing secret key)');
}

// Multer setup for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WEBP allowed.'));
    }
  },
});

// ============================================================================
// API ROUTES - HEALTH CHECK
// ============================================================================

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Hardware Builder Pro API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      projects: '/api/projects',
      inventory: '/api/inventory',
      upload: '/api/upload',
      chat: '/api/chat',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    spaces: s3Client ? 'configured' : 'not configured',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// API ROUTES - USERS
// ============================================================================

// Get or create user
app.post('/api/users', async (req, res) => {
  try {
    const { odun, email, name } = req.body;
    
    let user = await User.findOne({ odun });
    
    if (!user) {
      user = new User({ odun, email, name });
      await user.save();
      console.log(`✅ New user created: ${odun}`);
    }
    
    res.json(user);
  } catch (err) {
    console.error('User error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user preferences
app.patch('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { odun: req.params.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// API ROUTES - PROJECTS
// ============================================================================

// Get all projects for a user
app.get('/api/projects/:userId', async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;
    const query = { userId: req.params.userId };
    if (status) query.status = status;
    
    const projects = await Project.find(query)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Project.countDocuments(query);
    
    res.json({ projects, total, limit: parseInt(limit), skip: parseInt(skip) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single project
app.get('/api/projects/:userId/:projectId', async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      userId: req.params.userId,
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new project
app.post('/api/projects', async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await project.save();
    console.log(`✅ Project created: ${project.name} (${project._id})`);
    
    res.status(201).json(project);
  } catch (err) {
    console.error('Project creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update project
app.put('/api/projects/:projectId', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project step completion
app.patch('/api/projects/:projectId/steps/:stepIndex', async (req, res) => {
  try {
    const { completed } = req.body;
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.buildPlan?.assemblySteps?.[req.params.stepIndex]) {
      project.buildPlan.assemblySteps[req.params.stepIndex].completed = completed;
      project.updatedAt = new Date();
      await project.save();
    }
    
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete project
app.delete('/api/projects/:projectId', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Delete associated images from Spaces
    if (s3Client && project.images?.length > 0) {
      for (const image of project.images) {
        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: CONFIG.DO_SPACES_BUCKET,
            Key: image.key,
          }));
        } catch (e) {
          console.error('Failed to delete image:', e);
        }
      }
    }
    
    res.json({ message: 'Project deleted', id: req.params.projectId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get public projects (community)
app.get('/api/community/projects', async (req, res) => {
  try {
    const { limit = 20, skip = 0, sort = 'likes' } = req.query;
    
    const projects = await Project.find({ isPublic: true })
      .sort({ [sort]: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('name description buildPlan.projectName buildPlan.difficulty buildPlan.summary likes createdAt');
    
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// API ROUTES - INVENTORY
// ============================================================================

// Get user's inventory
app.get('/api/inventory/:userId', async (req, res) => {
  try {
    let inventory = await Inventory.findOne({ userId: req.params.userId });
    
    if (!inventory) {
      inventory = new Inventory({ userId: req.params.userId, parts: [] });
      await inventory.save();
    }
    
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update inventory (add/update parts)
app.put('/api/inventory/:userId', async (req, res) => {
  try {
    const { parts } = req.body;
    
    const inventory = await Inventory.findOneAndUpdate(
      { userId: req.params.userId },
      { parts, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add single part to inventory
app.post('/api/inventory/:userId/parts', async (req, res) => {
  try {
    const part = req.body;
    
    let inventory = await Inventory.findOne({ userId: req.params.userId });
    
    if (!inventory) {
      inventory = new Inventory({ userId: req.params.userId, parts: [] });
    }
    
    const existingIndex = inventory.parts.findIndex(p => p.partId === part.partId);
    
    if (existingIndex >= 0) {
      inventory.parts[existingIndex].quantity += part.quantity || 1;
    } else {
      inventory.parts.push({ ...part, addedAt: new Date() });
    }
    
    inventory.updatedAt = new Date();
    await inventory.save();
    
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove part from inventory
app.delete('/api/inventory/:userId/parts/:partId', async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ userId: req.params.userId });
    
    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }
    
    inventory.parts = inventory.parts.filter(p => p.partId !== req.params.partId);
    inventory.updatedAt = new Date();
    await inventory.save();
    
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// API ROUTES - FILE UPLOAD (DIGITALOCEAN SPACES)
// ============================================================================

// Upload image
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!s3Client) {
      return res.status(503).json({ error: 'File storage not configured' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const { userId, projectId } = req.body;
    const fileExt = req.file.originalname.split('.').pop();
    const key = `${userId || 'anonymous'}/${projectId || 'general'}/${crypto.randomUUID()}.${fileExt}`;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: CONFIG.DO_SPACES_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read',
    }));
    
    const url = `${CONFIG.DO_SPACES_ENDPOINT}/${CONFIG.DO_SPACES_BUCKET}/${key}`;
    
    // If projectId provided, add to project images
    if (projectId) {
      await Project.findByIdAndUpdate(projectId, {
        $push: { images: { url, key, uploadedAt: new Date() } },
        updatedAt: new Date(),
      });
    }
    
    console.log(`✅ Image uploaded: ${key}`);
    res.json({ url, key });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload base64 image (for component scanning)
app.post('/api/upload/base64', async (req, res) => {
  try {
    if (!s3Client) {
      // Return a mock response if Spaces not configured
      return res.json({ url: null, message: 'Storage not configured, image processed in memory' });
    }
    
    const { image, userId, projectId } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    // Extract base64 data
    const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid base64 image format' });
    }
    
    const ext = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const key = `${userId || 'anonymous'}/scans/${crypto.randomUUID()}.${ext}`;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: CONFIG.DO_SPACES_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: `image/${ext}`,
      ACL: 'public-read',
    }));
    
    const url = `${CONFIG.DO_SPACES_ENDPOINT}/${CONFIG.DO_SPACES_BUCKET}/${key}`;
    
    res.json({ url, key });
  } catch (err) {
    console.error('Base64 upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete image
app.delete('/api/upload/:key', async (req, res) => {
  try {
    if (!s3Client) {
      return res.status(503).json({ error: 'File storage not configured' });
    }
    
    await s3Client.send(new DeleteObjectCommand({
      Bucket: CONFIG.DO_SPACES_BUCKET,
      Key: req.params.key,
    }));
    
    res.json({ message: 'Image deleted', key: req.params.key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// API ROUTES - CHAT HISTORY
// ============================================================================

// Get chat history
app.get('/api/chat/:userId', async (req, res) => {
  try {
    const { projectId, limit = 100 } = req.query;
    const query = { userId: req.params.userId };
    if (projectId) query.projectId = projectId;
    
    const chats = await Chat.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save chat message
app.post('/api/chat', async (req, res) => {
  try {
    const { userId, projectId, message } = req.body;
    
    let chat = await Chat.findOne({ userId, projectId });
    
    if (!chat) {
      chat = new Chat({ userId, projectId, messages: [] });
    }
    
    chat.messages.push({
      ...message,
      timestamp: new Date(),
    });
    
    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// API ROUTES - ANALYTICS & STATS
// ============================================================================

app.get('/api/stats/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const [projectCount, completedCount, inventory] = await Promise.all([
      Project.countDocuments({ userId }),
      Project.countDocuments({ userId, status: 'completed' }),
      Inventory.findOne({ userId }),
    ]);
    
    const partsCount = inventory?.parts?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
    const inventoryValue = inventory?.parts?.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 0), 0) || 0;
    
    res.json({
      projects: {
        total: projectCount,
        completed: completedCount,
        inProgress: projectCount - completedCount,
      },
      inventory: {
        uniqueParts: inventory?.parts?.length || 0,
        totalParts: partsCount,
        estimatedValue: inventoryValue.toFixed(2),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(CONFIG.PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔧 HARDWARE BUILDER PRO - BACKEND SERVER                ║
║                                                           ║
║   Server running on: http://localhost:${CONFIG.PORT}              ║
║   MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '⏳ Connecting...'}                              ║
║   DO Spaces: ${s3Client ? '✅ Configured' : '⚠️  Not configured'}                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
