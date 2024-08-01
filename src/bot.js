const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const fs = require('fs');
const path = require('path');

const bot = new TelegramBot(config.telegramToken, { polling: true });
const chatIdsFilePath = path.join(__dirname, 'chatIds.json');

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

// Notify all users
function notifyUsers(message) {
    chatIds.forEach(chatId => {
        bot.sendMessage(chatId, message)
            .then(() => console.log(`Message sent to chat ID: ${chatId}`))
            .catch(err => console.error(`Error sending message to chat ID: ${chatId}`, err));
    });
}

// Example function call to notify users
notifyUsers('New assessment has been added to the website. Check it out!');

console.log('Bot is running...');
