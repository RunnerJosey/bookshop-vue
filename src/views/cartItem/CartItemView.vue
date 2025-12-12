<template>
  <div>
    <el-form :inline="true" :model="selected_data" class="search-form">
      <el-form-item label="书籍名称">
        <el-input v-model="selected_data.bookName" placeholder="请输入书籍名称" />
      </el-form-item>
      
      <el-form-item label="书籍规格">
        <el-input v-model="selected_data.specName" placeholder="请输入书籍规格" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSearchCartItem">查询</el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onManageAddress">管理收货地址</el-button>
      </el-form-item>

      <el-form-item>
        <el-button color="#165DFF" @click="onCheckout">去结算</el-button>
      </el-form-item>
      

    </el-form>

    <el-table :data="showedDataList.compDataList" border style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="serialNumber" label="编号" width="60" />
      <el-table-column prop="id" label="购物车id" width="100" v-if="false" />
      <el-table-column prop="userId" label="用户ID" width="100" v-if="false" />
      <el-table-column prop="bookName" label="书籍名称" width="150" />
      <el-table-column prop="specName" label="书籍规格" width="150" />
      <el-table-column prop="quantity" label="数量" width="80" />
      <el-table-column prop="price" label="单价" width="100">
        <template #default="scope">
          ¥{{ scope.row.price.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="addTime" label="加购时间" width="180" />
      <el-table-column prop="updateTime" label="更新时间" width="180" />
      <el-table-column label="操作" width="140">
        <template #default="scope">
          <el-button type="primary" size="small" @click="onEditCartItem(scope.row)" style="margin-right: 5px;">修改</el-button>
          <el-button type="danger" size="small" @click="onDeleteCartItem(scope.row.id)">删除</el-button>
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

    <!-- 新增/编辑购物车弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleDialogClose">
      <el-form
        :model="formData"
        :rules="cartItemRules"
        ref="cartItemFormRef"
        label-width="100px">
        <el-form-item label="购物车ID" prop="id" v-show="false">
        </el-form-item>
        <el-form-item label="用户ID" prop="userId" v-show="false">
          <el-input
            v-model.number="formData.userId"
            placeholder="请输入用户ID" >
          </el-input>
        </el-form-item>

        <el-form-item label="书籍SKU ID" prop="bookId" v-show="false">
          <el-input
            v-model="formData.bookId"
            placeholder="请输入书籍SKU ID">
          </el-input>
        </el-form-item>

        <el-form-item label="书籍规格ID" prop="specId" v-show="false">
          <el-input
            v-model="formData.specId"
            placeholder="请输入书籍规格ID">
          </el-input>
        </el-form-item>

        <el-form-item label="书籍名称" prop="bookName">
          <el-input
            v-model="formData.bookName"
            placeholder="请输入书籍名称">
          </el-input>
        </el-form-item>

        <el-form-item label="书籍规格" prop="specName">
          <el-input
            v-model="formData.specName"
            placeholder="请输入书籍规格">
          </el-input>
        </el-form-item>

        <el-form-item label="数量" prop="quantity">
          <el-input-number
            v-model="formData.quantity"
            :min="1"
            controls-position="right"
            style="width: 100%">
          </el-input-number>
        </el-form-item>

        <el-form-item label="单价" prop="price" v-show="false">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 100%">
          </el-input-number>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCartItemForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 管理收货地址弹窗 -->
    <el-dialog v-model="addressDialogVisible" title="管理收货地址" width="800px" @close="handleAddressDialogClose">
      <div style="margin-bottom: 20px;">
        <el-button type="primary" @click="onAddAddress">新增地址</el-button>
      </div>
      
      <el-table :data="addressList" border style="width: 100%">
        <el-table-column prop="receiver" label="收件人" width="100" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="address" label="收货地址" />
        <el-table-column prop="tag" label="地址标签" width="100" />
        <el-table-column label="是否默认" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.isDefault === 1" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" size="small" @click="onEditAddress(scope.row)" style="margin-right: 5px;">修改</el-button>
            <el-button type="danger" size="small" @click="onDeleteAddress(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addressDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增/编辑地址弹窗 -->
    <el-dialog v-model="addressFormDialogVisible" :title="addressFormTitle" width="500px" @close="handleAddressFormDialogClose">
      <el-form
        :model="addressFormData"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px">
        <el-form-item label="收件人" prop="receiver">
          <el-input v-model="addressFormData.receiver" placeholder="请输入收件人"></el-input>
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addressFormData.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        
        <el-form-item label="收货地址" prop="address">
          <el-input 
            v-model="addressFormData.address" 
            type="textarea" 
            placeholder="请输入收货地址"
            :rows="3">
          </el-input>
        </el-form-item>
        
        <el-form-item label="地址标签" prop="tag">
          <el-input v-model="addressFormData.tag" placeholder="请输入地址标签"></el-input>
        </el-form-item>
        
        <el-form-item label="设为默认">
          <el-switch 
            v-model="addressFormData.isDefault" 
            :active-value="1" 
            :inactive-value="0">
          </el-switch>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addressFormDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddressForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 结算弹窗 -->
    <el-dialog v-model="checkoutDialogVisible" title="订单结算" width="800px" @close="handleCheckoutDialogClose">
      <el-form label-width="100px">
        <!-- 收货地址选择 -->
        <el-form-item label="收货地址">
          <el-select 
            v-model="selectedAddressId" 
            placeholder="请选择收货地址" 
            style="width: 100%"
            @change="onAddressChange">
            <el-option
              v-for="address in addressList"
              :key="address.id"
              :label="`${address.receiver} ${address.phone} ${address.address}`"
              :value="address.id">
              <div style="display: flex; justify-content: space-between; width: 100%;">
                <span>{{ address.receiver }} {{ address.tag }}</span>
                <span v-if="address.isDefault" style="color: #409eff;">[默认]</span>
              </div>
              <div style="font-size: 12px; color: #999;">{{ address.address }}</div>
            </el-option>
          </el-select>
          <div style="margin-top: 10px;" v-if="selectedAddressInfo">
            <el-card shadow="never" style="border: none;">
              <div><strong>收件人：</strong>{{ selectedAddressInfo.receiver }}</div>
              <div><strong>手机号：</strong>{{ selectedAddressInfo.phone }}</div>
              <div><strong>收货地址：</strong>{{ selectedAddressInfo.address }}</div>
            </el-card>
          </div>
        </el-form-item>

        <!-- 商品详情 -->
        <el-form-item label="商品详情">
          <el-table :data="multipleSelection" border style="width: 100%">
            <el-table-column prop="bookName" label="书籍名称" width="150" />
            <el-table-column prop="specName" label="规格" width="120" />
            <el-table-column prop="price" label="单价" width="100">
              <template #default="scope">
                ¥{{ scope.row.price.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column label="小计" width="100">
              <template #default="scope">
                ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>

        <!-- 订单汇总 -->
        <el-form-item label="订单汇总">
          <div style="text-align: left; width: 80%;">
            <el-descriptions :column="1" style="display: inline-block; text-align: left; float: left;">
              <el-descriptions-item label="商品总数：">{{ totalQuantity }}</el-descriptions-item>
              <el-descriptions-item label="商品总价：">¥{{ totalAmount.toFixed(2) }}</el-descriptions-item>
              <el-descriptions-item label="运费：">¥{{ shippingFee.toFixed(2) }}</el-descriptions-item>
              <el-descriptions-item label="优惠金额：">-¥{{ discountAmount.toFixed(2) }}</el-descriptions-item>
              <el-descriptions-item label="应付金额：">
                <span style="color: #ff0000; font-size: 16px; font-weight: bold;">
                  ¥{{ payableAmount.toFixed(2) }}
                </span>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="checkoutDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCheckout" :loading="isCheckingOut">确定结算</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, toRefs, ref, computed, watch} from 'vue';
import {addCartItem, deleteCartItem, getCartItemList, updateCartItem, addOrders, getAddressList, addAddress, updateAddress, deleteAddress} from "@/request/api";
import {ICartItem, CartItemPages, IAddCartItem, ICartItemEdit} from "@/type/cartItem";
import { ElMessageBox, ElMessage, FormInstance } from 'element-plus';

export default defineComponent({
  setup () {
    const cartItem_data = reactive(new CartItemPages())
    const cartItemFormRef = ref<FormInstance>();
    const addressFormRef = ref<FormInstance>();
    const dialogVisible = ref(false);
    const addressDialogVisible = ref(false);
    const addressFormDialogVisible = ref(false);
    const checkoutDialogVisible = ref(false);
    const isCheckingOut = ref(false);
    const editMode = ref(false); // false为新增，true为编辑
    const addressEditMode = ref(false); // false为新增，true为编辑
    const dialogTitle = computed(() => editMode.value ? '编辑购物车' : '新增购物车');
    const addressFormTitle = computed(() => addressEditMode.value ? '编辑收货地址' : '新增收货地址');
    const multipleSelection = ref<ICartItem[]>([]);
    const addressList = ref<any[]>([]); // 实际项目中应该使用具体类型
    const selectedAddressId = ref<string>("");
    const selectedAddressInfo = ref<any>(null);
    
    // 表单数据（解决v-model不能使用三元表达式的问题）
    const formData = reactive({
      id: "",  // 添加id字段
      userId: 0,
      bookId: "",
      specId: "",
      bookName: "",
      specName: "",
      quantity: 1,
      price: 0
    });

    // 地址表单数据
    const addressFormData = reactive({
      id: "",
      receiver: "",
      phone: "",
      address: "",
      isDefault: 0,
      tag: ""
    });

    // 表单验证规则
    const cartItemRules = {
      bookName: [
        { required: true, message: '请输入书籍名称', trigger: 'blur' }
      ],
      specName: [
        { required: true, message: '请输入书籍规格', trigger: 'blur' }
      ]
    };

    // 地址表单验证规则
    const addressFormRules = {
      receiver: [
        { required: true, message: '请输入收件人', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' }
      ],
      address: [
        { required: true, message: '请输入收货地址', trigger: 'blur' }
      ],
      tag: [
        { required: true, message: '请输入地址标签', trigger: 'blur' }
      ]
    };

    // 添加分页相关字段到selected_data
    cartItem_data.selected_data.current_page = 1;
    cartItem_data.selected_data.data_count = 0;
    cartItem_data.selected_data.single_page_size = 10;

    onMounted(() => {
      p_getCartItemList()  // 获取全部购物车数据
    })

    // 获取全部购物车数据
    const p_getCartItemList = () => {
      getCartItemList({
        current: cartItem_data.selected_data.current_page,
        size: cartItem_data.selected_data.single_page_size,
        bookName: cartItem_data.selected_data.bookName,
        specName: cartItem_data.selected_data.specName
      }).then((res: any) => {
        // 适配新的数据结构 {code: 200, data: {records: [...], ...}, message: "success"}
        if (res && res.code === 200 && res.data && Array.isArray(res.data.records)) {
          // 将ID转换为字符串以避免精度问题
          const processedRecords = res.data.records.map((record: any) => ({
            ...record,
            id: record.id.toString() // 转换为字符串
          }));
          
          cartItem_data.cartItem_list = processedRecords;
          cartItem_data.selected_data.data_count = res.data.total;
        } else {
          console.error("API 数据格式不正确:", res);
          cartItem_data.cartItem_list = [];
          cartItem_data.selected_data.data_count = 0;
          ElMessage.error('获取购物车数据失败');
        }
      }).catch(error => {
        console.error('获取购物车列表失败:', error);
        cartItem_data.cartItem_list = [];
        cartItem_data.selected_data.data_count = 0;
        ElMessage.error('获取购物车数据失败');
      });
    }

    // 计算属性, 切割出实际上需要展示的数据，并添加序号
    const showedDataList = reactive({
      compDataList: computed(() => {
        return cartItem_data.cartItem_list.map((item, index) => {
          return {
            ...item,
            serialNumber: (cartItem_data.selected_data.current_page - 1) * cartItem_data.selected_data.single_page_size + index + 1
          };
        });
      })
    });

    // 分页相关方法
    const currentChange = (page: number) => {
      cartItem_data.selected_data.current_page = page;
      p_getCartItemList();
    };

    const sizeChange = (page_size: number) => {
      cartItem_data.selected_data.single_page_size = page_size;
      cartItem_data.selected_data.current_page = 1;
      p_getCartItemList();
    };

    // 查询购物车
    const onSearchCartItem = () => {
      cartItem_data.selected_data.current_page = 1;
      p_getCartItemList();
    };

    // 新增购物车
    const onAddCartItem = () => {
      editMode.value = false;
      // 重置表单数据
      Object.assign(formData, {
        id: "",  // 重置id字段
        userId: 0,
        bookId: "",
        specId: "",
        bookName: "",
        specName: "",
        quantity: 1,
        price: 0
      });
      dialogVisible.value = true;
    };

    // 编辑购物车
    const onEditCartItem = (row: ICartItem) => {
      editMode.value = true;
      // 填充表单数据
      Object.assign(formData, {
        id: row.id,  // 添加id字段
        userId: row.userId,
        bookId: row.bookId,
        specId: row.specId,
        bookName: row.bookName,
        specName: row.specName,
        quantity: row.quantity,
        price: row.price
      });
      dialogVisible.value = true;
    };

    // 删除购物车
    const onDeleteCartItem = (id: string) => {
      ElMessageBox.confirm(
        '确定要删除这个购物车记录吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(async () => {
        try {
          await deleteCartItem([id]);
          ElMessage.success('删除成功');
          p_getCartItemList(); // 重新加载购物车列表
        } catch (error: any) {
          console.error('删除购物车失败:', error);
          ElMessage.error('删除失败: ' + (error.message || '未知错误'));
        }
      }).catch(() => {
        // 用户取消删除
      });
    };

    // 提交购物车表单
    const submitCartItemForm = async () => {
      if (!cartItemFormRef.value) return;
      await cartItemFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            if (editMode.value) {
              // 编辑模式
              const editData: ICartItemEdit = {
                id: formData.id,  // 确保传递id字段
                userId: formData.userId,
                bookId: formData.bookId,
                specId: formData.specId,
                bookName: formData.bookName,
                specName: formData.specName,
                quantity: formData.quantity,
                price: formData.price,
                selected: 1 // 默认选中
              };
              await updateCartItem(editData);
              ElMessage.success('购物车更新成功');
            } else {
              // 新增模式
              const addData: IAddCartItem = { 
                userId: formData.userId,
                bookId: formData.bookId,
                specId: formData.specId,
                bookName: formData.bookName,
                specName: formData.specName,
                quantity: formData.quantity,
                price: formData.price,
                selected: 1 // 默认选中
              };
              await addCartItem(addData);
              ElMessage.success('购物车添加成功');
            }
            p_getCartItemList(); // 重新加载购物车列表
            dialogVisible.value = false;
          } catch (error: any) {
            console.error('操作购物车失败:', error);
            ElMessage.error('操作失败: ' + (error.message || '未知错误'));
          }
        } else {
          ElMessage.warning('请填写必填项');
        }
      });
    };

    // 处理弹窗关闭
    const handleDialogClose = () => {
      if (cartItemFormRef.value) {
        cartItemFormRef.value.resetFields();
      }
    };

    // 监听查询条件变化
    watch(
      [() => cartItem_data.selected_data.bookName, () => cartItem_data.selected_data.specName],
      ([newBookName, newSpecName]) => {
        if (!newBookName && !newSpecName) {
          p_getCartItemList();
        }
      }
    );
    
    // 处理多选变化
    const handleSelectionChange = (val: ICartItem[]) => {
      multipleSelection.value = val;
    };
    
    // 去结算
    const onCheckout = async () => {
      if (multipleSelection.value.length === 0) {
        ElMessage.warning('请至少选择一个商品');
        return;
      }
      
      // 初始化地址列表
      initAddressList();
      
      // 显示结算弹窗
      checkoutDialogVisible.value = true;
    };
    
    // 初始化地址列表
    const initAddressList = () => {
      // 从接口获取地址列表
      getAddressList().then((res: any) => {
        if (res && res.code === 200 && res.data) {
          addressList.value = res.data;
          
          // 设置默认地址
          const defaultAddress = addressList.value.find((addr: any) => addr.isDefault === 1);
          if (defaultAddress) {
            selectedAddressId.value = defaultAddress.id;
            selectedAddressInfo.value = defaultAddress;
          } else if (addressList.value.length > 0) {
            selectedAddressId.value = addressList.value[0].id;
            selectedAddressInfo.value = addressList.value[0];
          }
        } else {
          console.error("获取地址列表失败:", res);
          ElMessage.error('获取地址列表失败');
        }
      }).catch((error: any) => {
        console.error('获取地址列表失败:', error);
        ElMessage.error('获取地址列表失败: ' + (error.message || '未知错误'));
      });
    };
    
    // 地址变更处理
    const onAddressChange = (addressId: string) => {
      const address = addressList.value.find(addr => addr.id === addressId);
      if (address) {
        selectedAddressInfo.value = address;
      }
    };
    
    // 确定结算
    const confirmCheckout = async () => {
      if (!selectedAddressId.value) {
        ElMessage.warning('请选择收货地址');
        return;
      }
      
      isCheckingOut.value = true;
      
      try {
        // 准备订单数据数组
        const orderDataArray = multipleSelection.value.map(item => {
          const subtotal = item.price * item.quantity;
          return {
            bookName: item.bookName,
            bookPrice: item.price,
            quantity: item.quantity,
            subtotal: subtotal,
            totalAmount: subtotal,    // 单个商品订单总额就是小计
            payAmount: subtotal,      // 实付金额
            discountAmount: 0,       // 无折扣
            freight: 0,              // 无运费
            payType: 1,              // 默认微信支付
            orderStatus: 0,          // 待付款状态
            addressId: selectedAddressId.value  // 添加地址ID
          };
        });
        
        // 调用批量新增订单接口
        await addOrders(orderDataArray);
        
        ElMessage.success(`成功创建${orderDataArray.length}个订单`);
        console.log('选中的商品:', multipleSelection.value);
        
        // 关闭结算弹窗
        checkoutDialogVisible.value = false;
        
        // 可以在这里添加其他操作，比如清空购物车等
      } catch (error: any) {
        console.error('结算失败:', error);
        ElMessage.error('结算失败: ' + (error.message || '未知错误'));
      } finally {
        isCheckingOut.value = false;
      }
    };
    
    // 管理收货地址
    const onManageAddress = () => {
      // 从接口获取地址列表
      getAddressList().then((res: any) => {
        if (res && res.code === 200 && res.data) {
          addressList.value = res.data;
        } else {
          console.error("获取地址列表失败:", res);
          ElMessage.error('获取地址列表失败');
        }
      }).catch((error: any) => {
        console.error('获取地址列表失败:', error);
        ElMessage.error('获取地址列表失败: ' + (error.message || '未知错误'));
      });
      addressDialogVisible.value = true;
    };
    
    // 新增地址
    const onAddAddress = () => {
      addressEditMode.value = false;
      // 重置表单数据
      Object.assign(addressFormData, {
        id: "",
        receiver: "",
        phone: "",
        address: "",
        isDefault: 0,
        tag: ""
      });
      addressFormDialogVisible.value = true;
    };
    
    // 编辑地址
    const onEditAddress = (row: any) => {
      addressEditMode.value = true;
      // 填充表单数据
      Object.assign(addressFormData, {
        id: row.id,
        receiver: row.receiver,
        phone: row.phone,
        address: row.address,
        isDefault: row.isDefault,
        tag: row.tag
      });
      addressFormDialogVisible.value = true;
    };
    
    // 删除地址
    const onDeleteAddress = (id: string) => {
      ElMessageBox.confirm(
        '确定要删除这个收货地址吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(async () => {
        try {
          // 调用删除地址接口
          await deleteAddress(id);
          ElMessage.success('删除成功');
          
          // 重新获取地址列表
          initAddressList();
          
          // 如果删除的是当前选中的地址，则清空选中
          if (selectedAddressId.value === id) {
            selectedAddressId.value = "";
            selectedAddressInfo.value = null;
          }
        } catch (error: any) {
          console.error('删除地址失败:', error);
          ElMessage.error('删除失败: ' + (error.message || '未知错误'));
        }
      }).catch(() => {
        // 用户取消删除
      });
    };
    
    // 提交地址表单
    const submitAddressForm = async () => {
      if (!addressFormRef.value) return;
      await addressFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            if (addressEditMode.value) {
              // 编辑模式
              await updateAddress(addressFormData);
              ElMessage.success('地址更新成功');
              // 重新获取地址列表
              initAddressList();
            } else {
              // 新增模式
              await addAddress(addressFormData);
              ElMessage.success('地址添加成功');
              // 重新获取地址列表
              initAddressList();
            }
            addressFormDialogVisible.value = false;
          } catch (error: any) {
            console.error('操作地址失败:', error);
            ElMessage.error('操作失败: ' + (error.message || '未知错误'));
          }
        } else {
          ElMessage.warning('请填写必填项');
        }
      });
    };
    
    // 处理地址弹窗关闭
    const handleAddressDialogClose = () => {
      // 地址列表弹窗关闭时不需要特殊处理
    };
    
    // 处理地址表单弹窗关闭
    const handleAddressFormDialogClose = () => {
      if (addressFormRef.value) {
        addressFormRef.value.resetFields();
      }
    };
    
    // 处理结算弹窗关闭
    const handleCheckoutDialogClose = () => {
      // 结算弹窗关闭时不需要特殊处理
    };
    
    // 计算商品总数
    const totalQuantity = computed(() => {
      return multipleSelection.value.reduce((total, item) => total + item.quantity, 0);
    });
    
    // 计算商品总价
    const totalAmount = computed(() => {
      return multipleSelection.value.reduce((total, item) => total + (item.price * item.quantity), 0);
    });
    
    // 运费（假设满50免运费）
    const shippingFee = computed(() => {
      return totalAmount.value >= 50 ? 0 : 5;
    });
    
    // 优惠金额（假设无优惠）
    const discountAmount = ref(0);
    
    // 应付金额
    const payableAmount = computed(() => {
      return totalAmount.value + shippingFee.value - discountAmount.value;
    });

    return {
      cartItem_data,
      ...toRefs(cartItem_data),
      formData,
      addressFormData,
      cartItemRules,
      addressFormRules,
      cartItemFormRef,
      addressFormRef,
      dialogVisible,
      addressDialogVisible,
      addressFormDialogVisible,
      checkoutDialogVisible,
      isCheckingOut,
      editMode,
      addressEditMode,
      dialogTitle,
      addressFormTitle,
      showedDataList,
      multipleSelection,
      addressList,
      selectedAddressId,
      selectedAddressInfo,
      totalQuantity,
      totalAmount,
      shippingFee,
      discountAmount,
      payableAmount,
      onSearchCartItem,
      onAddCartItem,
      onEditCartItem,
      onDeleteCartItem,
      handleSelectionChange,
      onCheckout,
      onAddressChange,
      confirmCheckout,
      onManageAddress,
      onAddAddress,
      onEditAddress,
      onDeleteAddress,
      submitCartItemForm,
      submitAddressForm,
      handleDialogClose,
      handleAddressDialogClose,
      handleAddressFormDialogClose,
      handleCheckoutDialogClose,
      currentChange,
      sizeChange
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