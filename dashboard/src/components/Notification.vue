<template>
  <div
    id="notification"
    v-bind:class="{
      show: $store.state.notification.showing,
      hide: !$store.state.notification.showing,

      'notification-info': $store.state.notification.data?.type === 'info',
      'notification-success':
        $store.state.notification.data?.type === 'success',
      'notification-error': $store.state.notification.data?.type === 'error',
    }"
  >
    <div
      id="notification-icon"
      class="fa-solid"
      v-bind:class="{
        'fa-check': $store.state.notification.data?.type === 'success',
        'fa-info': $store.state.notification.data?.type === 'info',
        'fa-x': $store.state.notification.data?.type === 'error',
      }"
    ></div>
    <p v-html="$store.state.notification.data?.message"></p>
  </div>
</template>

<script>
export default {
  name: 'Notification',
};
</script>

<style scoped>
#notification {
  width: 400px;
  z-index: 1000000000000000;
  position: fixed;
  bottom: 20px;
  border-radius: 15px;
  padding: 5px;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.25);
  background-color: rgba(14, 14, 14, 0.8);
  -webkit-font-smoothing: subpixel-antialiased;
  -webkit-transform: perspective(1px) scale3d(1, 1, 1);
  transform: perspective(1px) scale3d(1, 1, 1);
  backface-visibility: hidden;
}
.show {
  transition: right 0.4s ease;
  right: 20px;
}
.hide {
  transition: right 0.4s ease-in;
  right: -450px;
}

p {
  margin: 0px;
  margin-top: 10px;
  margin-bottom: 15px;
  margin-left: 10px;
  font-weight: 500;
  letter-spacing: 0.2px;
  font-size: 1.2rem;
}

.notification-info > p {
  color: var(--color-notif-info);
}
.notification-info > #notification-icon::before {
  color: var(--color-notif-info);
  left: 20px;
  top: 13px;
}
.notification-info > #notification-icon::after {
  border: solid 1.5px var(--color-notif-info);
}

.notification-success > p {
  color: var(--color-notif-success);
}
.notification-success > #notification-icon::before {
  color: var(--color-notif-success);
  left: 13px;
  top: 14px;
}
.notification-success > #notification-icon::after {
  border: solid 1.5px var(--color-notif-success);
}

.notification-error > p {
  color: var(--color-notif-error);
}
.notification-error > #notification-icon::before {
  color: var(--color-notif-error);
  left: 15.5px;
  top: 14px;
}
.notification-error > #notification-icon::after {
  border: solid 1.5px var(--color-notif-error);
}

#notification-icon {
  width: 48px;
  height: 48px;
  background-color: rgba(14, 14, 14, 0.8);
  position: absolute;
  margin-left: -57.5px;
  border-radius: 25px;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
#notification-icon::before {
  position: absolute;
  font-size: 1.3rem;
}
#notification-icon::after {
  width: 36px;
  height: 36px;
  content: '';
  position: fixed;
  border-radius: 25px;
  position: absolute;
  left: 4.5px;
  top: 4.5px;
}
</style>
