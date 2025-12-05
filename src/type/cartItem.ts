// 购物车接口
export interface ICartItem {
    id: string,        // 主键ID (使用string格式)
    userId: number,    // 用户ID
    bookId: string,    // 书籍SKU ID
    specId: string,    // 书籍规格ID
    bookName: string,  // 书籍名称
    specName: string,  // 书籍规格名称
    quantity: number,  // 书籍数量
    price: number,     // 加购时单价
    selected: number,  // 是否选中（1=是，0=否）
    addTime: string,   // 加购时间
    updateTime: string // 更新时间
}

// 分页接口
export interface IPage {
    current_page: number;
    data_count: number;
    single_page_size: number;
}

// 购物车查询接口
export interface IQueryCartItem extends IPage {
    bookName: string,  // 书籍名称查询条件
    specName: string   // 书籍规格名称查询条件
}

// 购物车编辑接口
export interface ICartItemEdit {
    id: string,        // 主键ID (必需，编辑时使用)
    userId: number,    // 用户ID
    bookId: string,    // 书籍SKU ID
    specId: string,    // 书籍规格ID
    bookName?: string, // 书籍名称
    specName?: string, // 书籍规格名称
    quantity: number,  // 书籍数量
    price: number,     // 加购时单价
    selected: number,  // 是否选中（1=是，0=否）
    addTime?: string,  // 加购时间 (可选)
    updateTime?: string // 更新时间 (可选)
}

// 新增购物车接口
export interface IAddCartItem {
    userId: number,    // 用户ID
    bookId: string,    // 书籍SKU ID
    specId: string,    // 书籍规格ID
    bookName?: string, // 书籍名称
    specName?: string, // 书籍规格名称
    quantity: number,  // 书籍数量
    price: number,     // 加购时单价
    selected: number   // 是否选中（1=是，0=否）
}

// 展示购物车数据
export class CartItemPages{
    selected_data: IQueryCartItem = {
        bookName: "",
        specName: "",
        current_page: 1,
        data_count: 0,
        single_page_size: 10
    }
    
    cartItem_list: ICartItem[] = []
    
    // 编辑购物车时用到的对象
    editCartItem: ICartItemEdit = {
        id: "",
        userId: 0,
        bookId: "",
        specId: "",
        bookName: "",
        specName: "",
        quantity: 0,
        price: 0,
        selected: 1
    }
    
    // 新增购物车时用到的对象
    addCartItem: IAddCartItem = {
        userId: 0,
        bookId: "",
        specId: "",
        bookName: "",
        specName: "",
        quantity: 0,
        price: 0,
        selected: 1
    }
}