import { api } from "../api/client.js";

const attendanceService = {
  async getAttendance(classLevel, term, year) {
    const params = new URLSearchParams({ classLevel, term });
    if (year) params.append("year", year);
    return await api.get(`/core/attendance?${params}`);
  },

  async getStudentAttendance(studentId, term, year) {
    const params = new URLSearchParams({ term });
    if (year) params.append("year", year);
    return await api.get(`/core/attendance/student/${studentId}?${params}`);
  },

  async bulkSaveAttendance(data) {
    return await api.post("/core/attendance/bulk", data);
  },
};

export default attendanceService;
