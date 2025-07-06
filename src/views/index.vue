<template>
  <div class="app-container">
    <div class="total-invest"> <h3 class="text-lg font-medium text-gray-900 mb-4"><i class="el-icon-present"></i> 投资概况</h3></div>
    <!-- 第一部分：投资总览 -->
    <el-row :gutter="20" class="mb-8">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="card-content">
            <div class="flex items-end invest-amount">
              <span class="text-3xl font-bold text-gray-900">投资总金额: ${{ totalAmount }}</span>
            </div>
            <div class="flex items-end">
              <span class="text-3xl font-bold text-gray-900">未确认金额: ${{ unconfirmedAmount }}</span>
            </div> 
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="card-content">
            <div class="flex items-end invest-amount">
              <span class="text-3xl font-bold text-green-600">总收益: ${{ totalProfit }}</span>
            </div>
            <div class="flex items-end">
              <span class="text-3xl font-bold text-green-600">  APY: {{ apy }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>
     
    </el-row>
    <el-row :gutter="2" class="mb-8 trend-chart">
      <el-col :span="24">
        <el-card shadow="hover">
          <div class="card-content">
            <h3 class="text-sm font-medium text-gray-500 mb-2">近7日收益趋势</h3>
            <div ref="trendChart" style="width: 110%; height: 300px; margin-left: -10%;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 投资分布 -->
    <h3 class="text-lg font-medium text-gray-900 mb-4"><i class="el-icon-notebook-1"></i> 投资分布</h3>
    <el-card class="mb-8" shadow="hover">
     
      <div class="h-64">
        <div ref="distributionChart" class="w-full h-full"></div>
      </div>
    </el-card>

    <!-- 第二部分：投资组合详情 -->
    <el-card class="mb-8" shadow="hover">
      
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="进行中" name="ongoing">
          

          <div v-for="(investment, index) in ongoingInvestments" :key="index" class="mb-4">
            <el-card shadow="hover">
              
              <div class="flex justify-between items-center">
                <div>
                <!-- 第一行：产品 logo、名称和描述 -->
                <el-row class="invest-product">
                  <el-col :span="1">
                    <!-- 假设这里有产品 logo，使用 el-avatar 示例 -->
                    <el-avatar :src="investment.product.productLogo" fit="scale-down" shape="square" size="large" class="bg-blue-100 text-blue-600"></el-avatar>
                  </el-col>
                  <el-col :span="20">
                    <div class="text-lg font-bold text-gray-900">{{ investment.product.productName }}</div>
                    <div class="text-sm text-gray-500">{{ investment.product.productDesc }}</div>
                  </el-col>
                </el-row>
                <!-- 第二行：投资进度、金额、保证金信息 -->
                <el-row >
                <el-card  header="资金分配" style="width: 20%" shadow="always" class="invest-detail">
                    <div class="text-sm text-gray-500">投资金额: ${{ formatNumber(investment.orderAmount) }}</div>
                    <div class="text-sm text-gray-500">保证金金额: ${{ formatNumber(investment.marginAmount) }}</div>
                  <div class="text-sm text-gray-500">质押金额: ${{ formatNumber(investment.orderAmount-investment.marginAmount) }}  {{ investment.product.productConfig.stake_value_type }}</div>
              </el-card>
              <el-card header="保证金钱包" style="width: 30%" shadow="always"  class="invest-address" >
                <div class="text-sm text-gray-500">链:{{ investment.traderAddressChain }}</div>
                <div class="text-sm text-gray-500">地址:{{ investment.traderWalletAddress }}</div>
                <div class="text-sm text-gray-500">存入Token:USDT(C)</div>
               </el-card>
              <el-card :header="`质押钱包`" style="width: 30%" shadow="always"  class="invest-address" >
                <div class="text-sm text-gray-500">链: {{ investment.buyerAddressChain }}</div>
                <div class="text-sm text-gray-500">地址: {{ investment.buyerWalletAddress}}</div>
                <div class="text-sm text-gray-500">存入Token:{{investment.product.productConfig.stake_value_type}}</div>
              </el-card>
            </el-row>
              

              <!-- 第三行：质押金额、收益开始时间、收益截至时间 -->
              <el-row class="invest-time">
                <el-col :span="18">
                  <el-steps :active="investment.orderStatus" finish-status="success">
                  <el-step title="开始" :description="investment.createTime"></el-step>
                  <el-step title="转入保证金" :description="`向保证金存款地址中存入${investment.marginAmount}U`"></el-step>
                  <el-step title="购买代币" :description="`购买${investment.orderAmount -investment.marginAmount}U的${investment.product.productConfig.stake_value_type}`"></el-step>
                  <el-step title="转入代币" :description="`向质押钱包地址中转入${investment.product.productConfig.stake_value_type}`"></el-step>
                  <el-step title="质押" :description="`把ENA存款地址中ENA质押到收益池`"></el-step>
                  <el-step title="收益" :description="`进入收益期:${investment.orderTime}`"></el-step>
                  <el-step title="赎回" :description="`赎回并结算收益:${investment.orderEndtime}`"></el-step>
                  </el-steps>
                </el-col>
                <el-col :span="6" v-if="investment.orderStatus==4">
                  <el-button type="primary" @click="isMetamaskConnected ? stakeToken(investment) : connectMetamask()">
                    {{ isMetamaskConnected ? `质押${investment.product.productConfig.stake_value_type}` : '连接钱包' }}
                  </el-button>
                  <el-button type="primary"  v-if="isMetamaskConnected"  @click="disconnectMetamask">
                    断开连接
                  </el-button>
                </el-col>
                <el-col :span="6" v-else-if="investment.orderStatus==2" v-hasRole="['trader']" @click="handleBuyClick(investment)">
                  <el-button type="primary">
                    购买
                  </el-button>
                  <el-button type="primary"  >
                    详情
                  </el-button>
                </el-col>
              </el-row>
            </div>
                  
              </div>
             
            </el-card>
          </div>

        </el-tab-pane>
        
        <el-tab-pane label="已完成" name="completed">
         
        </el-tab-pane>
      </el-tabs>
    </el-card>

    
  </div>

  <!-- 购买弹框 -->
  <el-dialog v-model="showBuyDialog" title="购买" width="30%" @close="resetDialogState">
    <el-form label-width="100px">
      <el-form-item label="选择账户">
        <el-select 
          v-model="selectedAccount" 
          placeholder="请选择账户"
          @change="handleAccountChange"
          clearable
        >
          <el-option
            v-for="account in accounts"
            :key="account.apiKey"
            :label="account.walletName"
            :value="account.apiKey"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="!hasTradePassword" label="交易密码">
        <el-input v-model="tradePassword" type="password" />
        <el-button @click="saveTradePassword">确认</el-button>
      </el-form-item>
      <el-form-item label="账户余额">
        <el-input v-model="accountBalance" disabled />
      </el-form-item>
      <el-form-item label="购买金额">
        <el-input v-model="buyAmount" type="number" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="cancelBuy">取消</el-button>
      <el-button type="primary" @click="confirmBuy">确认</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { listAllInvestments,stakeToken } from "@/api/system/order"
import { getLatestProfit } from "@/api/system/profit"
import {listAllRecord} from "@/api/system/record"
import * as echarts from 'echarts';
import { ethers } from 'ethers';
import {get_signed_param,getWalletBalanceParam,getBuySymbolParam} from '@/utils/binance_sig.js'
import {addAccount, getAccount} from '@/utils/db.js'
import {hashString,aesDecrypt} from '@/utils/jsencrypt.js'
import {getAllAccountsByUserId} from '@/utils/db.js'
import Cookies from 'js-cookie'
import { getWalletBalance,buySymbol } from '@/api/system/wallet'


export default {
  data() {
    return {
      activeTab: 'ongoing',
      searchQuery: '',
      currentPage: 1,
      pageSize: 10,
      sortColumn: 'currentValue',
      sortDirection: 'desc',
      ongoingTotalAmount:10,
      ongoingTotalProfit:10,
      completedTotalAmount:10,
      completedTotalProfit:10,
      totalAmount:0,
      unconfirmedAmount:0, 
      totalProfit:0,
      trendChart:{},
      apy:0,
      tableColumns:[],
      investment:null,
      investments: [
        // 保持原有的投资数据不变
      ],
      isMetamaskConnected:false,
      currentWalletAddress:null,
      provider: null,
      showBuyDialog: false,
      selectedAccount: '',
      accountBalance: 0,
      buyAmount: 0,
      accounts: [],
      hasTradePassword: true,
      tradePassword: '',
    };
  },
  created() {
    this.listAllInvestment()
    this.getLatestProfits()
    this.checkMetamaskConnection()
    const payload={}
    payload["symbol"]="ENAUSDT"
    payload["orderId"]=1961830413

    const apiSecret="4v5R1CHIB5SuR7jAQ4qY8GcpXfA3ElkgMxkEjWPEQlnL8zziPcmkyNn1IzKURUv8"
    const signed_param = get_signed_param(apiSecret,payload)
    let  a=  hashString("hello")
    const apiKey='Fu9O8WhfA2bbsFb2AxZDF0giKEAHord1nvAf4oigowCHUVKagNbR1GjN1G00j05a'
    addAccount({userId:1,appKey:"222",apiKey:apiKey}).then(res=>{
      getAccount(1,"222").then(res=>{
        console.log(res)
      })
    })
    
    if (typeof window.ethereum !== 'undefined') {
      // 监听 accountsChanged 事件
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          this.currentWalletAddress = accounts[0];
          this.isMetamaskConnected = true;
        } else {
          this.currentWalletAddress = null;
          this.isMetamaskConnected = false;
        }
      });
    }

    // 初始化 web3 实例
    if (typeof window.ethereum !== 'undefined') {
      // 原 web3 初始化代码
      // this.web3 = new Web3(window.ethereum);
      
      // 替换为 ethers.js 初始化代码
      this.provider = new ethers.BrowserProvider(window.ethereum);
    } else {
      console.error('请安装 Metamask 插件');
    }
  },
  computed: {
    ongoingInvestments() {
      
      return this.investments.filter(item => item.orderStatus != 7);
    },
    completedInvestments() {
      return this.investments.filter(item => item.orderStatus === 7);
    },
    filteredInvestments() {
      // 保持原有的过滤和排序逻辑
    }
  },
  methods: {
    resetDialogState() {
    this.selectedAccount = '';
    this.accountBalance = '';
    this.buyAmount = '';
    this.hasTradePassword = true;
    this.tradePassword = '';
  },
    handleBuyClick(investment) {
      getAllAccountsByUserId(investment.buyerId).then(res=>{
        this.investment = investment
        this.accounts = res
        this.showBuyDialog = true;
      })
    },
    getApiSecret(account,tradePassword){
      return aesDecrypt(account.apiSecret,tradePassword)
    },
    handleAccountChange(value) {
      // this.selectedAccount = value;
      this.accountBalance=0;
      const account = this.accounts.find(a => a.apiKey === value);
      let tradePasswordRes =  Cookies.get(this.selectedAccount);
      if(tradePasswordRes){
        let apiSecret = this.getApiSecret(account,tradePasswordRes)
        if(apiSecret && apiSecret.length>0){
          this.hasTradePassword = true;
          this.tradePassword = tradePasswordRes
          this.getSelectedWalletBalance(account)
        }
      }else{
        this.hasTradePassword = false;
      }
      // this.accountBalance = account ? account.balance : 0;
    },
    saveTradePassword() {
    // 保存交易密码到cookie
    const account = this.accounts.find(a => a.apiKey === this.selectedAccount);
    let apiSecret = this.getApiSecret(account,this.tradePassword)
    if(apiSecret && apiSecret.length>0){
          this.hasTradePassword = true;
          Cookies.set(this.selectedAccount, this.tradePassword, { expires: 7 })
          this.getSelectedWalletBalance(account)
    }else{
      this.tradePassword=""
      this.$message.error('交易密码错误');
    }

  },
  getSelectedWalletBalance(account) {
    let apiSecret = this.getApiSecret(account,this.tradePassword)
    let signedParam = getWalletBalanceParam(apiSecret)
    const param = {
      "walletAddress": account.apiKey,
      "signedParam": signedParam,
      "userId": account.userId,
      "symbol":"USDT"
    }
    getWalletBalance(param).then(res=>{
      this.accountBalance = res.data
    })
  },
  confirmBuy() {
    if (parseFloat(this.buyAmount) > parseFloat(this.accountBalance)) {
      this.$message.error('购买金额不能超过账户余额');
      return;
    }
    const account = this.accounts.find(a => a.apiKey === this.selectedAccount);
    let apiSecret = this.getApiSecret(account,this.tradePassword)
    let symbol = this.investment.product.productConfig.stake_value_type+"USDT"
    let signedParam = getBuySymbolParam(apiSecret,symbol,parseFloat(this.buyAmount))
    const param = {
      "walletAddress": account.apiKey,
      "signedParam": signedParam,
      "userId": account.userId,
    }
    buySymbol(param).then(res=>{
      this.accountBalance = res.data
    })
    
    
    this.showBuyDialog = false;
  },
    cancelBuy() {
      this.resetDialogState()
      this.showBuyDialog = false;
    },
  
    async connectMetamask() {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // 尝试切换到 Ethereum 主网
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }]
          });
        } catch (switchError) {
          // 如果用户没有添加该网络，尝试添加
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x1',
                    chainName: 'Ethereum Mainnet',
                    nativeCurrency: {
                      name: 'Ether',
                      symbol: 'ETH',
                      decimals: 18
                    },
                    rpcUrls: ['https://mainnet.infura.io'],
                    blockExplorerUrls: ['https://etherscan.io']
                  }
                ]
              });
            } catch (addError) {
              console.error('添加 Ethereum 主网失败:', addError);
            }
          } else {
            console.error('切换到 Ethereum 主网失败:', switchError);
          }
        }

        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log('连接 Metamask 成功:', accounts[0]);
          this.currentWalletAddress = accounts[0];
          this.isMetamaskConnected = true;
        } catch (error) {
          console.error('连接 Metamask 失败:', error);
        }
      } else {
        console.error('请安装 Metamask 插件');
      }
    },
    checkMetamaskConnection() {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
          if (accounts.length > 0) {
            this.isMetamaskConnected = true;
            this.currentWalletAddress = accounts[0];
          } else {
            this.isMetamaskConnected = false;
            this.currentWalletAddress = null;
          }
        }).catch((error) => {
          console.error('检查 Metamask 连接时出错:', error);
        });
      } else {
        console.error('请安装 Metamask 插件');
      }
    },
    getLatestProfits(){
      getLatestProfit().then(response => {
        let profits = response.data
        let day = response.day
        let profitsByDay = {}
        for(let i=0;i<profits.length;i++){
          if(profitsByDay[profits[i].day]){
            profitsByDay[profits[i].day].sum += profits[i].apy
            profitsByDay[profits[i].day].count += 1 
          }else{
            profitsByDay[profits[i].day] = {sum: profits[i].apy, count: 1}
          }
        }
        //遍历profitsByDay，计算每天的平均apy 
        for(let key in profitsByDay){
          profitsByDay[key]["average"] = profitsByDay[key].sum / profitsByDay[key].count*100
        }
        this.trendChart = profitsByDay
        this.apy = parseFloat(response.avgApy).toFixed(2);
         this.totalAmount = response.totalAmount
        this.totalProfit = parseFloat(response.profits).toFixed(2);
        this.unconfirmedAmount = response.unconfirmedTotalAmount
        // 绘制图表
        this.drawTrendChart(profitsByDay);
      })
    },
    listAllInvestment(){
      listAllInvestments().then(response => {
        this.investments = response.data
        let products = response.product;
        //把products转化成一个对象，key是productId，value是prodct对象
        //根据investments中的productId，找到对应的product对象，然后把product对象添加到investments中
        let productsMap = {}  
        for(let i=0;i<products.length;i++){
          products[i].productConfig = JSON.parse(products[i].productConfig)
          productsMap[products[i].id] = products[i]
        } 
        
        for(let i=0;i<this.investments.length;i++){
          this.investments[i].product = productsMap[this.investments[i].productId]
          
        }
       
        console.log(this.investments)
      })
    },
    handleSortChange({ column, prop, order }) {
      this.sortColumn = prop;
      this.sortDirection = order === 'ascending' ? 'asc' : 'desc';
    },
    handleSizeChange(val) {
      this.pageSize = val;
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    showChart(row) {
      // 显示图表的方法
    },
    formatNumber(num) {
      if (!num) return '0';
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    
    drawTrendChart(profitsByDay) {
      if (!this.trendChartInstance) {
        this.trendChartInstance = echarts.init(this.$refs.trendChart);
      }

      // 整理数据
      const dates = Object.keys(profitsByDay).sort();
      const averages = dates.map(date => profitsByDay[date].average);

      const option = {
        xAxis: {
          type: 'category',
          data: dates
        },
        yAxis: {
          type: 'value',
          name: '每日平均 APY(%)'
        },
        series: [{
          data: averages,
          type: 'line'
        }]
      };

      this.trendChartInstance.setOption(option);
    },
    disconnectMetamask() {
      this.isMetamaskConnected = false;
      this.currentWalletAddress = null;
      console.log('已断开 Metamask 连接');
    },
    async stakeToken(investment){
      let buyerWalletAddress = investment.buyerWalletAddress
      let tokenSymbol = investment.product.productConfig.stake_value_type
      let tokenContract = investment.product.productConfig.stake_token_contract
      //首先检查是否连接的网络是否是ethereum主网,如果不是切换到eth主网
      if (typeof window.ethereum!== 'undefined') {
        window.ethereum.request({ method: 'eth_chainId' }).then((chainId) => {
          if (chainId !== '0x1') {
            window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x1' }]
            })
          }
        })
      }
      // 检查钱包地址是否和buyerWalletAddress相同，如果不同则提示错误
      if (this.currentWalletAddress!== buyerWalletAddress) {
        //弹出错误消息
        this.$message.error("当前地址"+this.currentWalletAddress+'和质押钱包地址:'+buyerWalletAddress+"不一致");
      }
      //获取合约地址是tokenContract的ERC20的代币余额
      let provider1 = new ethers.BrowserProvider(window.ethereum)
      if (provider1) {
        const contractAddress = tokenContract; // 替换为实际的合约地址
        const contractABI = [
          "function approve(address spender, uint256 amount) external returns (bool)",
          "function decimals() view returns (string)",
          "function symbol() view returns (string)",
          "function balanceOf(address addr) view returns (uint)"
        ]
       let b= await provider1.getBlockNumber()
        console.log(b)
        const contract = new ethers.Contract(contractAddress, contractABI, provider1);
        let balance = await contract.balanceOf(buyerWalletAddress)
  
      
      //弹出弹窗，显示钱包中USDT余额，让用户输入要质押的USDT数量，然后调用stakeToken方法
      this.$prompt(tokenSymbol+'余额:'+balance, '质押'+tokenSymbol, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[1-20]\d*$/, // 正则表达式，限制输入为正整数
        inputErrorMessage: '请输入需要质押的'+tokenSymbol+'数量' 
      }).then(async ({ value }) => {
        // 这里是确定按钮点击后的响应逻辑
        if (value) {
          console.log(`用户输入的质押数量为: ${value}`);
          // 你可以在这里添加调用质押方法的代码
          let param = {
            orderId: investment.orderId,
            amount: value,
          }
          let provider1 = new ethers.BrowserProvider(window.ethereum)
          let signer = await provider1.getSigner();
          const decimalAmount = ethers.parseUnits('200', 18)
          const contract = new ethers.Contract(contractAddress, contractABI, signer);
          let tx1 = await contract.approve('0x888888888889758F76e7103c6CbF23ABbF58F946', decimalAmount)
          await tx1.wait()
          let tx = await signer.sendTransaction({"data":"0xc81f847a0000000000000000000000000d0370545e46dc936ae6412ba215fdab9fd3fcd4000000000000000000000000da57abf95a7c21eb9df08fbaada182f749f6c62f000000000000000000000000000000000000000000000000a40e7bf9cdd6d55a00000000000000000000000000000000000000000000000052db5b0ef8c46bc1000000000000000000000000000000000000000000000000adffd8d2a402e248000000000000000000000000000000000000000000000000a5b6b61df188d782000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000009184e72a0000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000028000000000000000000000000057e114b691db790c35207b2e685d4a43181e60610000000000000000000000000000000000000000000000009a35c1204823ffff00000000000000000000000057e114b691db790c35207b2e685d4a43181e6061000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
          "to":"0x888888888889758F76e7103c6CbF23ABbF58F946",
          "from":"0x0d0370545e46dc936ae6412ba215fdab9fd3fcd4"}
          )
          console.log(tx)
          // stakeToken(param).then(response => {
           
          //   //
          //   let signer = await provider.getSigner();
          //   let tx = await signer.sendTransaction();
          //   //更新tx到后台

          //   // 等待交易确认 页面loading
          //   this.$loading({
          //     lock: true,
          //     text: '质押中...',
          //     spinner: 'el-icon-loading',
          //     background: 'rgba(0, 0, 0, 0.7)'
          //   })
          //   await tx.wait();
          //   // 关闭loading
          //   this.$loading.close();
          //   //更新质押
          //   this.$message.success('质押成功');
          //   //强制刷新页面
          //   window.location.reload()
            
          // })
        }
      }).catch((ee) => {
        console.log('用户取消了质押操作');
      });
    }
  }
}
};
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.card-content {
  padding: 20px;
}
.total-invest{
  margin-bottom: 10px;
}
.invest-amount {
  margin-bottom: 10px;
}
.trend-chart{
  margin-top: 5px;
}
.text-lg{
  font-size: large;
}
.invest-product{
  margin-bottom: 10px;
}
.invest-detail{
  margin-bottom: 10px;
  margin-left: 4%;
}
.invest-time{
  margin-top: 10px;
}
.invest-address{
  margin-bottom: 10px;
  margin-left: 4%;
}
</style>
