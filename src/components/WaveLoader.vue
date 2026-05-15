<template>
  <div class="wave-loader-wrap">
    <div class="wave-loader">
      <div class="bar bar1" />
      <div class="bar bar2" />
      <div class="bar bar3" />
      <div class="bar bar4" />
      <div class="bar bar5" />
      <div class="bar bar6" />
      <div class="bar bar7" />
      <div class="bar bar8" />
      <div class="bar bar9" />
    </div>
  </div>
</template>

<style scoped>
.wave-loader-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 160px;
}

.wave-loader {
  position: relative;
  width: 164px;
  height: 100px;
}

.wave-loader .bar {
  position: absolute;
  width: 10px;
  height: 30px;
  background-color: #ff6a00;
  border-radius: 5px;
  animation: wave-bar 1.5s ease-in-out infinite;
}

.wave-loader .bar1  { left: 0px;   animation-delay: 0s; }
.wave-loader .bar2  { left: 20px;  animation-delay: 0.15s; }
.wave-loader .bar3  { left: 40px;  animation-delay: 0.3s; }
.wave-loader .bar4  { left: 60px;  animation-delay: 0.45s; }
.wave-loader .bar5  { left: 80px;  animation-delay: 0.6s; }
.wave-loader .bar6  { left: 100px; animation-delay: 0.75s; }
.wave-loader .bar7  { left: 120px; animation-delay: 0.9s; }
.wave-loader .bar8  { left: 140px; animation-delay: 1.05s; }
.wave-loader .bar9  { left: 160px; animation-delay: 1.2s; }

@keyframes wave-bar {
  0%   { height: 30px; transform: translate(0, 0); }
  50%  { height: 70px; transform: translate(0, 35px); }
  100% { height: 30px; transform: translate(0, 0); }
}
</style>
