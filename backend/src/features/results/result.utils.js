<<<<<<< HEAD
// Secondary School Grading System (WAEC/NECO Standard)
const calculateGrade = (total) => {
  if (total >= 85) return "A1";
  if (total >= 75) return "B2";
  if (total >= 70) return "B3";
  if (total >= 65) return "C4";
  if (total >= 60) return "C5";
  if (total >= 50) return "C6";
  if (total >= 45) return "D7";
  if (total >= 40) return "E8";
  return "F9";
};

const calculateRemarks = (total) => {
  if (total >= 85) return "Excellent";
  if (total >= 75) return "Very Good";
  if (total >= 70) return "Good";
  if (total >= 60) return "Credit";
  if (total >= 50) return "Credit";
  if (total >= 45) return "Pass";
  if (total >= 40) return "Fair";
  return "Fail";
};

const calculatePrimaryRemarks = (total) => {
  if (total >= 90) return "EXCELLENT";
  if (total >= 80) return "V.GOOD";
  if (total >= 70) return "GOOD";
  if (total >= 60) return "U.CREDIT";
  if (total >= 51) return "L.CREDIT";
  if (total === 50) return "AVERAGE";
  if (total >= 40) return "FAIR"; // 40-49
  return "POOR";
};

module.exports = {
  calculateGrade,
  calculateRemarks,
  calculatePrimaryRemarks,
=======
const calculateGrade = (total) => {
  if (total >= 80) return "A";
  if (total >= 70) return "B";
  if (total >= 60) return "C";
  if (total >= 50) return "D";
  if (total >= 40) return "E";
  return "F";
};

const calculateRemarks = (total) => {
  if (total >= 80) return "Excellent";
  if (total >= 70) return "Very Good";
  if (total >= 60) return "Good";
  if (total >= 50) return "Pass";
  if (total >= 40) return "Weak Pass";
  return "Fail";
};

module.exports = {
  calculateGrade,
  calculateRemarks,
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f
};
