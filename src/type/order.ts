// 订单接口
export interface IOrder {
    id?: string,             // 主键ID (使用string格式)
    orderStatus?: number,    // 订单状态：0-待付款 1-待发货 2-待收货 3-已完成 4-已取消 5-退款中 6-已退款
    totalAmount?: number,    // 订单总金额（所有图书金额之和）
    payAmount?: number,      // 实际支付金额（扣除优惠券/满减后）
    discountAmount?: number, // 优惠金额（优惠券+满减等）
    freight?: number,        // 运费（满额包邮则为0）
    payType?: number,        // 支付方式：1-微信 2-支付宝 3-线下支付
    bookName?: string,       // 图书名称（冗余存储，避免图书表修改后订单名称变化）
    bookPrice?: number,      // 图书单价（下单时的价格，冗余存储）
    quantity?: number,       // 购买数量
    subtotal?: number,       // 该图书小计金额（book_price * quantity）
    createTime?: string,     // 创建时间
    updateTime?: string      // 更新时间
}

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

// 订单查询接口
export interface IQueryOrder extends IPage {
    bookName: string,        // 图书名称查询条件
    orderStatus: number      // 订单状态查询条件
}

// 展示订单数据
export class OrderPages{
    selected_data: IQueryOrder = {
        bookName: "",
        orderStatus: -1,      // -1表示全部状态
        current_page: 1,
        data_count: 0,
        single_page_size: 10
    }
    
    order_list: IOrder[] = []
}