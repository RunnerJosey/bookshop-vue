// 商品接口
export interface IGoods {
    userId?: number;   // 商品归属用户id，可选
    id: number;        // 商品id
    title: string;     // 商品标题
    introduce: string; // 商品介绍
    author?: string;   // 作者，可选
    creater?: string;  // 创建者，可选
    createTime?: string; // 创建时间，可选
    updater?: string;  // 更新者，可选
    updateTime?: string; // 更新时间，可选
    isDelete?: string; // 是否删除，可选
    bookName?: string; // 书籍名称，可选
}

// 分页接口
export interface IPage {
    current_page: number;
    data_count: number;
    single_page_size: number;
}

// 商品查询接口
export interface IQueryGoods extends IGoods, IPage {
}

// 商品具体展示数据
export class GoodsPages {
    // 被选择的数据, 查询时用
    selected_data: IQueryGoods = {
        title: "",
        userId: 0,
        id: 0,
        bookName: "",
        introduce: "",
        current_page: 1,
        data_count: 0,
        single_page_size: 10
    };
    // 展示的商品数据
    goods_list: IGoods[] = [];
}
