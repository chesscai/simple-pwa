<template>
  <div class="user">
    <img src="../assets/chess.png" alt="chess">
    <h1>Chess</h1>
    <router-link to="/">home</router-link>
    <h2>This is my introduce</h2>
    <p>Hello World</p>
  </div>
</template>

<script>
export default {
  name: 'User'
}
</script>

<style scoped>
.user{
  text-align: center;
}
img{
  border-radius: 50%;
}
h1, h2, p{
  font-weight: normal;
  font-size: 18px;
}
h2{
  margin-top: 60px;
  color: #aaa;
}
</style>
