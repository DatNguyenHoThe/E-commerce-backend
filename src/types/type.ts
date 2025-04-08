export interface ICategory{
    category_name: string,
    description: string,
    slug: string,
    level: number,
    imageUrl: string,
    isActive: boolean
}

export interface IBrand{
    brand_name: string,
    description: string,
    slug: string
}

interface IAttribute{
    name: string,
    values: string
}

export interface IProduct{
    product_name: string,
    description: string,
    slug: string,
    price: number,
    salePrice: number,
    stock: number,
    images: string[],
    attributes: IAttribute[],
    rating: number,
    reviewCount: number,
    tags: string[],
    isActive: boolean,
    category: object,
    brand: object,
    vendor: object
}

export interface IVendor {
    companyName: string,
    description: string,
    logoUrl: string,
    coverImageUrl: string,
    address: object,
    contactPhone: string,
    contactEmail: string,
    website: string,
    socialLinks: object,
    rating: number,
    status: string,
    user: object
}

export interface IOrder{
    orderNumber: string,
    products: object[],
    totalAmount: number,
    shippingFee: number,
    tax: number,
    discount: number,
    paymentMethod: string,
    paymentStatus: string,
    shippingAddress: object,
    status: string,
    notes: string,
    user: object
}