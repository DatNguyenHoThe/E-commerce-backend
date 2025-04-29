import { Schema, model } from 'mongoose';
import { ICart } from '../types/type';


const cartSchema = new Schema<ICart>({
    items: [
      {
        productVariant: {
          type: Schema.Types.ObjectId,
          ref: 'productVariants',
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        currentPrice: {
          type: Number,
          required: true
        },
        currentSalePrice: {
            type: Number,
            required: true
          },
        totalAmount: {
            type: Number,
            min: 0,
            required: true,
            default: 0
          },
      }
    ],
    totalAmount: {
      type: Number,
      min: 0,
      required: true,
      default: 0
    },
    
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true
    }
  }, {
    timestamps: true,
    versionKey: false
  });

export default model('carts', cartSchema);