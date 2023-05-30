<template>
  <div class="container">
    <div class="input-container">
      <input v-model="city" placeholder="Enter a city" />
      <button @click="compareWeather">Compare</button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="showResults" class="result-container">
      <h2 class="city-heading">{{ city.toUpperCase() }}</h2>
      <div
        v-for="(temperatures, date) in temperatureData"
        :key="date"
        class="date-container"
      >
        <h3>{{ date }}</h3>
        <div class="temperature-header">
          <div class="column time">Time</div>
          <div class="column temperature">SMHI Temperature</div>
          <div class="column temperature">Klart Temperature</div>
        </div>
        <div
          v-for="(temperature, time) in temperatures"
          :key="time"
          class="temperature-row"
        >
          <div class="column time">{{ time }}</div>
          <div class="column temperature temperature-smhi">
            {{ temperature.smhi }}
          </div>
          <div class="column temperature temperature-klart">
            {{ temperature.klart }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      city: "",
      temperatureData: {},
      loading: false,
      showResults: false,
    };
  },
  methods: {
    async compareWeather() {
      this.loading = true;
      this.showResults = false;

      const smhiResponse = await axios.post("http://localhost:3000/smhi", {
        city: this.city,
      });

      const klartResponse = await axios.post("http://localhost:3000/klart", {
        city: this.city,
      });

      const smhiTemperatureData = smhiResponse.data;
      const klartTemperatureData = klartResponse.data;

      // Combine the temperature data from both APIs
      const combinedTemperatureData = {};
      for (const date in smhiTemperatureData) {
        const smhiTemperatures = smhiTemperatureData[date];
        const klartTemperatures = klartTemperatureData[date];
        const combinedTemperatures = {};

        for (const time in smhiTemperatures) {
          combinedTemperatures[time] = {
            smhi: smhiTemperatures[time],
            klart: klartTemperatures && klartTemperatures[time],
          };
        }

        combinedTemperatureData[date] = combinedTemperatures;
      }

      this.temperatureData = combinedTemperatureData;
      this.loading = false;
      this.showResults = true;
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.input-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.result-container {
  background-color: #f5f5f5;
  padding: 20px;
}

.city-heading {
  text-transform: uppercase;
  font-weight: bold;
  text-align: center;
}

.date-container {
  margin-bottom: 20px;
}

.temperature-header {
  display: flex;
  align-items: center;
  font-weight: bold;
  margin-bottom: 10px;
}

.column {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time {
  justify-content: flex-start;
}

.temperature {
  justify-content: flex-end;
}

.temperature-row {
  display: flex;
  align-items: center;
}

.temperature-row .column:not(:last-child) {
  margin-right: 20px;
}

.temperature-smhi,
.temperature-klart {
  font-weight: bold;
  font-size: 1.1rem;
}
</style>
