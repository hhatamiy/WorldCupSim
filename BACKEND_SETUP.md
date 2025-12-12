# Backend Server Setup Guide

## Prerequisites
- Node.js installed (v18 or higher recommended)
- MongoDB database (local or cloud like MongoDB Atlas)

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Set Up MongoDB

### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Create a database user
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)

### Option B: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Connection string: `mongodb://localhost:27017/worldcupsim`

## Step 3: Create Environment File

Create a file named `main.env` in the project root (`/Users/hhatami/WorldCupSim/main.env`):

```env
MONGO_URI=your_mongodb_connection_string_here
PORT=5001
```

**Example for MongoDB Atlas:**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/worldcupsim?retryWrites=true&w=majority
PORT=5001
```

**Example for Local MongoDB:**
```env
MONGO_URI=mongodb://localhost:27017/worldcupsim
PORT=5001
```

## Step 4: Start the Server

### Development Mode (with auto-reload):
```bash
cd backend
npm run dev
```

### Production Mode:
```bash
cd backend
npm start
```

## Step 5: Verify It's Working

1. The server should start on port 5001
2. You should see: "MongoDB connected" and "Server running on port 5001"
3. Test the API: Open `http://localhost:5001/` in your browser
   - Should see: "API is running..."

## Troubleshooting

### MongoDB Connection Issues
- Check your connection string is correct
- For Atlas: Make sure your IP is whitelisted (or use 0.0.0.0/0 for development)
- For local: Make sure MongoDB service is running

### Port Already in Use
- Change PORT in `main.env` to a different port (e.g., 5002)
- Or kill the process using port 5001: `lsof -ti:5001 | xargs kill -9`

### Dependencies Issues
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Reset Database (Optional)

If you need to clear all data:
```bash
cd backend
npm run reset
```

