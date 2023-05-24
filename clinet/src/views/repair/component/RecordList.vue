<template>
  <div class="record-list">
    <div class="info-wrapper">
      <div class="top-text">报修清单</div>
      <div class="counter">
        <countTo
          :startVal="0"
          :endVal="percent||0"
          :decimals="2"
          :duration="1500"
          suffix="%"
          class="count"
        ></countTo>
      </div>
      <el-select
        @change="handleSelectedChange"
        v-model="showDays"
        placeholder="请选择"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <el-row :gutter="20" class="list-wrapper">
      <el-col :md="12" v-for="repair in repairsData" :key="repair.id">
        <div class="record-item" >
          <div class="date">
           {{ (repair.createdAt?(repair.createdAt ):0 )| formatDate('YYYY年MM月DD日 HH:mm')}}
            <!-- {{ repair.createdAt }} -->
          </div>
          <div class="text">
            {{ repair.repairType }}
          </div>
          <div class="progress" :class="{ [getCss(repair.createdAt,repair.updatedAt)]: true }">{{ getProgress(repair.createdAt,repair.updatedAt) }}</div>
         
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import countTo from 'vue-count-to'

export default {
  name: 'RecordList',
  components: {
    countTo
  },
  props: {
    repairsData :{
      type: Array,
      default: () => []
    },
    roomId:{
      
    }
  },
  data() {
    return {
      options: [
        {
          value: 7,
          label: '最近7天'
        },
        {
          value: 14,
          label: '最近14天'
        },
        {
          value: 30,
          label: '最近30天'
        },
        {
          value: 50,
          label: '最近50天'
        },
        {
          value: 100,
          label: '最近100天'
        }
      ],
      showDays: 7
      // isDay: new Date((new Date()).getTime() - 7 * 24 * 60 * 60 * 1000),
      
    }
  },
  computed: {
    percent() {
      let total = this.repairsData.length
      let repairCount = 0
      this.repairsData.forEach(repair => {
       const c= (repair.createdAt)
       const u =(repair.updatedAt)
      //  console.log(c,u);
        if (c!=u) {
          repairCount++
        }
      })
      const percentNumber = ((repairCount / total) * 100).toFixed(2)
      return Number(percentNumber)
    }
  },
  methods: {
     getProgress(c,u) {
      if (c!== u) {
        return '完成'
      } else {
        return '待办'
      }
    },
    
    getCss(t1,t2) {
      if (t1==t2) {
        return 'done'
      } else {
        return 'doing'
      }
    },
    handleSelectedChange(val) {
     this.$emit('change', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.record-list {
  height: 240px;
  padding-right: 10px;
  display: flex;
  .info-wrapper {
    margin-right: 20px;
    width: 240px;
    box-sizing: content-box;
    border: 1px solid rgba($color: #000000, $alpha: 0.1);
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    .top-text {
      font-size: 18px;
    }
    .count {
      color: #f6416c;
      font-size: 40px;
    }
  }
  .list-wrapper {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    margin-right: -20px;
    .record-item {
      position: relative;
      margin-bottom: 20px;
      padding: 10px;
      border-radius: 5px;
      display: flex;
      justify-content: space-between;
      padding-right: 20px;
      border: 1px solid rgba($color: #000000, $alpha: 0.1);
      cursor: pointer;
      .progress{
        position: absolute;
        top: 2px;
        right: 2px;
        font-size: 12px;
         transform: rotate(45deg);
      }
     
    }
    .done {
      // background-color: rgba($color: #000000, $alpha: 0.1);
      color: $color-danger;
      //  border: 1px solid rgba($color: #000000, $alpha: 0.1);
    }
    .doing {
      // background-color: rgba($color: #000000, $alpha: 0.1);
      color:  $color-primary;
     
    }
    .no-data {
      background-color: rgba($color: #000000, $alpha: 0.1);
    }
  }
}
</style>
