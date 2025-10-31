// hash.js
const bcrypt = require("bcrypt");

bcrypt.hash("adminadmin", 10).then((hash) => {
  console.log("Your bcrypt hash is:");
  console.log(hash);
});
