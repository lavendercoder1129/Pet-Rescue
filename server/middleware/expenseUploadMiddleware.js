import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Document upload directory for expense evidence (kept separate and protected)
const expenseUploadDir = path.join(__dirname, '../uploads/expenses');
if (!fs.existsSync(expenseUploadDir)) {
  fs.mkdirSync(expenseUploadDir, { recursive: true });
}

const expenseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, expenseUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `proof-${uniqueSuffix}${ext}`);
  },
});

const expenseFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid document format. Only JPEG, PNG, WebP images and PDF documents are accepted.'
      ),
      false
    );
  }
};

// Max 10MB per file, up to 5 documents per expense submission
export const uploadExpenseDocuments = multer({
  storage: expenseStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
  },
  fileFilter: expenseFileFilter,
});
