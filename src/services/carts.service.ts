import Cart from '../models/cart.model';
import createError from 'http-errors';


//Get all
const getAll = async(query: any) => {
    const {page = 1, limit = 10} = query;
    let sortObject = {};
    const sortType = query.sort_type || 'desc';
    const sortBy = query.sort_by || 'createdAt';
    sortObject = {...sortObject, [sortBy]: sortType === 'desc' ? -1 : 1};
    
    console.log('sortObject : ', sortObject);

    //tìm kiếm theo điều kiện
    let where = {};

    const carts = await Cart
    .find(where)
    .populate('user')
    .skip((page-1)*limit)
    .limit(limit)
    .sort({...sortObject});
    
    //Đếm tổng số record hiện có của collection carts
    const count = await Cart.countDocuments(where);

    return {
        carts,
        pagination: {
            totalRecord: count,
            limit,
            page
        }
    };
}

//get by ID
const getById = async(id: string) => {
    const cart = await Cart.findById(id);
    if(!cart) {
        createError(404, 'cart not found, please try again with other id');
    }
    return cart;
}


// Create
const create = async(payload: any) => {
    const cart = new Cart({
        items: payload.items,
        totalAmount: payload.totalAmount ? payload.totalAmount : 0,
        user: payload.user
    });
    // lưu dữ liệu
    await cart.save();
    return cart; // trả về kết quả để truy xuất dữ liệu trong controller
    
}
// update by ID
const updateById = async(id: string, payload: any) => {
    //kiểm tra xem id có tồn tại không
    const cart = await getById(id);
    if(!cart) {
        throw createError(404, "cart not found");
    }
    // trộn dữ liệu mới và cũ
    Object.assign(cart, payload);
    /*lưu ý dữ liệu sau khi trộn chỉ lưu vào bộ nhớ Ram chứ chưa lưu vào database
    --> cần lưu xuống database */
    await cart.save();
    // trả kết quả
    return cart;
}
//Delete by id
const deleteById = async(id: string) => {
    //kiểm tra xem id có tồn tại không
    const cart = await getById(id);
    if(!cart) {
        throw createError(404, "cart not found");
    }
    //xóa cart
    await cart.deleteOne({_id: cart.id});
    return cart;
}


export default {
    getAll,
    getById,
    create,
    updateById,
    deleteById
}