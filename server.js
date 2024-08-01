const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// Load environment variables
const telegramToken = process.env.TELEGRAM_TOKEN;
const chatIdsFilePath = path.join(__dirname, 'chatIds.json');

// Initialize Telegram bot
const bot = new TelegramBot(telegramToken, { polling: true });

// Load existing chat IDs
let chatIds = [];
if (fs.existsSync(chatIdsFilePath)) {
    chatIds = JSON.parse(fs.readFileSync(chatIdsFilePath));
}

// Save chat IDs to file
function saveChatIds() {
    fs.writeFileSync(chatIdsFilePath, JSON.stringify(chatIds, null, 2));
}

// Listener to get chat ID and store it
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // Check if chat ID is already in the list
    if (!chatIds.includes(chatId)) {
        chatIds.push(chatId);
        saveChatIds();

        // Send confirmation message
        bot.sendMessage(chatId, `Thank you for interacting with the bot! Your chat ID (${chatId}) has been recorded.`);
    }
});

// Function to notify all users
function notifyUsers(message) {
    chatIds.forEach(chatId => {
        bot.sendMessage(chatId, message)
            .then(() => console.log(`Message sent to chat ID: ${chatId}`))
            .catch(err => console.error(`Error sending message to chat ID: ${chatId}`, err));
    });
}

// Define a route that sends "Hi" and notifies Telegram
app.get('/assessment', async (req, res) => {
    const message = 'Hi';
    res.send(message);

    // Notify Telegram
    notifyUsers('New assessment has been added to the website. Check it out!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
