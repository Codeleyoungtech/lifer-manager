const ResultMetadata = require("./result-metadata.model");

// @desc    Get result metadata (conventional performance + comments)
// @route   GET /api/results/metadata/:studentId?term=X&year=Y
// @access  Private
const getResultMetadata = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { term, year } = req.query;

    if (!term || !year) {
      return res.status(400).json({
        message: "Term and academic year are required",
      });
    }

    const metadata = await ResultMetadata.findOne({
      studentId,
      term,
      academicYear: year,
    });

    const responseData = metadata || {};

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// @desc    Save or update result metadata
// @route   PUT /api/results/metadata/:studentId
// @access  Private
const saveResultMetadata = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const {
      term,
      year,
      conventionalPerformance,
      classTeacherComment,
      principalComment,
      intuitiveFeats,
    } = req.body;

    if (!term || !year) {
      return res.status(400).json({
        message: "Term and academic year are required",
      });
    }

    const metadata = await ResultMetadata.findOneAndUpdate(
      {
        studentId,
        term,
        academicYear: year,
      },
      {
        $set: {
          conventionalPerformance,
          classTeacherComment,
          principalComment,
          intuitiveFeats,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Result metadata saved successfully",
      metadata,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResultMetadata,
  saveResultMetadata,
};
