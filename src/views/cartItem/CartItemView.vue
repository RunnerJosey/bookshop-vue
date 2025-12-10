<script lang="ts">
import {defineComponent, onMounted, reactive, toRefs, ref, computed, watch} from 'vue';
import {addCartItem, deleteCartItem, getCartItemList, updateCartItem, addOrders} from "@/request/api";
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
    const editMode = ref(false); // false为新增，true为编辑
    const addressEditMode = ref(false); // false为新增，true为编辑
    const dialogTitle = computed(() => editMode.value ? '编辑购物车' : '新增购物车');
    const addressFormTitle = computed(() => addressEditMode.value ? '编辑收货地址' : '新增收货地址');
    const multipleSelection = ref<ICartItem[]>([]);
    const addressList = ref<any[]>([]); // 实际项目中应该使用具体类型
    
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
            orderStatus: 0           // 待付款状态
          };
        });
        
        // 调用批量新增订单接口
        await addOrders(orderDataArray);
        
        ElMessage.success(`成功创建${orderDataArray.length}个订单`);
        console.log('选中的商品:', multipleSelection.value);
        
        // 结算完成后，可以考虑清除选中项或刷新列表
        // 这里可以根据实际需求进行调整
      } catch (error: any) {
        console.error('结算失败:', error);
        ElMessage.error('结算失败: ' + (error.message || '未知错误'));
      }
    };
    
    // 管理收货地址
    const onManageAddress = () => {
      // 模拟获取地址列表
      addressList.value = [
        {
          id: "1",
          receiver: "张三",
          phone: "13800138000",
          address: "北京市朝阳区某某街道某某小区1号楼101室",
          isDefault: 1,
          tag: "家"
        },
        {
          id: "2",
          receiver: "李四",
          phone: "13900139000",
          address: "上海市浦东新区某某路123号某某大厦",
          isDefault: 0,
          tag: "公司"
        }
      ];
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
      ).then(() => {
        // 模拟删除操作
        addressList.value = addressList.value.filter(item => item.id !== id);
        ElMessage.success('删除成功');
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
              const index = addressList.value.findIndex(item => item.id === addressFormData.id);
              if (index !== -1) {
                addressList.value[index] = { ...addressFormData };
                ElMessage.success('地址更新成功');
              }
            } else {
              // 新增模式
              const newAddress = {
                ...addressFormData,
                id: Date.now().toString() // 简单生成ID
              };
              addressList.value.push(newAddress);
              ElMessage.success('地址添加成功');
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
      editMode,
      addressEditMode,
      dialogTitle,
      addressFormTitle,
      showedDataList,
      multipleSelection,
      addressList,
      onSearchCartItem,
      onAddCartItem,
      onEditCartItem,
      onDeleteCartItem,
      handleSelectionChange,
      onCheckout,
      onManageAddress,
      onAddAddress,
      onEditAddress,
      onDeleteAddress,
      submitCartItemForm,
      submitAddressForm,
      handleDialogClose,
      handleAddressDialogClose,
      handleAddressFormDialogClose,
      currentChange,
      sizeChange
    }
  }
})
</script>