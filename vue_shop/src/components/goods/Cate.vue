<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片数据区域 -->
    <el-card>
      <!-- 添加商品分类按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false"
        :show-row-hover="false" show-index index-text="#" border>
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i v-if="scope.row.cat_deleted === false" class="el-icon-success" style="color: lightgreen;"></i>
          <i v-else class="el-icon-error" style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" size="mini" type="success">二级</el-tag>
          <el-tag v-else size="mini" type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditdialogVisible(scope.row.cat_id)">编辑
          </el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeCateById(scope.row.cat_id)">删除
          </el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加商品分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%"
      @close="addCateDialogClose('addCateFromRef')">
      <!-- 内容主题区域 -->
      <el-form :model="addCateFrom" :rules="cateFromRules" ref="addCateFromRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateFrom.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader filterable clearable v-model="selectedKeys" :options="parentCateList" :props="cascaderProps"
            @change="parentCateChanged">
          </el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类名称对话框 -->
    <el-dialog title="分类名称" :visible.sync="editdialogVisible" width="50%">
      <el-form :model="editCateFrom" :rules="cateFromRules" ref="editCateFromRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateFrom.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //控制添加分类对话框的显示和隐藏
      addCateDialogVisible: false,
      //控制修改商品分类名称对话框的显示和隐藏
      editdialogVisible: false,
      //获取商品列表的参数对象
      queryInfo: {
        type: 3,
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5,
      },
      // 商品分类的数据列表
      catelist: [],
      // 总数据数
      total: 0,
      //为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示当前列定义为模板列
          type: 'template',
          //表示当前一列使用模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示当前列定义为模板列
          type: 'template',
          //表示当前一列使用模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示当前列定义为模板列
          type: 'template',
          //表示当前一列使用模板名称
          template: 'opt'
        }
      ],
      //添加分类的表单数据对象
      addCateFrom: {
        //父分类id
        cat_pid: 0,
        //分类名称
        cat_name: '',
        //分类层级，默认添加一级分类
        cat_level: 0
      },
      //添加分类表单的校验规则
      cateFromRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ]
      },
      //父级分类列表
      parentCateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //选中的父级分类数组
      selectedKeys: [],
      //待修改的分类名称
      editCateFrom: {},

    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //监听添加分类对话框的关闭事件
    addCateDialogClose(fromName) {
      this.$refs[fromName].resetFields()
      this.selectedKeys = []
      this.addCateFrom.cat_level = 0
      this.addCateFrom.cat_pid = 0
    },
    //获取商品列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.total = res.data.total
      this.catelist = res.data.result
    },
    //监听pagesize改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //监听pagenum改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()

    },
    //展示添加商品分类对话框
    showAddCateDialog() {
      //获取父级分类列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      //获取前两级的商品分类 type = 2
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类列表失败')
      this.parentCateList = res.data
    },
    //选择项发生变化触发  
    parentCateChanged() {
      // console.log(this.selectedKeys);
      //如果 selectedKeys 的length大于0，则证明选中了父级分类
      //如果 selectedKeys 的length等于0，则当前的名称为父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateFrom.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateFrom.cat_level = this.selectedKeys.length
      }
      else {
        this.addCateFrom.cat_pid = 0
        this.addCateFrom.cat_level = 0
      }
      // console.log(this.addCateFrom);
    },
    //添加分类
    addCate() {
      this.$refs.addCateFromRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateFrom)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    //编辑分类吗名称
    async showEditdialogVisible(id) {
      // console.log(id);
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询分类失败')
      this.editCateFrom = res.data
      this.editdialogVisible = true
    },
    //提交修改的商品分类名称
    editCateInfo() {
      this.$refs.editCateFromRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editCateFrom.cat_id,
          { cat_name: this.editCateFrom.cat_name }
        )
        if (res.meta.status !== 200) return this.$message.error('修改分类失败')
        this.$message.success('修改分类名称成功')
        this.editdialogVisible = false
        this.getCateList()
      })
    },
    //删除商品分类
    async removeCateById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult === 'cancel') return this.$message.info('已经取消了删除')
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除商品分类失败')
      this.getCateList()
    },
  }
}
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
</style>