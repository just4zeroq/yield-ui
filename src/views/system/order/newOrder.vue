<template>
  <div class="order-container">
    <el-form :model="form" label-width="120px">
      <!-- 产品名称 -->
      <el-form-item label="产品名称">
        <el-select v-model="form.product" placeholder="请选择产品名称" @change="productSelectChange">
          <el-option
            v-for="item in productList"
            :key="item.id"
            :label="item.productName"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <!--订单类型-->
      <el-form-item label="订单类型">
        <el-select v-model="form.orderType" placeholder="请选择订单类型">
          <el-option
            key="0"
            label="交易所"
            value="0">
          </el-option>
          <el-option
            key="1"
            label="链上"
            value="1">
          </el-option>
        </el-select>
      </el-form-item>
      <!-- 购买人 -->
      <el-form-item label="投资人钱包">
        <el-select v-model="form.buyer" placeholder="请选择钱包地址">
          <el-option
            v-for="item in buyerList"
            :key="item.id"
            :label="item.walletAddress+'('+item.userName+')'"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <!-- 交易员 -->
      <el-form-item label="交易员地址">
        <el-select v-model="form.trader" placeholder="请选择钱包地址">
          <el-option
            v-for="item in traderList"
            :key="item.id"
            :label="item.walletAddress+'('+item.userName+')'"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <!-- 订单金额 -->
      <el-form-item label="订单金额">
        <el-input v-model="form.orderAmount" placeholder="请输入订单金额" class="order-input">
          <template  slot="append">USDT</template>
        </el-input>
      </el-form-item>
      <!-- 购买时间 -->
      <el-form-item label="收益开始时间">
        <el-date-picker
          v-model="form.orderTime"
          type="date"
          placeholder="选择收益开始时间">
        </el-date-picker>
      </el-form-item>
      <!-- 付款时间 -->
      <el-form-item label="收益截至时间">
        <el-date-picker
          v-model="form.orderEndTime"
          type="date"
          placeholder="选择收益截至时间">
        </el-date-picker>
      </el-form-item>
      <!-- 保证金设置 -->
      <el-form-item label="保证金设置">
        <el-radio v-model="form.marginStep.stepMode" label="rate">按比例</el-radio>
        <el-radio v-model="form.marginStep.stepMode" label="amount">按金额</el-radio>
        <div v-if="form.marginStep.stepMode === 'rate'">
          <el-input v-model="form.marginStep.stepValue" placeholder="输入保证金比例" class="order-input">
            <template  slot="append">%</template>
          </el-input>
        </div>
        <div v-else>
          <el-input v-model="form.marginStep.stepValue" placeholder="输入保证金金额" class="order-input">
            <template  slot="append">USDT</template>
          </el-input>
        </div>
      </el-form-item>
      <!-- 代币购买设置 -->
      <el-form-item label="代币购买设置">
        <div v-for="(step, index) in form.spotPerpStep" :key="index">
          <el-input v-model="step.stepValue" placeholder="输入金额" class="order-input buy-input">
            <template  slot="append">{{ step.stepValueType }}</template>
          </el-input>
          <!-- 仅在第一个输入框后面添加新增按钮 -->
          <el-button v-if="index === 0" type="primary" @click="addSpotPerpStep">新增</el-button>
          <el-button v-else type="primary" @click="removeSpotPerpStep(index)">删除</el-button>
        </div>
      </el-form-item>
      <!-- 代币质押设置 -->
      <el-form-item label="代币质押设置">
        <el-input v-model="form.stakeStep.stepValue" placeholder="输入金额" class="order-input">
          <template  slot="append">{{ form.stakeStep.stepValueType }}</template>
        </el-input>
      </el-form-item>
    </el-form>
    <!-- 添加提交按钮 -->
    <el-button type="primary" @click="submitOrder">提交订单</el-button>
  </div>
</template>

<script>
import {  createOrder } from "@/api/system/order" // 假设存在 createOrder 接口
import { listAllProduct } from "@/api/system/product"
import {  listWalletByRole } from "@/api/system/wallet"

