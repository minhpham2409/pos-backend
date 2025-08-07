const axios = require('axios');

const url = 'http://localhost:3000/api/orders';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODg3MWQ2NWU3OTU0ZmUyODhiMWYyYTEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTM2ODU2MDAsImV4cCI6MTc1MzY4OTIwMH0.76ESVpihT_X5npMUBPTmsJYbuwUOeNqXRyyQV3OkfrE'; // rút gọn

const body = {
  items: [
    { productId: "68824c4e23bed2fef54875fe", qty: 1 }
  ]
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendRequest(index) {
  try {
    const res = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(`✅ Request ${index} - Status: ${res.status}`);
  } catch (err) {
    console.error(`❌ Request ${index} - Error:`, err.response?.status || err.message);
  }
}

async function runRaceConditionTest() {
  const totalRequests = 10000; // thử 100 trước
  console.time('RaceTest');

  for (let i = 0; i < totalRequests; i++) {
    sendRequest(i + 1); // không await để chạy song song
    // await delay(50);    // chờ 50ms rồi mới gửi request tiếp theo
  }

  console.timeEnd('RaceTest');
}

runRaceConditionTest();
