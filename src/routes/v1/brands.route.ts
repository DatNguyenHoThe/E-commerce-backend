import brandsController from "../../controllers/brands.controller";
import express from "express";
import validateSchemaYup from "../../middlewares/validate.middleware";
import brandsValidation from "../../validations/brands.validation";

const router = express.Router();

//getAll
router.get('/brands', validateSchemaYup(brandsValidation.getAllSchema), brandsController.getAll);
//get by id
router.get('/brands/:id', validateSchemaYup(brandsValidation.getByIdSchema), brandsController.getById);
// create
router.post('/brands', validateSchemaYup(brandsValidation.createSchema), brandsController.create);
// update by id
router.put('/brands/:id', validateSchemaYup(brandsValidation.updateByIdSchema), brandsController.updateById);
//delete by id
router.delete('/brands/:id', validateSchemaYup(brandsValidation.deleteByIdSchema), brandsController.deleteById);

export default router;