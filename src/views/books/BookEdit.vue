<template>
  <div>
    <h2 v-if="!isDialogMode">{{ editMode ? '编辑书籍' : '新增书籍' }}</h2>
    <el-form
        :model="book"
        :rules="rules"
        ref="bookForm"
        label-width="100px"
        class="demo-bookForm"
    >
      <el-form-item label="书名" prop="bookName">
        <el-input v-model="book.bookName" placeholder="请输入书名"></el-input>
      </el-form-item>
      <el-form-item label="详情" prop="introduce">
        <el-input v-model="book.introduce" placeholder="请输入书籍详情"></el-input>
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model="book.author" placeholder="请输入作者"></el-input>
      </el-form-item>
      <el-form-item label="创建者" prop="creater">
        <el-input v-model="book.creater" placeholder="请输入创建者"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button v-if="isDialogMode" @click="cancelForm">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IGoods } from "@/type/books";
import type { FormInstance } from 'element-plus';
import {getBookById, updateBook,addBook} from '@/request/api';
import { ElMessage } from 'element-plus';


export default defineComponent({
  name: 'BookEdit',
  props: {
    isDialogMode: {
      type: Boolean,
      default: false
    },
    editMode: {
      type: Boolean,
      default: false
    },
    bookId: {
      type: Number,
      default: null
    }
  },
  emits: ['submit-success'],
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();
    const bookForm = ref<FormInstance>();

    // 初始化表单数据
    const book = reactive<IGoods>({
      id: "",
      bookName: '',
      introduce: '',
      author: '',
      creater: '',
      title: '',
      userId: undefined,
      createTime: '',
      updateTime: '',
      updater: '',
      isDelete: '0'
    });

    // 表单验证规则
    const rules = reactive({
      bookName: [
        { required: true, message: '请输入书名', trigger: 'blur' }
      ],
      introduce: [
        { required: true, message: '请输入书籍详情', trigger: 'blur' }
      ],
      author: [
        { required: true, message: '请输入作者', trigger: 'blur' }
      ],
      creater: [
        { required: true, message: '请输入创建者', trigger: 'blur' }
      ]
    });

    // 获取书籍详情
    const loadBookDetail = async (id: string) => {
      try {
        const res: any = await getBookById(id);
        // 适配新的接口返回数据结构
        if (res?.data && res.code === 200) {
          const bookData = res.data;
          Object.assign(book, bookData);
        } else {
          ElMessage.error('获取书籍详情失败');
        }
      } catch (error) {
        console.error('获取书籍详情失败:', error);
        ElMessage.error('获取书籍详情失败');
      }
    };

    // 重置表单
    const resetForm = () => {
      if (!bookForm.value) return;

      bookForm.value.resetFields();
      // 重置所有字段
      Object.assign(book, {
        id: 0,
        bookName: '',
        introduce: '',
        author: '',
        creater: '',
        title: '',
        userId: undefined,
        createTime: '',
        updateTime: '',
        updater: '',
        isDelete: '0'
      });
    };

    // 监听bookId变化，在编辑模式下加载数据
    watch(
      () => props.bookId,
      (newId) => {
        if (props.editMode && newId) {
          loadBookDetail(String(newId));
        } else if (!props.editMode) {
          // 新增模式下重置表单
          resetForm();
        }
      },
      { immediate: true }
    );

    // 组件挂载时获取数据（保持原有的路由参数方式兼容）
    onMounted(() => {
      // 只有在非弹窗模式下才从路由参数获取数据
      if (!props.isDialogMode) {
        const id = route.params.id;
        if (id && typeof id === 'string') {
          loadBookDetail(id);
        }
      }
    });

    // 提交表单
    const submitForm = async () => {
      if (!bookForm.value) return;
      await bookForm.value.validate(async (valid) => {
        if (valid) {
          try {
            if(props.editMode || (!props.isDialogMode && route.params.id)){
              //编辑模式：调用更新接口
              const res = await updateBook(book);
              console.log('updateBook返回：', res);
              if(res === true){
                ElMessage.success("更新成功");
                if (props.isDialogMode) {
                  emit('submit-success');
                } else {
                  router.push('/books');
                }
              }else {
                ElMessage.error(res.message || '更新失败');
              }
            }else{
              //新增模式
              console.log('新增数据:', book);
              const res = await addBook(book);
              if (res === true) {
                ElMessage.success("新增成功");
                if (props.isDialogMode) {
                  emit('submit-success');
                } else {
                  router.push('/books');
                }
              } else {
                ElMessage.error(res.message || '新增失败');
              }
            }
          } catch (error) {
            console.error('提交失败:', error);
            ElMessage.error('提交失败');
          }
        } else {
          ElMessage.warning('请填写必填项');
        }
      });
    };

    // 取消表单（仅用于弹窗模式）
    const cancelForm = () => {
      if (props.isDialogMode) {
        emit('submit-success'); // 使用相同事件关闭弹窗
      }
    };

    return {
      bookForm,
      book,
      rules,
      submitForm,
      resetForm,
      cancelForm
    };
  }
});
</script>

<style scoped>
.demo-bookForm {
  padding: 20px;
}
</style>