import HolidayRepository from "../../repositories/admin/holiday-repository.js";
import AddHolidayRequest from "../../requests/admin/add-holiday-request.js";
import UpdateHolidayRequest from "../../requests/admin/update-holiday-request.js";
import HolidayResponse from '../../responses/holiday-response.js';
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
   *                 enum: ["National Holiday", "Public Holiday", "Restricted Holiday", "Office Shutdown"]
   *                 description: Enter holiday type
   *               start_date:
   *                 type: string
   *                 format: date
   *                 description: Enter start date
   *               end_date:
   *                 type: string
   *                 format: date
   *                 description: Enter end date
   *               location:
   *                 type: string
   *                 enum: ["India", "Dubai"]
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

        return res.status(200).json({
          status: true,
          message: "Holiday added successfully.",
          data: holidayData,
        });
      } else {
        return res.status(422).json({
          status: false,
          message: "Failed to add holiday.",
          data: [],
        });
      }
    } catch (error) {
      if (error instanceof CustomValidationError) {
        return res.status(422).json({
          status: false,
          message: "Validation failed.",
          errors: error.errors,
        });
      }
      return res.status(500).json({
        status: false,
        message: "Failed to add holiday.",
        errors: error.message || error,
      });
    }
  }

  /**
   * Get All Holidays
   *
   * @swagger
   * /holiday/list:
   *   post:
   *     tags:
   *       - Holiday
   *     summary: Get all holidays
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               holiday_type:
   *                 type: string
   *                 enum: ["National Holiday", "Public Holiday", "Restricted Holiday", "Office Shutdown"]
   *               location:
   *                 type: string
   *                 enum: ["India", "Dubai"]
   *               year:
   *                 type: integer
   *                 description: Filter by year
   *               holiday_name:
   *                 type: string
   *                 description: Filter by holiday name
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
      const filters = req.body;
      const holidays = await holidayRepo.getAllHolidays(filters);

      const formattedHolidays = await Promise.all(
        holidays.map(async (holiday) => await HolidayResponse.format(holiday))
      );

      return res.status(200).json({
        status: true,
        message: "Holidays retrieved successfully.",
        data: {
          holidays: formattedHolidays,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Failed to retrieve holidays.",
        errors: error,
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

      return res.status(200).json({
        status: true,
        message: "Holiday retrieved successfully.",
        data: holidayData,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Failed to retrieve holiday.",
        errors: error,
      });
    }
  }

  /**
   * Update Holiday
   *
   * @swagger
   * /holiday/update/{id}:
   *   post:
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
   *                 enum: ["National Holiday", "Public Holiday", "Restricted Holiday", "Office Shutdown"]
   *                 description: Enter holiday type
   *               start_date:
   *                 type: string
   *                 format: date
   *                 description: Enter start date
   *               end_date:
   *                 type: string
   *                 format: date
   *                 description: Enter end date
   *               location:
   *                 type: string
   *                 enum: ["India", "Dubai"]
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

      delete validatedData.holidayId;

      const holidayDetails = await holidayRepo.updateHoliday(
        req.params.id,
        validatedData
      );

      if (holidayDetails) {
        const holidayData = await HolidayResponse.format(holidayDetails);

        return res.status(200).json({
          status: true,
          message: "Holiday updated successfully.",
          data: holidayData,
        });
      } else {
        return res.status(404).json({
          status: false,
          message: "Holiday not found.",
          data: null,
        });
      }
    } catch (error) {
      if (error instanceof CustomValidationError) {
        return res.status(422).json({
          status: false,
          message: "Validation failed.",
          errors: error.errors,
        });
      }
      return res.status(500).json({
        status: false,
        message: "Failed to update holiday.",
        errors: error.message || error,
      });
    }
  }
}