import express from 'express';
import { uploadImages } from '../helpers/multer.helper';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', authenticateToken, (req, res) => {
  uploadImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Upload failed',
      });
    }

    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded',
      });
    }

    // Get the collection name from form data
    const collectionName = req.body.collectionName || 'uploads';
    
    // Generate URLs for the uploaded files
    const urls = Array.isArray(req.files) 
      ? req.files.map((file: any) => `/${collectionName}/${file.filename}`)
      : [`${collectionName}/${req.files.filename}`];

    res.status(200).json({
      success: true,
      data: {
        urls,
      },
    });
  });
});

export default router;
