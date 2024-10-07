import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Manually recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/media')); // Use path.join with __dirname
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`); // Define how the file should be named
  }
});

const upload = multer({ storage: storage });

export default upload;
