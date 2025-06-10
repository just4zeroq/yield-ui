<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="投资人编号" prop="buyerId">
        <el-input
          v-model="queryParams.buyerId"
          placeholder="请输入投资人编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="投资人钱包" prop="buyerWalletAddress">
        <el-input
          v-model="queryParams.buyerWalletAddress"
          placeholder="请输入投资人钱包"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="交易员编号" prop="traderId">
        <el-input
          v-model="queryParams.traderId"
          placeholder="请输入交易员编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <!-- <el-form-item label="交易员钱包" prop="traderWalletAddress">
        <el-input
          v-model="queryParams.traderWalletAddress"
          placeholder="请输入投资人钱包"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="投资时间" prop="orderTime">
        <el-date-picker clearable
          v-model="queryParams.orderTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择投资时间">
        </el-date-picker>
      </el-form-item>
     <!-- <el-form-item label="投资金额" prop="orderAmount">
        <el-input
          v-model="queryParams.orderAmount"
          placeholder="请输入投资金额"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="保证金金额" prop="marginAmount">
        <el-input
          v-model="queryParams.marginAmount"
          placeholder="请输入保证金金额"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="付款代币" prop="tokenSymbol">
        <el-input
          v-model="queryParams.tokenSymbol"
          placeholder="请输入付款代币"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="付款代币精度" prop="tokenDecimal">
        <el-input
          v-model="queryParams.tokenDecimal"
          placeholder="请输入付款代币精度"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="投资人钱包链编码" prop="buyerAddressChain">
        <el-input
          v-model="queryParams.buyerAddressChain"
          placeholder="请输入投资人钱包链编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="交易员钱包链编码" prop="traderAddressChain">
        <el-input
          v-model="queryParams.traderAddressChain"
          placeholder="请输入交易员钱包链编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:order:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:order:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:order:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:order:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单编号" align="center" prop="orderId" />
      <el-table-column label="投资人编号" align="center" prop="buyerId" />
      <el-table-column label="投资人钱包地址" align="center" prop="buyerWalletAddress" />
      <el-table-column label="交易员编码" align="center" prop="traderId" />
      <el-table-column label="交易员钱包地址" align="center" prop="traderWalletAddress" />
      <el-table-column label="订单时间" align="center" prop="orderTime" width="180">
        <template  #default="scope">
          <span>{{ parseTime(scope.row.orderTime, '{y}-{m}-{d}') }}</span>
        </template> 
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="orderStatus" />
      <el-table-column label="订单金额" align="center" prop="orderAmount" />
      <el-table-column label="保证金金额" align="center" prop="marginAmount" />
      <el-table-column label="付款代币" align="center" prop="tokenSymbol" />
      <el-table-column label="付款代币精度" align="center" prop="tokenDecimal" />
      <el-table-column label="投资人钱包链编码" align="center" prop="buyerAddressChain" />
      <el-table-column label="交易员钱包链编码" align="center" prop="traderAddressChain" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template  #default="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:order:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:order:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改订单管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="投资人编号" prop="buyerId">
          <el-input v-model="form.buyerId" placeholder="请输入投资人编号" />
        </el-form-item>
        <el-form-item label="投资人钱包" prop="buyerWalletAddress">
          <el-input v-model="form.buyerWalletAddress" placeholder="请输入投资人钱包" />
        </el-form-item>
        <el-form-item label="交易员编号" prop="traderId">
          <el-input v-model="form.traderId" placeholder="请输入交易员编号" />
        </el-form-item>
        <el-form-item label="交易员钱包地址" prop="traderWalletAddress">
          <el-input v-model="form.traderWalletAddress" placeholder="请输入交易员钱包地址" />
        </el-form-item>
        <el-form-item label="订单时间" prop="orderTime">
          <el-date-picker clearable
            v-model="form.orderTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择订单时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="订单状态" prop="orderStatus">
          <el-input v-model="form.orderStatus" placeholder="请输入订单状态" />
        </el-form-item>
        <el-form-item label="订单金额" prop="orderAmount">
          <el-input v-model="form.orderAmount" placeholder="请输入订单金额" />
        </el-form-item>
        <el-form-item label="保证金金额" prop="marginAmount">
          <el-input v-model="form.marginAmount" placeholder="请输入保证金金额" />
        </el-form-item>
        <el-form-item label="付款代币" prop="tokenSymbol">
          <el-input v-model="form.tokenSymbol" placeholder="请输入付款代币" />
        </el-form-item>
        <el-form-item label="付款代币精度" prop="tokenDecimal">
          <el-input v-model="form.tokenDecimal" placeholder="请输入付款代币精度" />
        </el-form-item>
        <el-form-item label="投资人钱包链编码" prop="buyerAddressChain">
          <el-input v-model="form.buyerAddressChain" placeholder="请输入投资人钱包链编码" />
        </el-form-item>
        <el-form-item label="交易员钱包链编码" prop="traderAddressChain">
          <el-input v-model="form.traderAddressChain" placeholder="请输入交易员钱包链编码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listOrder, getOrder, delOrder, addOrder, updateOrder } from "@/api/system/order"

export default {
  name: "Order",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 订单管理表格数据
      orderList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        buyerId: null,
        buyerWalletAddress: null,
        traderId: null,
        traderWalletAddress: null,
        orderTime: null,
        orderStatus: null,
        orderAmount: null,
        marginAmount: null,
        tokenSymbol: null,
        tokenDecimal: null,
        buyerAddressChain: null,
        traderAddressChain: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询订单管理列表 */
    getList() {
      this.loading = true
      listOrder(this.queryParams).then(response => {
        this.orderList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        buyerId: null,
        buyerWalletAddress: null,
        traderId: null,
        traderWalletAddress: null,
        orderTime: null,
        orderStatus: null,
        orderAmount: null,
        marginAmount: null,
        tokenSymbol: null,
        tokenDecimal: null,
        createTime: null,
        updateTime: null,
        createBy: null,
        updateBy: null,
        buyerAddressChain: null,
        traderAddressChain: null
      }
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$tab.openPage("新增订单", '/system/order-new/index/', null)
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const orderId = row.orderId
 
      this.$tab.openPage("修改订单信息", '/system/order-edit/index/' + orderId, null)
    
 
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateOrder(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addOrder(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除订单管理编号为"' + ids + '"的数据项？').then(function() {
        return delOrder(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/order/export', {
        ...this.queryParams
      }, `order_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