export default {
  name: "OrderEdit",
  data() {
    return {
      form: {
        product: '',
        buyer: '',
        orderType:'',
        trader: '',
        orderAmount: '',
        orderTime: null,
        orderEndTime: null,
        marginAmount:0,
        marginStep: {
          stepMode: 'rate',
          stepValue: ''
        },
        spotPerpStep: [{ stepValue:  0, stepValueType: 'USDT' }],
        stakeStep: {
          stepValue: '',
          stepValueType: 'USDT'
        }
      },
      productList: [],
      buyerList: [],
      traderList: []
    }
  },
  created() {
    this.getProductList()
    // this.getUserList()
  },
  methods: {
    productSelectChange(p) {
      let productConfig = JSON.parse(p.productConfig)
      this.form.stakeStep.stepValueType = productConfig.stake_value_type
      this.getUserList(p);
    },
    getProductList() {
      let query ={
        'productStatus':0,
        //获取当前是时间
        'endTime': new Date().toISOString()
      }
      listAllProduct(query).then(response => {
        console.log(response.data)
        this.productList = response.data
      })
    },
    getUserList(p) {
      let productConfig = JSON.parse(p.productConfig)
      let buyerQuery = {
        'roleId': 1,   // 假设 1 表示买家
        'chainCode':productConfig.stake_chain
      }
      listWalletByRole(buyerQuery).then(response => {
        this.buyerList = response.data
       
      })
      let traderQuery = {
        'roleId': 0,  // 假设 0 表示交易员
        'chainCode':productConfig.trade_chain
      }
      listWalletByRole(traderQuery).then(response => {
        this.traderList = response.data
       
      })

    },
    validateForm() {
      // 这里可以添加表单验证逻辑，返回 true 表示表单有效，返回 false 表示表单无效
      //验证规则如下：1、订单金额大于0 2、收益开始时间小于收益截至时间 3、保证金设置按比例时范围大于0小于100，按金额时大于0小于订单金额 4、代币购买设置所有金额之和小于等于订单金额减去保证金后的值  5、代币质押设置大于0
      let orderAmount = Number(this.form.orderAmount)
      if (orderAmount <= 0) {
        this.$message.error('订单金额必须大于0')
        return false    
      }
      if (this.form.orderTime > this.form.orderEndTime) {
        this.$message.error('收益开始时间必须小于收益截至时间')
        return false
      }
      let marginValue = 0
      let marginStepValue = Number(this.form.marginStep.stepValue)
      if (this.form.marginStep.stepMode === 'rate') {
        if (marginStepValue <= 0 || marginStepValue >= 100) {
          this.$message.error('保证金设置按比例时范围大于0小于100')
          return false
        }
        marginValue = orderAmount* marginStepValue / 100
      }
      if (this.form.marginStep.stepMode === 'amount') {
        if (marginStepValue <= 0 || marginStepValue >= orderAmount) {
          this.$message.error('保证金设置按金额时范围大于0小于订单金额')
          return false
        }
        marginValue = marginStepValue
      }
      this.form.marginAmount = marginValue
      let spotPerpStepValue = 0
      for (let i = 0; i < this.form.spotPerpStep.length; i++) {
        // 将 stepValue 转换为数字类型后相加
        spotPerpStepValue += Number(this.form.spotPerpStep[i].stepValue);
      }
      if (spotPerpStepValue > orderAmount - marginValue) {
        this.$message.error('代币购买设置所有金额之和小于等于订单金额减去保证金后的值')
        return false
      }
      if (this.form.stakeStep.stepValue <=0) {
        this.$message.error('代币质押设置大于0')
        return false
      }
      return true
    },
    submitOrder() {
      let valid = this.validateForm()
      if (!valid) {
        return
      }
      console.log(this.form)
      // 调用新增订单接口
      createOrder(this.form).then(response => {
          if (response.code === 200) {
            this.$message.success('订单创建成功')
            this.close() // 关闭页面
          } else {
            this.$message.error('订单创建失败: ' + response.msg)
          }
        }).catch(error => {
          this.$message.error('订单创建失败: ' + error.message)
        })
  },

    addSpotPerpStep() {
      this.form.spotPerpStep.push({ stepValue: '', stepValueType: 'USDT' });
    },
    removeSpotPerpStep(index){
      this.form.spotPerpStep.splice(index, 1)
    },
  
      /** 关闭按钮 */
    close() {
    const obj = {path: "/system/order", query: {t: Date.now()} }
      this.$tab.closeOpenPage(obj)
  }
}
}
</script>
<style>
.order-container {
  padding: 20px;
}

.order-input {
  width: 20%;
}
.buy-input{
  margin-bottom: 10px;
}
</style>