// bot.js

const { Client, GatewayIntentBits } = require('discord.js');

const brain = require('brain.js');

const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Neuronales Netz initialisieren

const net = new brain.recurrent.LSTM();

// Funktion zum Laden des Modells

function loadModel() {

    if (fs.existsSync('./model.json')) {

        const json = fs.readFileSync('./model.json');

        const model = JSON.parse(json);

        net.fromJSON(model);

        console.log('Modell geladen.');

    }

}

// Funktion zum Speichern des Modells

function saveModel() {

    const json = JSON.stringify(net.toJSON());

    fs.writeFileSync('./model.json', json);

    console.log('Modell gespeichert.');

}

// Funktion zum Laden der Trainingsdaten aus einer Datei

function loadTrainingData() {

    const dataPath = './trainingData.json';

    if (fs.existsSync(dataPath)) {

        const fileData = fs.readFileSync(dataPath);

        return JSON.parse(fileData);

    } else {

        console.error('Trainingsdaten-Datei nicht gefunden!');

        return [];

    }

}

// Funktion zum Trainieren des Modells

function trainBot() {

    const trainingData = loadTrainingData();

    

    if (trainingData.length > 0) {

        console.log('Training startet...');

        net.train(trainingData, {

            iterations: 500,

            log: (details) => console.log(details),

            logPeriod: 50,

        });

        console.log('Training abgeschlossen.');

        saveModel();

    } else {

        console.log('Keine Trainingsdaten vorhanden.');

    }

}

// Lerne aus den vordefinierten Trainingsdaten beim Start

loadModel();

trainBot();

// Funktion zur Generierung einer Antwort basierend auf dem neuronalen Netz

function generateResponse(message) {

    const output = net.run(message.content.toLowerCase());

    return output ? output : 'Das habe ich leider nicht verstanden.';

}

// Speichere die User-Daten wie zuvor

function saveUserData(userId, username) {

    const userData = { userId, username };

    const dataPath = './userData.json';

    let users = [];

    if (fs.existsSync(dataPath)) {

        const fileData = fs.readFileSync(dataPath);

        users = JSON.parse(fileData);

    }

    if (!users.some(user => user.userId === userId)) {

        users.push(userData);

        fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));

        console.log(`User data saved: ${userId}, ${username}`);

    }

}

// Event, wenn eine neue Nachricht im Channel ankommt

client.on('messageCreate', (message) => {

    if (message.author.bot) return;

    // Speichere die User-ID und den Benutzernamen

    saveUserData(message.author.id, message.author.username);

    // Generiere eine Antwort basierend auf dem trainierten Modell

    const response = generateResponse(message);

    message.reply(response);

});

client.once('ready', () => {

    console.log(`Logged in as ${client.user.tag}!`);

});

client.login('YOUR BOT TOKEN');
