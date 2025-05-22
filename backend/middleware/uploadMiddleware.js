const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);  // Absolute path to upload folder
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename with extension
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed!'), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
