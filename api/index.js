// api/index.js
const app = require("../src/app");

// Vercel cukup butuh handler (req, res) standar Node/Express
module.exports = (req, res) => {
  // optional: handle HEAD ping cepat
  if (req.method === "HEAD") return res.status(200).end();
  return app(req, res);
};
