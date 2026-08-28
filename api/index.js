module.exports = (req, res) => {
  res.status(200).json({
    message: "🚀 Vercel funciona",
    url: req.url,
    method: req.method,
  });
};