import express from 'express';
import HolidayController from '../controllers/admin/holiday-controller.js';

const holidayRouter = express.Router();
const holiday = new HolidayController();

holidayRouter
  .route("/add")
  .post(
    holiday.addHoliday
  );

  holidayRouter
  .route("/list")
  .post(
    holiday.getAllHolidays
  );
  holidayRouter
  .route("/update/:id")
  .post(
    holiday.updateHoliday
  );
  holidayRouter
  .route("/dashboard-holiday")
  .post(
    holiday.getNextHolidays
  );
  holidayRouter
  .route("/delete/:id")
  .post(
    holiday.deleteHoliday
  );

export default holidayRouter;