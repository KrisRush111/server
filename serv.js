const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors'); // Чтобы разрешить запросы с клиента

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Подключение Telegram Bot API
const botToken = '7809691512:AAHmFFAGkXu34oW3IujqoTcTmiwzs66Hwe0'; // Замените на токен вашего бота
const bot = new TelegramBot(botToken);

// Хранилище данных пользователей (на продакшене лучше использовать базу данных)
let users = {};

// Вебхук для обработки сообщений Telegram
app.post('/webhook', (req, res) => {
    const message = req.body.message;

    if (message && message.text === '/start') {
        const chatId = message.chat.id;
        const username = message.from.username || 'Гость';

        // Сохраняем данные пользователя
        users[chatId] = {
            username,
            photo_url: message.from.photo_url || null,
            id: chatId,
        };

        bot.sendMessage(chatId, `Привет, ${username}! Добро пожаловать в приложение!`);
    }
    res.sendStatus(200);
});

// Обработка авторизации через Telegram Login
app.get('/auth', (req, res) => {
    const { id } = req.query; // ID пользователя из виджета Telegram Login

    if (users[id]) {
        res.json({
            username: `@${users[id].username}`,
            photo_url: users[id].photo_url || 'default_avatar.jpg',
        });
    } else {
        res.status(404).json({ error: 'Пользователь не найден. Сначала нажмите "Старт" в боте.' });
    }
});

// API для проверки состояния пользователя
app.get('/user-status', (req, res) => {
    const chatId = req.query.id;

    if (users[chatId]) {
        res.json(users[chatId]);
    } else {
        res.status(404).json({ error: 'Пользователь не найден.' });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
