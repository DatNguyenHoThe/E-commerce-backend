import { Schema, model } from 'mongoose';
import { IProductAttribute } from '../types/type';

interface ProductAttribute {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  isFilterable: boolean;
  isVariant: boolean;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
  productsCount: number;
}

const productAtributeSchema = new Schema<ProductAttribute>({
    name: {
        type: String,
        maxLength: 50,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        maxLength: 100,
        required: true
    },
    description: {
        type: String,
        maxLength: 255,
        required: false
    },
    type: {
        type: String,
        maxLength: 20,
        required: true,
        enum: ["text", "number", "boolean", "select"]
    },
    options: {
        type: [String],
        required: false
    },
    isFilterable: {
        type: Boolean,
        required: true,
        default: false
    },
    isVariant: {
        type: Boolean,
        required: true,
        default: false
    },
    isRequired: {
        type: Boolean,
        required: true,
        default: false
    }
},
{
    timestamps: true, // Thêm createdAt và updatedAt
    versionKey: false
}
)

export default model('productAttributes', productAtributeSchema);
