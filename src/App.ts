import express, { NextFunction, Request, Response } from 'express';
import categoriesRouter from '../src/routes/v1/categories.route';
import brandsRouter from '../src/routes/v1/brands.route';
import productsRouter from '../src/routes/v1/products.route';
import usersRouter from './routes/v1/users.route';
import authsRouter from '../src/routes/v1/auths.route';
import uploadRouter from '../src/routes/v1/upload.router';
import vendorRouter from '../src/routes/v1/vendors.route';
import orderRouter from '../src/routes/v1/orders.route';


var compression = require('compression');
var cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// compress all response
app.use(compression());




const string = 'xin chào!'


/**---------------|| BEGIN REGISTER ROUTES || ----------------- */

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send(string);
});
app.use('/api/v1', categoriesRouter);
app.use('/api/v1', brandsRouter);
app.use('/api/v1', productsRouter);
app.use('/api/v1', usersRouter);
app.use('/api/v1', vendorRouter);
app.use('/api/v1', orderRouter);

//login and get profile route
app.use('/api/v1/auth', authsRouter);
//upload images với multer middleware
app.use('/api/v1', uploadRouter);
app.use('/uploads', express.static('public/uploads'));



/**---------------|| BEGIN REGISTER ROUTES || ----------------- */

/** -----------------|| BEGIN HANDLE ERRORS || --------------* */
// catch 404 and forward to error handler
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
    const statusCode = err.status || 500;
    res.status(statusCode).json({ 
      statusCode: statusCode, 
      message: err.message
    });
  });
  
  /** -----------------|| END HANDLE ERRORS || --------------* */

  export default app;