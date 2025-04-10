import Address from '../models/address.model';
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
    // nếu có tìm kiếm theo số điện thoại
    if(query.phoneNumber && query.phoneNumber.length > 0) {
        where = {...where, phoneNumber: {$regex: query.phoneNumber, $options: 'i'}};
    }

    const addresses = await Address
    .find(where)
    .populate('user')
    .skip((page-1)*limit)
    .limit(limit)
    .sort({...sortObject});
    
    //Đếm tổng số record hiện có của collection addresses
    const count = await Address.countDocuments(where);

    return {
        addresses,
        pagination: {
            totalRecord: count,
            page,
            limit
        }
    };
}

//get by ID
const getById = async(id: string) => {
    const address = await Address.findById(id);
    if(!address) {
        createError(404, 'address not found, please try again with other id');
    }
    return address;
}


// Create
const create = async(payload: any) => {
    const address = new Address({
        type: payload.type,
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber,
        addressLine1: payload.addressLine1,
        addressLine2: payload.addressLine2,
        city: payload.city,
        state: payload.state,
        postalCode: payload.postalCode,
        country: payload.country,
        isDefault: payload.isDefault,
        user: payload.user,
    });
    // lưu dữ liệu
    await address.save();
    return address; // trả về kết quả để truy xuất dữ liệu trong controller
    
}
// update by ID
const updateById = async(id: string, payload: any) => {
    //kiểm tra xem id có tồn tại không
    const address = await getById(id);
    if(!address) {
        throw createError(404, "address not found");
    }
    // trộn dữ liệu mới và cũ
    Object.assign(address, payload);
    //lưu dữ liệu xuống database
    await address.save();
    // trả kết quả
    return address;
}
//Delete by id
const deleteById = async(id: string) => {
    //kiểm tra xem id có tồn tại không
    const address = await getById(id);
    if(!address) {
        throw createError(404, "address not found");
    }
    //xóa address
    await address.deleteOne({_id: address.id});
    return address;
}


export default {
    getAll,
    getById,
    create,
    updateById,
    deleteById
}



