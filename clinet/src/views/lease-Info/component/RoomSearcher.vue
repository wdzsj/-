<template>
  <el-autocomplete
    class="student-search"
    popper-class="my-autocomplete"
    v-model="state"
    :fetch-suggestions="querySearch"
    placeholder="输入租金"
    @select="handleSelect"
    @input="handleInput"
  >
    <template slot-scope="{ item }">
      
      <span class="account">{{ item.rent}}</span>
    </template>
  </el-autocomplete>
</template>

<script>
import { getRoomType } from '@/api/room'
export default {
  name: 'RoomSearcher',
  model: {
    prop: 'value',
    event: 'input'
  },
  data() {
    return {
      admins: [],
      state: null
    }
  },
  props: ['value'],
  methods: {
   async querySearch(queryString, cb) {
    if(queryString){
      let res = (await getRoomType({rent:queryString})).data.rooms 
      cb(res) 
    }else{
      let res=[{rent:6000},{rent:3000}]
      cb(res)
    }
    },
    handleSelect(item) {
      // 当用户选中时，会将 state 内容设置为 undefined，然后触发 handleSelect 事件
      this.state = item.rent.toString()
      this.$emit('input', this.state)
    },
    handleInput(val) {
      this.$emit('input', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.student-search {
  width: 100%;
  margin-right: 20px;
}
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
</style>
