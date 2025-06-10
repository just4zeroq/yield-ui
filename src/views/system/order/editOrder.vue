<template>
  <div class="order-container">
    <div class="base-invest"> <h3 class="text-lg font-medium text-gray-900 mb-4"><i class="el-icon-present"></i> 基础信息</h3></div>
    <el-card shadow="never" style="border:0" body-style="background-color: #f3f3f3;padding: 10px 0 0;">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="base-grid-content bg-purple">订单编号：{{this.orderInfo.id}}</div>
          <div class="base-grid-content bg-purple">投资产品：{{ this.productInfo.productName }}</div>
        </el-col>
        <el-col :span="6">
          <div class="base-grid-content bg-purple">投资金额：{{ this.orderInfo.orderAmount}}</div>
          <div class="base-grid-content bg-purple">保证金额：{{ this.orderInfo.marginAmount}}</div>
        </el-col>
        <el-col :span="6">
          <div class="base-grid-content bg-purple">收益开始时间：{{ this.orderInfo.orderTime}}</div>
          <div class="base-grid-content bg-purple">收益结束时间：
            <el-date-picker clearable
            v-model="this.orderEndTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="收益结束时间">
          </el-date-picker>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="base-grid-content bg-purple">投资人:{{ this.investorInfo.userName }}({{ this.orderInfo.buyerWalletAddress}})</div>
          <div class="base-grid-content bg-purple">交易员：{{ this.traderInfo.userName }}({{ this.orderInfo.traderWalletAddress}})</div>
        </el-col>
      
      </el-row>
      
    </el-card>
    <div class="config-invest"> <h3 class="text-lg font-medium text-gray-900 mb-4"><i class="el-icon-present"></i> 配置信息</h3></div>
    <el-card shadow="never" style="border:0" body-style="background-color: #f3f3f3;padding: 10px 0 0;">
      <el-tabs v-model="activeName">
      <el-tab-pane label="保证金" name="margin">
        <el-radio  :disabled="marginStep && marginStep.orderStepStatus==2" v-model="marginStep.stepMode" label="rate">按比例</el-radio>
        <el-radio  :disabled="marginStep && marginStep.orderStepStatus==2" v-model="marginStep.stepMode" label="amount">按金额</el-radio>
        <div class="margin-value-container" v-if="marginStep">
          <div class="margin-value">
            <el-input 
              v-model="marginStep.stepValue"
              :disabled="marginStep && marginStep.orderStepStatus==2"
              placeholder="输入保证金比例"
              v-if="marginStep.stepMode === 'rate'"
            >
            <template  slot="append">%</template>
          </el-input>
          <el-input v-model="marginStep.stepValue" :disabled="marginStep && marginStep.orderStepStatus==2" placeholder="输入保证金金额" v-else="marginStep.stepMode === 'amount'">
            <template  slot="append">USDT</template>
          </el-input>
          </div>  
          <div>
            <span>
              状态:
              {{ marginStep.orderStepStatus === 0? '未开始' :
                marginStep.orderStepStatus === 1? '进行中' :
                marginStep.orderStepStatus === 2? '已完成' :
                marginStep.orderStepStatus === 3? '异常' : '未知状态' }}
            </span>
            <el-button @click="saveMarginStep(marginStep)" :disabled="marginStep && marginStep.orderStepStatus==2">保存</el-button>
          </div>
      </div>
        </el-tab-pane>
      <el-tab-pane label="代币购买" name="spot_perp">
        <div v-for="(step, index) in spotPerpStep" :key="index" class="spot-perp-item">
          <el-input class="spot-perp-input"
            v-model="step.stepValue"
            :disabled="step.orderStepStatus === 2"
            placeholder="输入金额"
          >
          <template  slot="append">{{ step.stepValueType }}</template>
        </el-input>
          <span>
            状态: 
            {{ step.orderStepStatus === 0 ? '未开始' : 
               step.orderStepStatus === 1 ? '进行中' : 
               step.orderStepStatus === 2 ? '已完成' : 
               step.orderStepStatus === 3 ? '异常' : '未知状态' }}
          </span>
          <el-button @click="saveSpotPerpStep(step)" :disabled="step.orderStepStatus === 2">保存</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="代币质押" name="stake">
        <el-input class="stake-input"
            v-model="stakeStep.stepValue"
            :disabled="stakeStep.orderStepStatus === 2"
            placeholder="输入金额"
          >
          <template  slot="append">{{ stakeStep.stepValueType }}</template>
        </el-input>
          <span>
            状态: 
            {{ stakeStep.orderStepStatus === 0 ? '未开始' : 
               stakeStep.orderStepStatus === 1 ? '进行中' : 
               stakeStep.orderStepStatus === 2 ? '已完成' : 
               stakeStep.orderStepStatus === 3 ? '异常' : '未知状态' }}
          </span>
          <el-button @click="saveStakeStep(stakeStep)" :disabled="stakeStep.orderStepStatus === 2">保存</el-button>
      </el-tab-pane>
      </el-tabs>
    
    </el-card>  

  </div>
