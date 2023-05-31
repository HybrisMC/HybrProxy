<template>
  <div id="loading">
    <img src="../assets/icon.png" />
    <i class="fa-solid fa-circle-notch"></i>
  </div>
</template>

<script>
export default {
  name: 'Loading',
};
</script>

<style scoped>
#loading {
}

img {
  width: 175px;
  position: absolute;
  top: 215px;
  left: calc(50% - 87.5px);
}

i {
  position: absolute;
  top: 405px;
  left: calc(50% - 35px);
  font-size: 75px;
  animation-name: spin;
  animation-duration: 2000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
