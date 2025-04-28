<template>
  <div>
    <h2>{{ bookData ? '编辑书籍' : '新增书籍' }}</h2>
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
import { defineComponent, reactive, ref, unref } from 'vue';
import { IGoods } from "@/type/goods";
import { ElForm } from 'element-plus';
import { useRoute } from 'vue-router'

export default defineComponent({
  props: {
    bookData: {
      type: Object as () => IGoods | null,
      default: null
    }
  },
  setup(props) {
    const bookForm = ref<InstanceType<typeof ElForm>>();

    // 修复：确保所有必填字段都有初始值
    const book = reactive<IGoods>({
      id: unref(props.bookData)?.id || 0, // 修改为数字类型的默认值
      title: unref(props.bookData)?.title || '', // 添加必填字段
      introduce: unref(props.bookData)?.introduce || '',
      bookName: unref(props.bookData)?.bookName || '',
      author: unref(props.bookData)?.author || '',
      creater: unref(props.bookData)?.creater || '',
      userId: unref(props.bookData)?.userId
    });

    const rules = reactive({
      bookName: [
        { required: true, message: '请输入书名', trigger: 'blur' }
      ],
      introduce: [
        { required: true, message: '请输入书籍详情', trigger: 'blur' }
      ],
      title: [ // 添加必填字段的验证
        { required: true, message: '请输入标题', trigger: 'blur' }
      ]
    });

    const submitForm = () => {
      bookForm.value?.validate((valid) => {
        if (valid) {
          const submitData: IGoods = {
            ...book,
            id: book.id || 0
          };
          console.log('提交数据:', submitData);
        }
      });
    };

    const resetForm = () => {
      bookForm.value?.resetFields();
      if (!props.bookData) {
        Object.assign(book, {
          id: 0,
          title: '',
          bookName: '',
          introduce: '',
          author: '',
          creater: '',
          userId: undefined
        });
      }
    };

    return {
      bookForm,
      book,
      rules,
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