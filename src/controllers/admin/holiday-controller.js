import HolidayRepository from "../../repositories/admin/holiday-repository.js";
import AddHolidayRequest from "../../requests/admin/add-holiday-request.js";
import UpdateHolidayRequest from "../../requests/admin/update-holiday-request.js";
import HolidayResponse from "../../responses/holiday-response.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";

const holidayRepo = new HolidayRepository();

export default class HolidayController {
  /**
   * Add Holiday
   *
   * @swagger
   * /holiday/add:
   *   post:
   *     tags:
   *       - Holiday
   *     summary: Add holiday
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               holiday_name:
   *                 type: string
   *                 description: Enter holiday name
   *               holiday_type:
   *                 type: string
   *                 description: Enter holiday type
   *               start_date:
   *                 type: string
   *                 format: date
   *                 description: Enter holiday start date
   *               end_date:
   *                 type: string
   *                 format: date
   *                 description: Enter holiday end date
   *               location:
   *                 type: string
   *                 description: Enter holiday location
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
  async addHoliday(req, res) {
    try {
      const validatedData = await new AddHolidayRequest(req).validate();

      const holidayDetails = await holidayRepo.addHoliday(validatedData);

      if (holidayDetails) {
        const holidayData = await HolidayResponse.format(holidayDetails);

        res.status(200).json({
          status: true,
          message: "Holiday added successfully.",
          data: holidayData,
        });
      } else {
        res.status(422).json({
          status: false,
          message: "Failed to add holiday.",
          data: [],
        });
      }
    } catch (error) {
      if (error instanceof CustomValidationError) {
        res.status(422).json({
          status: false,
          message: "Validation failed.",
          errors: error.errors,
        });
      } else {
        res.status(500).json({
          status: false,
          message: "Failed to add holiday.",
          errors: error.message || error,
        });
      }
    }
  }

  /**
   * Get all holidays with filters
   *
   * @swagger
   * /holiday/list:
   *   post:
   *     tags:
   *       - Holiday
   *     summary: Get all holidays with filters
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               holiday_type:
   *                 type: string
   *                 description: Filter by holiday type
   *               location:
   *                 type: string
   *                 description: Filter by location
   *               holiday_name:
   *                 type: string
   *                 description: Filter by holiday name
   *               year:
   *                 type: integer
   *                 description: Filter holidays by year (optional)
   *               start_date:
   *                 type: string
   *                 format: date
   *                 description: Filter holidays by start date
   *               end_date:
   *                 type: string
   *                 format: date
   *                 description: Filter holidays by end date
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
  async getAllHolidays(req, res) {
    try {
      // Extract filters from request body
      const filters = {
        holiday_type: req.body.holiday_type,
        location: req.body.location,
        holiday_name: req.body.holiday_name,
        year: req.body.year,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
      };

      // Remove undefined filters
      Object.keys(filters).forEach((key) => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      // Retrieve holidays
      const holidays = await holidayRepo.getAllHolidays(filters);

      // Respond with holidays
      res.status(200).json({
        status: true,
        message: "Holidays retrieved successfully",
        data: {
          holidays: holidays,
          total: holidays.length,
        },
      });
    } catch (error) {
      console.error("Error fetching holidays:", error);

      res.status(500).json({
        status: false,
        message: "Failed to fetch holidays",
        errors: error.message || "Unknown error occurred",
      });
    }
  }

  /**
   * Get Holiday By Id
   *
   * @swagger
   * /holiday/get/{id}:
   *   post:
   *     tags:
   *       - Holiday
   *     summary: Get holiday by id
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Holiday ID
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Not Found
   *       500:
   *         description: Internal Server Error
   */
  async getHolidayById(req, res) {
    try {
      const holiday = await holidayRepo.getHolidayById(req.params.id);

      if (!holiday) {
        return res.status(404).json({
          status: false,
          message: "Holiday not found.",
          data: null,
        });
      }

      const holidayData = await HolidayResponse.format(holiday);

      res.status(200).json({
        status: true,
        message: "Holiday retrieved successfully.",
        data: holidayData,
      });
    } catch (error) {
      if (error instanceof CustomValidationError) {
        res.status(422).json({
          status: false,
          message: "Validation Error",
          errors: error.errors,
        });
      } else {
        return res.status(500).json({
          status: false,
          message: "Failed to retrieve holiday.",
          errors: error.message || error,
        });
      }
    }
  }

  /**
   * Update Holiday
   *
   * @swagger
   * /holiday/update/{id}:
   *   put:
   *     tags:
   *       - Holiday
   *     summary: Update holiday
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Holiday ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               holiday_name:
   *                 type: string
   *                 description: Enter holiday name
   *               holiday_type:
   *                 type: string
   *                 description: Enter holiday type
   *               start_date:
   *                 type: string
   *                 format: date
   *                 description: Enter holiday start date
   *               end_date:
   *                 type: string
   *                 format: date
   *                 description: Enter holiday end date
   *               location:
   *                 type: string
   *                 description: Enter holiday location
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       404:
   *         description: Not Found
   *       500:
   *         description: Internal Server Error
   */
  async updateHoliday(req, res) {
    try {
      const validatedData = await new UpdateHolidayRequest(req).validate();

      const holidayDetails = await holidayRepo.updateHoliday(
        req.params.id,
        validatedData
      );

      if (holidayDetails) {
        const holidayData = await HolidayResponse.format(holidayDetails);

        res.status(200).json({
          status: true,
          message: "Holiday updated successfully.",
          data: holidayData,
        });
      } else {
        res.status(404).json({
          status: false,
          message: "Holiday not found.",
          data: null,
        });
      }
    } catch (error) {
      if (error instanceof CustomValidationError) {
        res.status(422).json({
          status: false,
          message: "Validation Error",
          errors: error.errors,
        });
      } else {
        return res.status(500).json({
          status: false,
          message: "Failed to update holiday.",
          errors: error.message || error,
        });
      }
    }
  }
}
