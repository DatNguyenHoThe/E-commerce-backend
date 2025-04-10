import { Schema, model } from 'mongoose';
import { ICart } from '../types/type';


const cartSchema = new Schema<ICart>({
    items: {
        type: [Object],
        require: true,
        default: []
    },
    totalAmount: {
        type: Number,
        min: 0,
        require: true,
        default: 0
    },
    //tham chiếu
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        require: true
    }
},
{
    timestamps: true, // Thêm createdAt và updatedAt
    versionKey: false
}
)

export default model('carts', cartSchema);