</template >

    <script>
    import {getOrder, updateOrder} from "@/api/system/order"
     import {updateStepConfig} from "@/api/system/step"
    import { getProduct } from "@/api/system/product"
    import { getBaseUser } from "@/api/system/user"
    export default {
        name: "OrderEdit",

    data() {
      return {
              orderInfo:{},
              investorInfo:{},
              traderInfo:{},
              productInfo:{},
              orderEndTime:null,
              activeName:"margin",
              marginStep:null,
              spotPerpStep:[],
              stakeStep:null, 
              marginModeConfig: 'rate', // 默认选择按比例
              marginModeValue :0
      }   
  },
  created() {
      const orderId = this.$route.params && this.$route.params.orderId
      if (orderId) {
          // 获取表详细信息
        getOrder(orderId).then(response => {
          this.orderInfo = response.data
          this.orderEndTime = this.orderInfo.orderEndtime
          const steps = response.steps
          // console.log(steps)
          for(var i=0;i<steps.length;i++){
          
            if(steps[i].orderStepCode== "margin"){
              this.marginStep = steps[i] 
              // this.marginModeConfig = this.marginStep.stepMode
              // this.marginModeValue = this.marginStep.stepValue
            }
            if(steps[i].orderStepCode== "spot_perp"){
              this.spotPerpStep.push(steps[i])
            }
            if(steps[i].orderStepCode== "stake"){
              this.stakeStep = steps[i]
            }
          }
          getProduct(this.orderInfo.productId).then(response => {
              this.productInfo = response.data
          })
          getBaseUser(this.orderInfo.buyerId).then(response => {
              this.investorInfo = response.data
              console.log(this.investorInfo)
          })
          getBaseUser(this.orderInfo.traderId).then(response => {
              this.traderInfo = response.data
              console.log(this.traderInfo)
          })
      })
      
      /** 查询字典下拉列表 */
      // getDictOptionselect().then(response => {
      //       this.dictOptions = response.data
      //   })
      // /** 查询菜单下拉列表 */
      // getMenuTreeselect().then(response => {
      //       this.menus = this.handleTree(response.data, "menuId")
      //   })
    }
  },
    methods: {
      saveMarginStep(step) {
        // 在这里实现保存逻辑，例如发送请求到后端保存数据
        console.log('保存margin步骤:', step);

        updateStepConfig(step).then(response => {
          console.log(response)
        })
      },
      saveSpotPerpStep(step) {  
        // 在这里实现保存逻辑，例如发送请求到后端保存数据 
        console.log('保存spot_perp步骤:', step);
      },
      saveStakeStep(step) {
        // 在这里实现保存逻辑，例如发送请求到后端保存数据
        console.log('保存stake步骤:', step);
      },

        /** 关闭按钮 */
      close() {
      const obj = {path: "/system/order", query: {t: Date.now()} }
        this.$tab.closeOpenPage(obj)
    }
  },
    mounted() {

  }
}

</script>
<style scoped>
.base-grid-content{
  padding: 10px;
  border-radius: 5px;
}
.margin-value{
  margin-top: 10px;
  margin-left: 10px;
  width: 10%;
}
.spot-perp-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 60%;
}
.spot-perp-input {
  width: 20%;
}
.stake-input{
  width: 10%;
}
.margin-value-container{
  display: flex;
  direction: ltr;
  align-items: center;
  gap: 10px;
}
</style>