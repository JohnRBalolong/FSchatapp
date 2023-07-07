const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add CORS headers middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// MongoDB connection
mongoose.set('strictQuery', false);
mongoose
    .connect('mongodb+srv://johnchess99:chatapp777@balolongj.gfayjoy.mongodb.net/')
    .then(() => {
        console.log('Connected to database');
        // app.listen(3000, () => {
        //     console.log('Server running on port 3000');
        // });
    })
    .catch((error) => {
        console.log('Database connection error:', error);
    });

// Define a schema for user data
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
    },
});

// Define a model for the user collection
const User = mongoose.model('User', userSchema);

// Define a schema for chat message data
const chatMessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// Define a model for the chat message collection
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

// Define a schema for chat data
const chatSchema = new mongoose.Schema({
    participants: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    }, ],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatMessage',
    }, ],
});

// Define a model for the chat collection
const Chat = mongoose.model('Chat', chatSchema);

// Registration route with validation
app.post('/register', [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        // Check if the username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already registered' });
        }

        // Create a new chat document for the user
        const newChat = new Chat({
            participants: [],
            messages: [],
        });

        // Save the chat document to the database
        const savedChat = await newChat.save();

        // Create a new user object with chatId
        const newUser = new User({
            username,
            email,
            password,
            chatId: savedChat._id,
        });

        // Save the user data to the database
        const savedUser = await newUser.save();

        res.status(201).json({ message: 'Register Successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// Login route with validation
app.post(
    '/login', [
        body('username').notEmpty().withMessage('Username is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        // Find the user in the database based on the username and password
        User.findOne({ username, password })
            .then((user) => {
                if (user) {
                    res.json({ message: 'Login successful' });
                } else {
                    res.status(401).json({ error: 'Invalid credentials' });
                }
            })
            .catch((error) => {
                res.status(500).json({ error: 'Failed to authenticate' });
            });
    }
);

// Create a new chat message
app.post('/chats/:chatId/messages', async(req, res) => {
    const { chatId } = req.params;
    const { sender, receiver, message } = req.body;

    try {
        // Find the chat document by chatId
        const chat = await Chat.findById(chatId);

        // Create a new chat message
        const newMessage = new ChatMessage({
            sender,
            receiver,
            message,
        });

        // Save the chat message to the database
        await newMessage.save();

        // Add the chat message to the chat document
        chat.messages.push(newMessage);
        await chat.save();

        res.status(201).json({ message: 'Chat message added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get the chat history for a given chat
// Get the chat history for a given chat
app.get('/chats/:chatId/history', async(req, res) => {
    const { chatId } = req.params;

    try {
        // Find the chat document by chatId and populate the messages and participants
        const chat = await Chat.findById(chatId)
            .populate('messages')
            .populate('participants.user_id');

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        const participants = chat.participants.map(participant => ({
            user_id: participant.user_id._id,
            username: participant.user_id.username,
            email: participant.user_id.email,
        }));

        const chatHistory = {
            chat_id: chat._id,
            participants,
            messages: chat.messages,
        };

        res.json(chatHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Get all users route
app.get('/users', async(req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});