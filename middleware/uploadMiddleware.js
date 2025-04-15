const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const profilesDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

// Configure storage for profile images
const profileStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, profilesDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + ext);
  }
});

// File filter to only allow image files
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instances
const uploadProfileImage = multer({ 
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
}).single('profile_image');

module.exports = {
  uploadProfileImage
};