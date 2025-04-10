import { Schema, model } from 'mongoose';
import { IAddress } from '../types/type';


const addressSchema = new Schema<IAddress>({
    type: {
        type: String,
        maxLength: 50,
        require: true,
        enum: ["shipping", "billing"]
    },
    fullName: {
        type: String,
        maxLength: 100,
        require: true
    },
    phoneNumber: {
        type: String,
        maxLength: 20,
        require: true
    },
    addressLine1: {
        type: String,
        maxLength: 255,
        require: true
    },
    addressLine2: {
        type: String,
        maxLength: 255,
        require: false
    },
    city: {
        type: String,
        maxLength: 100,
        require: true
    },
    state: {
        type: String,
        maxLength: 100,
        require: true
    },
    postalCode: {
        type: String,
        maxLength: 20,
        require: true
    },
    country: {
        type: String,
        maxLength: 100,
        require: true
    },
    isDefault: {
        type: Boolean,
        require: true,
        default: false
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

export default model('addresses', addressSchema);