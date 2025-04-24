import cartsController from "../../controllers/carts.controller";
import express from "express";
import validateSchemaYup from "../../middlewares/validate.middleware";
import cartsValidation from "../../validations/carts.validation";
import { authenticateToken } from "../../middlewares/auth.middleware";

const router = express.Router();

//getAll
router.get('/carts', authenticateToken , validateSchemaYup(cartsValidation.getAllSchema), cartsController.getAll);
//get by id
router.get('/carts/:id' , authenticateToken , validateSchemaYup(cartsValidation.getByIdSchema), cartsController.getById);
// create
router.post('/carts', authenticateToken, validateSchemaYup(cartsValidation.createSchema), cartsController.create);
// update by id
router.put('/carts/:id', authenticateToken, validateSchemaYup(cartsValidation.updateByIdSchema), cartsController.updateById);
//delete by id
router.delete('/carts/:id', authenticateToken, validateSchemaYup(cartsValidation.deleteByIdSchema), cartsController.deleteById);

export default router;