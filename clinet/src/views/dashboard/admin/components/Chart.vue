<template>
  <div class="wrapper">
    <el-card style="width: 100% padding-top:20px;">
      <ve-line
        :data="chartData"
        :settings="chartSettings"
        :title="chartSettings.title"
      ></ve-line>
    </el-card>
    <div style="display: flex">
      <el-card style="width: 60%">
        <ve-pie
          :data="PieData"
          :settings="PieSettings"
          :title="PieSettings.title"
        ></ve-pie>
      </el-card>
      <el-card style="width: 40%">
        <ve-bar
          :data="BarData"
          :settings="BarSettings"
          :title="BarSettings.title"
        ></ve-bar>
      </el-card>
    </div>
  </div>
</template>

<script>
import { roomOccupancy, userDistribution } from '@/api/room'
import 'echarts/lib/component/title'
export default {
  data() {
    return {
      chartSettings: {
        title: {
          text: '公寓入住率',
          x: 'middle', //在图片中的x轴位置 left, right, middle
          y: 'bottom', //在图片中的y轴位置 top, bottom
          textAlign: 'center' //整体（包括 text 和 subtext）的水平对齐 auto, left, right, center
        },
        xAxisName: ['周期'],
        yAxisName: ['入住率'],
        yAxisType: ['percent'],
        area: true
      },

      PieSettings: {
        title: {
          text: '公寓楼房间占比',
          x: 'middle', //在图片中的x轴位置 left, right, middle
          y: 'bottom', //在图片中的y轴位置 top, bottom
          textAlign: 'center' //整体（包括 text 和 subtext）的水平对齐 auto, left, right, center
        },
        series: [
          {
            type: 'pie',
            roseType: 'radius',
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}: {d}%'
            },
    
          }
        ]
      },

      PieData: {
        columns: ['公寓名', '房间个数', '房间占比'],
        rows: [
          { 公寓名: 'A楼', 房间占比: 25 },
          { 公寓名: 'B楼', 房间占比: 35 },
          { 公寓名: 'C楼', 房间占比: 40 }
        ]
      },

      BarSettings: {
        title: {
          text: '不同房间类型受欢迎情况',
          x: 'middle',
          y: 'bottom',
          textAlign: 'center'
        },
         
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}人'
          },
          data: []
        },
        xAxis: {
          type: 'category',
          data: []
        },
        series: [
          {
            name: '房间类型',
            type: 'bar',
            data: [],
          
            }
          
        ]
      },

      BarData: {
        columns: ['房间类型', '人数'], // 更改为 '人数人'
        rows: [
         
        ]
      }
    }
  },
  props: {
    chartData: {
      type: Object,
      default: () => ({
        columns: [],
        rows: []
      })
    }
  },
  created() {
    this.fetchPieData()
    this.fetchBarData()
  },
  methods: {
    async fetchPieData() {
      const response = await roomOccupancy()
      const data = response.data
      this.PieData.rows = data
    },
    async fetchBarData() {
      const response = await userDistribution()
      const data = response.data
      this.BarData.rows = data
      console.log(this.BarData)
    }
  }
}
</script>
<style lang="scss" scoped></style>
