<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
      </el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form :model="addFrom" :rules="addFromRules" ref="addFromRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addFrom.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addFrom.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addFrom.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addFrom.goods_number" type="number"></el-input>
            </el-form-item>
            <!-- 选择商品分类的级联选择框 -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader clearable filterable v-model="addFrom.goods_cat" :options="cateList" :props="cateProps"
                @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染扁担item项 -->
            <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border v-for="(cb, i) in item.attr_vals" :key="i" :label="cb"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <!-- input组 -->
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片要上传后台的api地址 -->
            <el-upload :headers="headerObj" :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove"
              list-type="picture" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容 -->
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor ref="myQuillEditor" v-model="addFrom.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" @click="add" style="margin-top: 15px;">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="图片" class="previewImg">
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash';
export default {
  data() {
    return {
      activeIndex: '0',
      //添加商品的表单数据对象
      addFrom: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //商品所属的分类数组
        goods_cat: [],
        //图片的数组
        pics: [],
        //商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      //表单校验规则
      addFromRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' },
        ]
      },
      //商品分类数据
      cateList: [],
      selectedKeys: [],
      //props属性的配置
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //动态参数列表
      manyTableData: [],
      //静态属性参数
      onlyTableData: [],
      //上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      //设置图片上传的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      //预览图片的地址
      previewPath: '',
      //控制图片预览对话框的显示与隐藏
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      this.cateList = res.data
    },
    //当级联选择器选中项发生变化
    handleChange() {
      if (this.addFrom.goods_cat.length !== 3) {
        this.addFrom.goods_cat = []
      }
    },
    //切换tab栏之前的钩子
    beforeTabLeave(activeName, oldActiveName) {
      // console.log(activeName,oldActiveName);
      if (oldActiveName === '0' && this.addFrom.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // 点击tab栏触发事件
    async tabClicked() {
      //证明访问的是动态参数面版
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数列表失败')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        });
        // console.log(res.data);
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) return this.$message.error('获取属性参数列表失败')
        this.onlyTableData = res.data
        // console.log(res.data);
      }
    },
    //处理图片预览效果
    handlePreview(f) {
      this.previewPath = f.response.data.url
      this.previewVisible = true
    },
    //处理移除图片操作
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const i = this.addFrom.pics.findIndex(x => {
        x.pic === filePath
      })
      this.addFrom.pics.splice(i, 1)
      // console.log(this.addFrom);
    },
    //监听图片上传成功的事件
    handleSuccess(res) {
      // console.log(res);
      //拼接得到一个图片信息对象
      const picInfo = { pic: '/' + res.data.tmp_path.replace('\\', '/').replace('.jpg', '') }
      // console.log(picInfo);
      //将图片信息对象push 到 pics数组中
      //接口失效
      // this.addFrom.pics.push(picInfo)
      // console.log(this.addFrom);
    },
    //添加商品
    async add() {
      this.$refs.addFromRef.validate(valid => {
        if (!valid) return this.$message.error('填写必要的表单信息')
      })
      //执行添加业务
      // lodash cloneDeep(obj)
      // console.log(this.addFrom);
      const form = _.cloneDeep(this.addFrom)
      form.goods_cat = form.goods_cat.join(',')
      // console.log(this.manyTableData);
      // console.log(this.onlyTableData);
      // 处理动态参数和静态属性
      this.manyTableData.forEach(item => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_values: item.attr_vals.join(' ')
        }
        this.addFrom.attrs.push(newInfo)
      })
      this.onlyTableData.forEach(item => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_values: item.attr_vals
        }
        this.addFrom.attrs.push(newInfo)
      })
      form.attrs = this.addFrom.attrs
      // console.log(form);
      const { data: res } = await this.$http.post('goods', form)
      // console.log(res);
      if (res.meta.status !== 201) return this.$message.error('添加商品失败')
      this.$message.success('添加商品成功')
      this.$router.push('/goods')
    },
  },
  computed: {
    cateId() {
      if (this.addFrom.goods_cat.length === 3) {
        return this.addFrom.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}
</style>