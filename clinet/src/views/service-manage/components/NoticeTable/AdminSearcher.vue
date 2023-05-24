<template>
  <el-autocomplete
    class="admin-search"
    popper-class="my-autocomplete"
    v-model="state"
   :fetch-suggestions="querySearch"
    placeholder="输入管理员姓名或账号"
    @select="handleSelect"
  
  >
   <template slot-scope="{ item }">
     
      <span class="account">{{item.name+' '+item.account }}</span>
    </template>
  </el-autocomplete>
</template>

<script>
import { searchAdmin } from '@/api/user'
export default {
  name: 'AdminSearcher',
  // model: {
  //   prop: 'value',
  //   event: 'selected'
  // },
  data() {
    return {
      admins: [],
      state: ''
    }
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    selectorData:{

    }
  },
  watch: {
    // state(newVal) {
      
    // }
  },
  methods: {
    querySearch(queryString, cb) {
      searchAdmin(queryString).then(res => {
        const { admins } = res.data
        cb(admins)
      })
    },
    handleSelect(item) {
      this.state = item.name
      this.$emit('selected', item.account)
      this.selectorData.account = item.account
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
</style>
