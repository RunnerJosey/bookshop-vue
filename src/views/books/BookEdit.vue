<template>
  <div>
    <h2>{{ isEdit ? '编辑书籍' : '新增书籍' }}</h2>
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
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IGoods } from "@/type/goods";
import type { FormInstance } from 'element-plus';
import { getBookById } from '@/request/api';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'BookEdit',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const bookForm = ref<FormInstance>();
    const isEdit = ref(false);

    // 初始化表单数据
    const book = reactive<IGoods>({
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
    const getBookDetail = async (id: string) => {
      try {
        const res = await getBookById(id);
        if (res?.data?.records?.[0]) {
          const bookData = res.data.records[0];
          Object.assign(book, bookData);
        } else {
          ElMessage.error('获取书籍详情失败');
        }
      } catch (error) {
        console.error('获取书籍详情失败:', error);
        ElMessage.error('获取书籍详情失败');
      }
    };

    // 组件挂载时获取数据
    onMounted(() => {
      const id = route.params.id;
      if (id && typeof id === 'string') {
        isEdit.value = true;
        getBookDetail(id);
      }
    });

    // 提交表单
    const submitForm = async () => {
      if (!bookForm.value) return;

      await bookForm.value.validate(async (valid) => {
        if (valid) {
          try {
            // TODO: 调用提交接口
            console.log('提交数据:', book);
            ElMessage.success('提交成功');
            router.push('/books'); // 返回列表页
          } catch (error) {
            console.error('提交失败:', error);
            ElMessage.error('提交失败');
          }
        }
      });
    };

    // 重置表单
    const resetForm = () => {
      if (!bookForm.value) return;

      bookForm.value.resetFields();
      if (!isEdit.value) {
        // 新增时重置所有字段
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
      } else {
        // 编辑时重新获取原始数据
        const id = route.params.id;
        if (id && typeof id === 'string') {
          getBookDetail(id);
        }
      }
    };

    return {
      bookForm,
      book,
      rules,
      isEdit,
      submitForm,
      resetForm
    };
  }
});
</script>

<style scoped>
.demo-bookForm {
  padding: 20px;
}
</style>