module.exports = function validatePollData(req, res, next) {
  const { title, options, target_location } = req.body;
  if (
    !title ||
    typeof title !== "string" ||
    title.length < 10 || title.length > 200 ||
    !Array.isArray(options) ||
    options.length < 2 || options.length > 10 ||
    !options.every(opt => typeof opt === "string" && opt.trim().length > 0) ||
    !target_location
  ) {
    return res.status(400).json({ message: "Invalid poll data: check title, options, or target_location." });
  }
  next();
};
