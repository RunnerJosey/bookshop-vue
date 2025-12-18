<template>
  <div>
    <el-form :inline="true" :model="selected_data" class="search-form">
      <el-form-item label="图书名称">
        <el-input v-model="selected_data.bookName" placeholder="请输入图书名称" />
      </el-form-item>
      
      <el-form-item label="订单状态">
        <el-select v-model="selected_data.orderStatus" placeholder="请选择订单状态" clearable>
          <el-option label="全部状态" :value="-1"></el-option>
          <el-option label="待付款" :value="0"></el-option>
          <el-option label="待发货" :value="1"></el-option>
          <el-option label="待收货" :value="2"></el-option>
          <el-option label="已完成" :value="3"></el-option>
          <el-option label="已取消" :value="4"></el-option>
          <el-option label="退款中" :value="5"></el-option>
          <el-option label="已退款" :value="6"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSearchOrder">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="showedDataList.compDataList" border style="width: 100%">
      <el-table-column prop="serialNumber" label="编号" width="60" />
      <el-table-column prop="id" label="订单ID" width="100" />
      <el-table-column prop="bookName" label="图书名称" width="150" />
      <el-table-column prop="bookPrice" label="图书单价" width="100">
        <template #default="scope">
          ¥{{ (scope.row.bookPrice || 0).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="quantity" label="购买数量" width="100" />
      <el-table-column prop="subtotal" label="小计金额" width="100">
        <template #default="scope">
          ¥{{ (scope.row.subtotal || 0).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="订单总金额" width="120">
        <template #default="scope">
          ¥{{ (scope.row.totalAmount || 0).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="discountAmount" label="优惠金额" width="100">
        <template #default="scope">
          ¥{{ (scope.row.discountAmount || 0).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="freight" label="运费" width="80">
        <template #default="scope">
          ¥{{ (scope.row.freight || 0).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="payAmount" label="实付金额" width="120">
        <template #default="scope">
          ¥{{ (scope.row.payAmount || 0).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="orderStatusText" label="订单状态" width="100">
        <template #default="scope">
          <el-tag :type="getOrderStatusTagType(scope.row.orderStatus || 0)">
            {{ getOrderStatusText(scope.row.orderStatus || 0) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="payTypeText" label="支付方式" width="100">
        <template #default="scope">
          {{ getPayTypeText(scope.row.payType || 1) }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="updateTime" label="更新时间" width="180" />
      <el-table-column label="操作" width="140">
        <template #default="scope">
          <el-button type="primary" size="small" @click="onViewOrder(scope.row)" style="margin-right: 5px;">查看</el-button>
          <el-button type="danger" size="small" @click="onDeleteOrder(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
          v-model:current-page="selected_data.current_page"
          v-model:page-size="selected_data.single_page_size"
          :page-sizes="[10, 20, 30, 50]"
          :total="selected_data.data_count"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="sizeChange"
          @current-change="currentChange"
      />
    </div>

    <!-- 查看订单详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="600px">
      <el-form label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="订单ID：">
              {{ currentOrder.id }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单状态：">
              <el-tag :type="getOrderStatusTagType(currentOrder.orderStatus || 0)">
                {{ getOrderStatusText(currentOrder.orderStatus || 0) }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row>
          <el-col :span="12">
            <el-form-item label="图书名称：">
              {{ currentOrder.bookName }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="购买数量：">
              {{ currentOrder.quantity }}
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row>
          <el-col :span="12">
            <el-form-item label="图书单价：">
              ¥{{ (currentOrder.bookPrice || 0).toFixed(2) }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="小计金额：">
              ¥{{ (currentOrder.subtotal || 0).toFixed(2) }}
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row>
          <el-col :span="12">
            <el-form-item label="订单总金额：">
              ¥{{ (currentOrder.totalAmount || 0).toFixed(2) }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优惠金额：">
              ¥{{ (currentOrder.discountAmount || 0).toFixed(2) }}
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row>
          <el-col :span="12">
            <el-form-item label="运费：">
              ¥{{ (currentOrder.freight || 0).toFixed(2) }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实付金额：">
              ¥{{ (currentOrder.payAmount || 0).toFixed(2) }}
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row>
          <el-col :span="12">
            <el-form-item label="支付方式：">
              {{ getPayTypeText(currentOrder.payType || 1) }}
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row>
          <el-col :span="12">
            <el-form-item label="创建时间：">
              {{ currentOrder.createTime }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间：">
              {{ currentOrder.updateTime }}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, toRefs, computed, ref} from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { OrderPages, IOrder } from "@/type/order";
import {getOrderList, deleteOrder} from "@/request/api";

export default defineComponent({
  name: 'OrderView',
  setup() {
    const order_data = reactive(new OrderPages())
    const detailDialogVisible = ref(false);
    const currentOrder = ref<IOrder>({
      id: "",
      orderStatus: 0,
      totalAmount: 0,
      payAmount: 0,
      discountAmount: 0,
      freight: 0,
      payType: 1,
      bookName: "",
      bookPrice: 0,
      quantity: 0,
      subtotal: 0,
      createTime: "",
      updateTime: ""
    });

    // 添加分页相关字段到selected_data
    order_data.selected_data.current_page = 1;
    order_data.selected_data.data_count = 0;
    order_data.selected_data.single_page_size = 10;

    onMounted(() => {
      p_getOrderList()  // 获取全部订单数据
    })

    // 获取全部订单数据
    const p_getOrderList = () => {
      getOrderList({
        current: order_data.selected_data.current_page,
        size: order_data.selected_data.single_page_size,
        bookName: order_data.selected_data.bookName || undefined,
        orderStatus: order_data.selected_data.orderStatus >= 0 ? order_data.selected_data.orderStatus : undefined
      }).then((res: any) => {
        // 适配新的数据结构 {code: 200, data: {records: [...], ...}, message: "success"}
        if (res && res.code === 200 && res.data && Array.isArray(res.data.records)) {
          // 将ID转换为字符串以避免精度问题
          const processedRecords = res.data.records.map((record: any) => ({
            ...record,
            id: (record.id || record.orderId || '').toString(), // 转换为字符串
            // 确保所有必需字段都有默认值
            orderStatus: record.orderStatus !== undefined ? record.orderStatus : 0,
            totalAmount: record.totalAmount !== undefined ? record.totalAmount : 0,
            payAmount: record.payAmount !== undefined ? record.payAmount : 0,
            discountAmount: record.discountAmount !== undefined ? record.discountAmount : 0,
            freight: record.freight !== undefined ? record.freight : 0,
            payType: record.payType !== undefined ? record.payType : 1,
            bookName: record.bookName !== undefined ? record.bookName : "",
            bookPrice: record.bookPrice !== undefined ? record.bookPrice : 0,
            quantity: record.quantity !== undefined ? record.quantity : 0,
            subtotal: record.subtotal !== undefined ? record.subtotal : 0,
            createTime: record.createTime !== undefined ? record.createTime : "",
            updateTime: record.updateTime !== undefined ? record.updateTime : ""
          }));
          
          order_data.order_list = processedRecords;
          order_data.selected_data.data_count = res.data.total || res.data.records.length;
        } else {
          console.error("API 数据格式不正确:", res);
          order_data.order_list = [];
          order_data.selected_data.data_count = 0;
          ElMessage.error('获取订单数据失败');
        }
      }).catch(error => {
        console.error('获取订单列表失败:', error);
        order_data.order_list = [];
        order_data.selected_data.data_count = 0;
        ElMessage.error('获取订单数据失败');
      });
    }

    // 计算属性, 切割出实际上需要展示的数据，并添加序号
    const showedDataList = reactive({
      compDataList: computed(() => {
        return order_data.order_list.map((item, index) => {
          return {
            ...item,
            serialNumber: (order_data.selected_data.current_page - 1) * order_data.selected_data.single_page_size + index + 1,
            orderStatusText: getOrderStatusText(item.orderStatus || 0),
            payTypeText: getPayTypeText(item.payType || 1)
          };
        });
      })
    });

    // 分页相关方法
    const currentChange = (page: number) => {
      order_data.selected_data.current_page = page;
      p_getOrderList();
    };

    const sizeChange = (page_size: number) => {
      order_data.selected_data.single_page_size = page_size;
      order_data.selected_data.current_page = 1;
      p_getOrderList();
    };

    // 查询订单
    const onSearchOrder = () => {
      order_data.selected_data.current_page = 1;
      p_getOrderList();
    };

    // 查看订单详情
    const onViewOrder = (row: IOrder) => {
      currentOrder.value = {...row};
      detailDialogVisible.value = true;
    };

    // 删除订单
    const onDeleteOrder = (id: string) => {
      ElMessageBox.confirm(
        '确定要删除这个订单吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(async () => {
        try {
          await deleteOrder([id]);
          ElMessage.success('删除成功');
          p_getOrderList(); // 重新加载订单列表
        } catch (error: any) {
          console.error('删除订单失败:', error);
          ElMessage.error('删除失败: ' + (error.message || '未知错误'));
        }
      }).catch(() => {
        // 用户取消删除
      });
    };

    // 获取订单状态文本
    const getOrderStatusText = (status: number): string => {
      const statusMap: { [key: number]: string } = {
        0: '待付款',
        1: '待发货',
        2: '待收货',
        3: '已完成',
        4: '已取消',
        5: '退款中',
        6: '已退款'
      };
      return statusMap[status] || '未知状态';
    };

    // 获取订单状态标签类型
    const getOrderStatusTagType = (status: number): "success" | "warning" | "info" | "danger" | "" => {
      const typeMap: { [key: number]: "success" | "warning" | "info" | "danger" | "" } = {
        0: 'danger',   // 待付款
        1: 'warning',  // 待发货
        2: 'warning',  // 待收货
        3: 'success',  // 已完成
        4: 'info',     // 已取消
        5: 'warning',  // 退款中
        6: 'info'     // 已退款
      };
      return typeMap[status] || '';
    };

    // 获取支付方式文本
    const getPayTypeText = (payType: number): string => {
      const payTypeMap: { [key: number]: string } = {
        1: '微信',
        2: '支付宝',
        3: '线下支付'
      };
      return payTypeMap[payType] || '未知支付方式';
    };

    return {
      ...toRefs(order_data),
      detailDialogVisible,
      currentOrder,
      showedDataList,
      onSearchOrder,
      onViewOrder,
      onDeleteOrder,
      currentChange,
      sizeChange,
      getOrderStatusText,
      getOrderStatusTagType,
      getPayTypeText
    }
  }
})
</script>

<style scoped>
.search-form{
  padding: 10px 0 0 10px;
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

/* 美化分页组件样式 */
::v-deep(.el-pagination) {
  padding: 0;
  font-weight: normal;
}

::v-deep(.el-pagination .el-pagination__total) {
  margin-right: 16px;
}

::v-deep(.el-pagination .el-pagination__sizes) {
  margin-right: 16px;
}

::v-deep(.el-pagination .btn-prev),
::v-deep(.el-pagination .btn-next) {
  background: #f4f4f5;
  border-radius: 4px;
}

::v-deep(.el-pagination .el-pager li) {
  background: #f4f4f5;
  border-radius: 4px;
}

::v-deep(.el-pagination .el-pager li.active) {
  background-color: #409eff;
  color: #fff;
}
</style>