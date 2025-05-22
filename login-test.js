const axios = require("axios"); 

async function test() { 
  try { 
    console.log("Testing admin login with admin@gmail.com / admin");
    const res = await axios.post("http://localhost:5000/api/auth/login", { 
      email: "admin@gmail.com", 
      password: "admin" 
    }); 
    console.log("Success! Token:", res.data.token ? "Valid token received" : "No token");
    console.log("User data:", res.data.user);
  } catch (err) { 
    console.error("Error:", err.message); 
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
      console.error("Response headers:", err.response.headers);
    }
  } 
} 

test(); 