const multer = require("multer");

// Memory storage (so we can stream to Cloudinary)
const storage = multer.memoryStorage();

// File type + size validation
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only .jpg and .png images are allowed"));
    }
    cb(null, true);
  },
});

module.exports = upload;
