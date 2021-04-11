require('dotenv').config();
const mongoose = require('mongoose');

function connectDB() {
    mongoose.connect(process.env.MONGODB_CONNECTION_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: true,
    });

    const connection = mongoose.connection;

    connection
        .once('open', () => {
            console.log('Database Conncected!');
        })
        .catch((err) => {
            console.log('Database connection failed!');
        });
}

module.exports = connectDB;
