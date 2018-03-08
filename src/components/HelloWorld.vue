<template>
  <div class="hello">
    <img src="../assets/pwa-reliable.png">
    <h1>Welcome to pwa project with vue</h1>
    <router-link to="/user">user</router-link>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hello{
  text-align: center;
}
img{
  width: 80%;
  max-width: 400px;
}
h1{
  font-weight: normal;
  font-size: 18px;
}
</style>
