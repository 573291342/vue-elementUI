<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片数据区域 -->
    <el-card>
      <!-- 头部的警告区域 -->
      <el-alert title="注意:只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row style="margin: 15px 0;">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader clearable filterable v-model="selectedKeys" :options="cateList" :props="cascaderProps"
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <el-row>
        <!-- tabs页签区域 -->
        <el-tabs v-model="activeName" type="border-card" @tab-click="handleTabClick">
          <el-tab-pane label="动态参数" name="many">
            <el-button :disabled="!isBtnDisable" size="mini" type="primary" @click="addDialogVisible = true">添加参数
            </el-button>
            <!-- 动态参数表格 -->
            <el-table v-if="manyTableData.length !== 0" :data="manyTableData" border stripe>
              <!-- 展开列 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染tag标签 -->
                  <el-tag closable v-for="(item, index) in scope.row.attr_vals" :key="index"
                    @close="handleClose(index, scope.row)">{{ item }}</el-tag>
                  <!-- 输入文本框 -->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                    ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <!-- 添加按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                  </el-button>
                </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">
                    编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
            <el-button :disabled="!isBtnDisable" size="mini" type="primary" @click="addDialogVisible = true">添加属性
            </el-button>
            <!-- 静态属性表格 -->
            <el-table v-if="onlyTableData.length !== 0" :data="onlyTableData" border stripe>
              <!-- 展开列 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染tag标签 -->
                  <el-tag closable v-for="(item, index) in scope.row.attr_vals" :key="index"
                    @close="handleClose(index, scope.row)">{{ item }}</el-tag>
                  <!-- 输入文本框 -->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                    ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <!-- 添加按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                  </el-button>
                </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">
                    编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-row>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%"
      @close="dialogClosed('addFormRef')">
      <!-- 添加参数表单 -->
      <el-form ref="addFormRef" :model="addForm" :rules="formRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%"
      @close="dialogClosed('editFormRef')">
      <!-- 添加参数表单 -->
      <el-form ref="editFormRef" :model="editForm" :rules="formRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
export default {
  data() {
    return {
      //商品分类列表
      cateList: [],
      //选中的父级分类数组
      selectedKeys: [],
      //props属性的配置
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //tag页签的默认选中值
      activeName: 'many',
      //动态参数列表
      manyTableData: [],
      //静态属性列表
      onlyTableData: [],
      //控制添加参数对话框的显示与隐藏
      addDialogVisible: false,
      //控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 添加参数的表单数据
      addForm: {
        attr_name: ''
      },
      formRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ]
      },
      //修改的表单的数据对象
      editForm: {},
    }
  },
  created() {
    //获取所有的商品列表
    this.getCateList()
  },
  methods: {
    //获取所有的商品列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.cateList = res.data
    },
    //级联选择框改变时候触发事件
    handleChange() {
      this.getParamsData()
    },
    //tabs页签点击事件
    handleTabClick() {
      this.getParamsData()
      // console.log(this.activeName);
    },
    //获取参数列表数据
    async getParamsData() {
      //证明选中的不是三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // console.log(this.selectedKeys);
      //根据选择的分类的id，和当前所在的面板，获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中的值
        item.inputValue = ''
      });
      // console.log(res.data);
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    //清空对话框的内容
    dialogClosed(formName) {
      this.$refs[formName].resetFields()
    },
    //添加参数名称
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    //修改参数名称
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error('修改参数失败')
        this.$message.success('修改参数成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    //展示修改对话框
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
        params: {
          attr_sel: this.activeName,
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数名称失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //删除参数
    async removeParams(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      //如果用户确认删除则返回字符串 confirm
      //如果用户取消删除则返回字符串 cancel
      if (confirmResult === 'cancel')
        return this.$message.info('已经取消了删除')
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败')
      this.$message.success('参数删除成功')
      this.getParamsData()
    },
    //文本框失去焦点或按下enter都会触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //如果没有 return ，证明输入的内容需要做处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    //将对attr_vals修改的值保存到数据库
    async saveAttrVals(row) {
      //发送请求保存这次修改
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('修改参数项失败')
      this.$message.success('修改参数项成功')

    },
    //删除对应的参数项
    handleClose(index, row) {
      // row.attr_vals = row.attr_vals.filter(item => {
      //   return item !== ''
      // })
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    },
    //点击按钮展示文本输入框
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
  },
  computed: {
    //控制按钮是否可以使用
    isBtnDisable() {
      return this.selectedKeys.length === 3
    },
    // 返回选择的三级id
    cateId() {
      if (this.selectedKeys.length === 3) return this.selectedKeys[2]
      else return null
    },
    // 对话框文本
    titleText() {
      if (this.activeName === 'many')
        return '动态参数'
      else return '静态属性';
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 0 10px;
}

.input-new-tag {
  width: 120px;
  margin: 10px 10px;
}

.button-new-tag {
  margin: 10px 10px;
}
</style>