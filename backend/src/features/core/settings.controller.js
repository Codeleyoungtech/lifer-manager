const Settings = require("./settings.model");

// @desc    Get settings
// @route   GET /api/core/settings
// @access  Private
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings
// @route   PUT /api/core/settings
// @access  Private (Admin only)
const updateSettings = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (Array.isArray(payload.lockedTerms)) {
      payload.lockedTerms = payload.lockedTerms
        .filter((value) => typeof value === "string" && value.includes(":"))
        .map((value) => value.trim());
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(payload);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, payload, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
