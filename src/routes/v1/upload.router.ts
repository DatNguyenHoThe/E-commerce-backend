import express, { NextFunction, Request, Response } from 'express';
import { uploadImages } from '../../helpers/multer.helper';
import multer from 'multer';
import createError from 'http-errors';
import {httpStatus, sendJsonSuccess} from '../../helpers/response.helper';

const router = express.Router();

router.post('/uploads/:collectionName', (req: Request, res: Response, next: NextFunction) => {
    uploadImages(req, res, function (error) {
        //Bắt lỗi
        if (error) {
            console.error("Upload Error:", error);  // Thêm dòng log này để kiểm tra
            next(createError(500, error.message, { type: error instanceof multer.MulterError ? 'MulterError' : 'UnknownError' }));
        } else {
            const { collectionName } = req.params;
            sendJsonSuccess(res, collectionName, httpStatus.OK.statusCode, httpStatus.OK.message);
        }
    });
});

export default router;
