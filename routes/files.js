const router = require('express').Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, '../uploads'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}${path.extname(file.originalname)}`; // like 234453446-343435344.jpg

        cb(null, uniqueName);
    },
});

const upload = multer
    .upload({
        storage,
        limit: { fileSize: 1e6 * 10 },
    })
    .single('myfile');

router.post('/', (req, res) => {});

module.exports = router;
