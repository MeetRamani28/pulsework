const bcrypt = require("bcrypt");

const decryptPass = async (pass, hash) => {
  try {
    const status = await bcrypt.compare(pass, hash);
    return status;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports.comparePass = decryptPass;
