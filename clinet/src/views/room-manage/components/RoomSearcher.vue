<template>
  <div class="GroupSelector">
    <div class="selector-item">
      <span class="label">房间号</span>
      <el-autocomplete
        class="room-search"
        popper-class="my-autocomplete"
        v-model="number"
        :fetch-suggestions="querySearch"
        placeholder="输入房间号"
        @select="handleSelect"
        @input="handleInput"
      >
        <template slot-scope="{ item }">
          <span class="account">{{ item.number }}</span>
        </template>
      </el-autocomplete>
      <el-button type="primary" @click="searchA">搜索</el-button>
    </div>

    <div class="selector-item">
      <span class="label">房间类型</span>
      <el-select
        v-model="roomInfo.peopleNum"
        placeholder="人数"
        clearable
        style="max-width: 100px;"
      >
        <el-option
          v-for="item in roomTypeData"
          :key="item.id"
          :label="item.peopleNum"
          :value="item.peopleNum"
        >
        </el-option>
      </el-select>
    </div>

    <div class="selector-item">
      <span class="label">已住人数</span>
      <el-select
        v-model="roomInfo.currentPeopleNum"
        placeholder="默认"
        clearable
        style="max-width: 100px;"
      >
        <el-option
          v-for="item in c"
          :key="item.id"
          :label="item.id"
          :value="item.id"
        >
        </el-option>
      </el-select>
    </div>

    <div class="selector-item">
      <span class="label">租金</span>
      <el-input
        placeholder="默认"
        v-model="roomInfo.rent"
        clearable
        style="max-width: 100px;"
      >
      </el-input>
      <el-button type="primary" @click="searchB">搜索</el-button>
    </div>
  </div>
</template>

<script>
import { searchRoom, getRoomType } from '@/api/room'
export default {
  name: 'RoomSearcher',
  model: {
    prop: 'value',
    event: 'input'
  },
  data() {
    return {
      rooms: [],
      roomTypeData: [],
      c: [],
      number: '',
      roomInfo: {
        rent: null,
        currentPeopleNum: null,
        peopleNum: null
      }
    }
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  mounted() {
    getRoomType().then(res => {
      this.roomTypeData = res.data.rooms.filter((obj, index, array) => {
        // 找到第一个符合条件的元素，后续的相同元素将被过滤掉
        const firstIndex = array.findIndex(o => o.peopleNum === obj.peopleNum)
        // 如果当前元素是第一个符合条件的元素，则保留
        return index === firstIndex
      })
      const max = this.roomTypeData.reduce((acc, curr) => {
        return curr.peopleNum > acc ? curr.peopleNum : acc
      }, 0)
      for (let i = max; i >= 0; i--) {
        this.c.push({ id: i })
      }
    })
  },
  watch: {
    'roomInfo.peopleNum': function(newVal) {
      this.c=[]
      if (newVal) {
        for (let i = newVal; i >= 0; i--) {
          this.c.push({ id: i })
        }
      } else {
        const max = this.roomTypeData.reduce((acc, curr) => {
        return curr.peopleNum > acc ? curr.peopleNum : acc
      }, 0)
      for (let i = max; i >= 0; i--) {
        this.c.push({ id: i })
      }
      }
    }
  },
  methods: {
    querySearch(queryString, cb) {
      searchRoom(queryString).then(res => {
        const rooms = res.data.Rooms
        cb(rooms)
      })
    },
    handleSelect(item) {
      // 当用户选中时，会将 state 内容设置为 undefined，然后触发 handleSelect 事件
      this.number = item.number.toString()
      this.$emit('input', this.number.toString())
    },
    handleInput(val) {
      this.$emit('input', val)
    },
    searchB() {
      this.$emit('getRoomsInfo', this.roomInfo)
    },
    searchA() {
      this.$emit('getRoomsInfo', { number: this.number })
    }
  }
}
</script>

<style lang="scss" scoped>
.my-autocomplete {
  li {
    line-height: normal;
    padding: 7px;

    .name {
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .account {
      font-size: 12px;
      color: #b4b4b4;
    }

    .highlighted .account {
      color: #ddd;
    }
  }
}
.GroupSelector {
  display: flex;
  margin: 0 -10px;
  .selector-item {
    display: flex;
    align-items: center;
    margin: 0 10px;
    span {
      margin: 0 10px;
    }
    .el-button--medium {
      // font-size: 14px;
      margin: 0 10px;
    }
  }
}
</style>
