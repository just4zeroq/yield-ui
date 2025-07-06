<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户id" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="钱包地址" prop="walletAddress">
        <el-input
          v-model="queryParams.walletAddress"
          placeholder="请输入钱包地址"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="钱包来源" prop="walletChain">
        <el-input
          v-model="queryParams.walletChain"
          placeholder="请输入钱包来源"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="钱包类型" prop="walletType">
        <el-input
          v-model="queryParams.walletType"
          placeholder="请输入钱包类型"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:wallet:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:wallet:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:wallet:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:wallet:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="walletList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="钱包编号" align="center" prop="id" />
      <el-table-column label="用户id" align="center" prop="userId" />
      <el-table-column label="钱包地址" align="center" prop="walletAddress" />
      <el-table-column label="钱包来源" align="center" prop="walletChain" />
      <el-table-column label="钱包状态" align="center" prop="walletStatus" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:wallet:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:wallet:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改钱包管理对话框 -->
    <el-dialog :title="title" v-model="open" width="60%" append-to-body @open="handleOpen">
      <el-form ref="walletRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户id" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择用户">
            <el-option
              v-for="investor in investors"
              :key="investor.userId"
              :label="investor.userName"
              :value="investor.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="钱包名称" prop="walletName">
            <el-input v-model="form.walletName" placeholder="请输入钱包名称" />
          </el-form-item>

        <el-form-item label="钱包类型" prop="walletType">
          <el-select v-model="form.walletType" placeholder="请选择钱包类型">
            <el-option label="链上" value="chain" />
            <el-option label="交易所" value="cex" />
          </el-select>
        </el-form-item>
        <el-form-item label="钱包来源" prop="walletChain">
          <el-select v-model="form.walletChain" placeholder="请选择钱包来源">
            <el-option
              v-for="item in walletSourceOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <template v-if="form.walletType === 'chain'">
          <el-form-item label="钱包地址" prop="walletAddress">
            <el-input v-model="form.walletAddress" placeholder="请输入钱包地址" />
          </el-form-item>
        </template>
        <template v-else-if="form.walletType === 'cex'">
          <el-form-item label="API Key" prop="apiKey">
            <el-input v-model="form.apiKey" placeholder="请输入 API Key" />
          </el-form-item>
          <el-form-item label="API Secret" prop="apiSecret">
            <el-input v-model="form.apiSecret" placeholder="请输入 API Secret" />
          </el-form-item>
        </template>
        <!-- 根据钱包类型显示交易密码输入框 -->
        <el-form-item v-if="form.walletType === 'cex'" label="交易密码" prop="tradePassword">
          <el-input v-model="form.tradePassword" type="password" placeholder="请输入交易密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Wallet">
import { listWallet, getWallet, delWallet, addWallet, updateWallet } from "@/api/system/wallet"
import { getAllInvestor } from "@/api/system/user"
import {hashString,encrypt,aesEncrypt,aesDecrypt} from "@/utils/jsencrypt"
import {addAccount, getAllAccountsByUserId} from '@/utils/db'
import { ref, computed } from 'vue';
const { proxy } = getCurrentInstance()

const walletList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const investors = ref([]);

const data = reactive({
  form: {walletType:'chain'},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    walletAddress: null,
    walletChain: null,
    walletStatus: null,
    walletType: null
  },
  rules: {
    walletType: [
      { required: true, message: "钱包类型不能为空", trigger: "blur" }
    ]
  }
})

const walletSourceOptions = computed(() => { 
  if (form.value.walletType === 'chain') {
    return [
      { value: 'ARB', label: 'ARB' },
      { value: 'ETH', label: 'ETH' }
    ];
  } else if (form.value.walletType === 'cex') {
    return [
      { value: 'binance', label: 'binance' },
      { value: 'bitget', label: 'bitget' },
      { value: 'bybit', label: 'bybit' }
    ];
  }
  return [];
});

const { queryParams, form, rules } = toRefs(data)

/** 查询钱包管理列表 */
function getList() {
  loading.value = true
  listWallet(queryParams.value).then(response => {
    walletList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    userId: null,
    walletAddress: null,
    walletChain: null,
    walletStatus: null,
    createTime: null,
    updateTime: null,
    walletType: null,
    tradePassword: null,
    walletName:null
  }
  proxy.resetForm("walletRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加钱包管理"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getWallet(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改钱包管理"
  })
}
/**打开新建钱包太狂 */
 function handleOpen(){
  form.value = {

    walletType: 'chain'
  }
  getAllInvestor().then(response => 
    {
      investors.value = response.data;
    }
  );
 
}
/** 提交按钮 */
function submitForm() {
  
  proxy.$refs["walletRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateWallet(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        let form_data = form.value; // 获取表单数据
        let walletType = form_data.walletType;
        let encrypt_key=""
        if (walletType === 'cex') {
          form_data.walletAddress = hashString(form_data.apiKey);
          let apiSecret = form.value.apiSecret;
          let tradePassword = form_data.tradePassword;
          form_data.apiKey = "";
          form_data.apiSecret = "";
          form_data.tradePassword = "";
          encrypt_key = aesEncrypt(apiSecret,tradePassword)
        }
        addWallet(form_data).then(response => {
        if (walletType === 'cex') {
          addAccount({userId:form_data.userId,walletName:form_data.walletName,apiKey: form_data.walletAddress,apiSecret:encrypt_key}).then(response => {
            proxy.$modal.msgSuccess("新增成功")
          })
        }
         
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除钱包管理编号为"' + _ids + '"的数据项？').then(function() {
    return delWallet(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/wallet/export', {
    ...queryParams.value
  }, `wallet_${new Date().getTime()}.xlsx`)
}

getList()
</script>
