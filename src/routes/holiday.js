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
  .route("/get/:id")
  .post(
    holiday.getHolidayById
  );
  holidayRouter
  .route("/update/:id")
  .put(
    holiday.updateHoliday
  );

export default holidayRouter;