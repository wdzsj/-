<template>
  <div id="student-info">
    <h1 class="main-title">宿舍概览</h1>
    <div class="wrapper">
      <PanelGroup></PanelGroup>
    </div>
    <h1 class="main-title">当前入住</h1>
    <div class="wrapper">
      <UserList :usersData="usersData"></UserList>
    </div>
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import UserList from './components/UserList'
import { getUsers } from '@/api/user'

export default {
  name: 'Info',
  components: {
    PanelGroup,
    UserList
  },
  data() {
    return {
      usersData: []
    }
  },
  computed: {
    name() {
      return this.$store.getters.name
    }
  },
  mounted() {
    if (this.$store.getters.room) {
      getUsers({ roomId: this.$store.getters.room.id }).then(res => {
        this.usersData = res.data.users
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  margin: 40px 0;
}
</style>
