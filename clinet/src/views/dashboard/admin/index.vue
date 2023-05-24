<template>
  <div class="dashboard-admin-container">
    <!-- 管理概览 -->
    <h1 class="main-title">
      <span style="margin-right: 20px">管理概览</span>
      <el-select v-model="buildingId" placeholder="请选择管理的宿舍">
        <el-option
          v-for="item in manageBuildings"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        >
        </el-option>
      </el-select>
    </h1>
    <div class="wrapper">
      <PanelGroup :building-id="buildingId"></PanelGroup>
    </div>
    <!-- 管理概览 -->
<h1 class="main-title">数据图表</h1>
   
        <Chart :chartData="chartData"></Chart>
     
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import Chart from './components/Chart.vue'
import { getBuildingsInfo,getSum } from '@/api/building'
export default {
  name: 'AdminDashboard',
  components: {
    PanelGroup,
    Chart,
    
  },
  data() {
    return {
      buildingId: null,
      total:{
          id: 0,
          name:'全部'
      },
      chartData: {  columns: ['周期','A栋','B栋'],
        rows: [
          {A栋:'0.8',B栋:'0.8',周期:'最近7天'},
          {A栋:'0.76',B栋:'0.7',周期:'最近14天'},
          {A栋:'0.86',B栋:'0.9',周期:'最近21天'}
        ]
        },
      buildingsData:[],
      buildingsInfo:{}
    }
  },
  computed: {
    manageBuildings() {
      const buildings =[this.total, ...this.$store.getters.manageBuildings]
      return buildings
    }
  },
  watch: {
    manageBuildings() {
      this.buildingId =
        this.manageBuildings.length > 0 ? this.manageBuildings[0].id : 1
    },
    
  },
  mounted() {
    this.buildingId =
      this.manageBuildings.length > 0 ? this.manageBuildings[0].id : 0
      this.getBuildingsInfo()
    
  },
  methods: {
   async getBuildingsInfo(){
      this.chartData=(await getBuildingsInfo()).data
      this.buildingsInfo=(await getSum()).data
  
   
  //  console.log(this.buildingsData);
  }
  }
 
  
}
</script>

<style lang="scss" scoped>
.dashboard-admin-container {
  padding: 50px 60px 0px;
  .main-title {
    display: flex;
    align-items: center;
  }
  .wrapper {
    border-radius: 5px;
    overflow: hidden;
    margin: 40px 0;
  }
  .botttom-wrapper {
    margin: 40px 0;
    background-color: #fff;
    border-radius: 5px;
    padding: 20px;
  }
}
</style>
