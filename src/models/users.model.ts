import { Schema, model } from 'mongoose'
import bcrypt from 'bcrypt';

const saltRounds = 10;

const UserSchema = new Schema({
    userName: {
        type: String,
        minlength: 2,
        maxlength: 50,
        require: true,
    },
    fullName: {
        type: String,
        minlength: 2,
        maxlength: 100,
        require: true,
    },
    email: {
        type: String,
        maxlength: 100,
        require: true,
        unique: true,//duy nhất
        validate: {
            validator: function (v: string) {
                return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
            },
            message: (props: {value: string}) => `${props.value} is not a valid email`
        }
    },
    password: {
        type: String,
        maxlength: 255,
        require: true
    },
    roles: {
        type: String,
        maxlength: 50,
        require: true,
        default: "customer"
    },
    status: {
        type: String,
        enum: ["active", "inactive","banned"],
        require: true,
        default: "active"
    },
    avatarUrl: {
        type: String,
        maxlength: 255,
        require: true
    },
    lastLogin: {
        type: Date,
        require: false
    }
},
{
    timestamps: true,
});

//Middleware pre save ở lớp database
//trước khi data được lưu xuống ---> mã khóa mật khẩu

UserSchema.pre('save', async function (next) {
    const user = this;

    if (!user.password) {
        return next(new Error("Password is required"));
    }

    const hash = bcrypt.hashSync(user.password, saltRounds);

    user.password = hash;

    next();
})

export default model('users', UserSchema)