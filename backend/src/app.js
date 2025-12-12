require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./shared/database");
const { errorHandler } = require("./shared/middleware/error.middleware");

// Initialize app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Lifer Results Management API is running" });
});

// Feature Routes
app.use("/api/auth", require("./features/auth/auth.routes"));
app.use("/api/students", require("./features/students/student.routes"));
app.use("/api/subjects", require("./features/subjects/subject.routes"));
app.use("/api/results", require("./features/results/result.routes"));
app.use("/api/core", require("./features/core/core.routes"));

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
