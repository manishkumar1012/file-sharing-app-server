const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');
const sendMail = require('../services/emailServices');

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

let upload = multer({
    storage,
    limits: { fileSize: 1000000 * 100 },
}).single('myfile'); //100mb

router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size,
        });
        const response = await file.save();
        res.json({
            file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
        });
    });
});

router.post('/send', async (req, res) => {
    const { uuid, emailFrom, emailTo } = req.body;

    // Validate request
    if (!uuid || !emailFrom || !emailTo) {
        return res.status(422).send({ error: 'All fields are required!' });
    }

    // Get data from database
    const file = await File.findOne({ uuid: uuid });
    if (file.sender) {
        return res.status(422).send({ error: 'Email already sent!' });
    }

    // Save details into the database
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();

    // Send email
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'File Sharing App',
        text: `${emailFrom} sent you a file.`,
        html: require('../services/emailTemplate')({
            emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size: parseInt(file.size / 1000) + 'KB',
            expires: '24 hours',
        }),
    });

    res.send({ success: true });
});

module.exports = router;
