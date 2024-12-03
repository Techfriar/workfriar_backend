import ProjectStatusReportRepository from "../../repositories/admin/project-status-report-repository.js";
import { AddProjectStatusReportRequest, UpdateProjectStatusReportRequest } from "../../requests/admin/project-status-report-request.js";
import ProjectStatusReportResponse from "../../responses/project-status-report.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";
const reportRepo = new ProjectStatusReportRepository();

export default class ProjectStatusReportController {
    /**
 * Add Project Status Report
 * 
 * @swagger
 * /project-status-report/add-report:
 *   post:
 *     tags:
 *       - Project Status Report
 *     summary: Add project status report
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_name:
 *                 type: string
 *                 description: ID of the project
 *               project_lead:
 *                 type: string
 *                 description: ID of the project lead
 *               planned_start_date:
 *                 type: string
 *                 format: date
 *                 description: Planned start date
 *               planned_end_date:
 *                 type: string
 *                 format: date
 *                 description: Planned end date
 *               actual_start_date:
 *                 type: string
 *                 format: date
 *                 description: Actual start date
 *               actual_end_date:
 *                 type: string
 *                 format: date
 *                 description: Actual end date (optional)
 *               reporting_period:
 *                 type: string
 *                 format: date
 *                 description: Reporting period date
 *               progress:
 *                 type: string
 *                 description: Current progress status
 *               comments:
 *                 type: string
 *                 description: Additional comments (optional)
 *               accomplishments:
 *                 type: string
 *                 description: Key accomplishments
 *               goals:
 *                 type: string
 *                 description: Goals for the next period
 *               blockers:
 *                 type: string
 *                 description: Blockers or challenges (optional)
 *     responses:
 *       200:
 *         description: Success
 *       422:
 *         description: Validation Error
 *       500:
 *         description: Internal Server Error
 */
    async addReport(req, res) {
        try {
            const validatedData = await new AddProjectStatusReportRequest(req).validate();
            const reportDetails = await reportRepo.addReport(validatedData);

            if (reportDetails) {
                const reportData = await ProjectStatusReportResponse.format(reportDetails);
                return res.status(200).json({
                    status: true,
                    message: "Status report added successfully.",
                    data: reportData,
                });
            } else {
                return res.status(422).json({
                    status: false,
                    message: "Failed to add status report.",
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
                message: "Failed to add status report.",
                errors: error.message || error,
            });
        }
    }

    /**
     * Get All Status Reports
     * 
     * @swagger
     * /project-status-report/list-report:
     *   post:
     *     tags:
     *       - Project Status Report
     *     summary: Get all status reports
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               page:
     *                 type: integer
     *                 description: Page number
     *               limit:
     *                 type: integer
     *                 description: Number of items per page
     *               status:
     *                 type: string
     *                 description: Filter by status
     *     responses:
     *       200:
     *         description: Success
     *       500:
     *         description: Internal Server Error
     */
    async getAllReports(req, res) {
        try {
            const reports = await reportRepo.getAllReports();
            const formattedReports = await Promise.all(
                reports.map(async (report) => await ProjectStatusReportResponse.format(report))
            );

            return res.status(200).json({
                status: true,
                message: "Status reports retrieved successfully.",
                data: { reports: formattedReports },
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: "Failed to retrieve status reports.",
                errors: error,
            });
        }
    }

    /**
     * Get Status Report By Id
     * 
     * @swagger
     * /project-status-report/get-report/{id}:
     *   post:
     *     tags:
     *       - Project Status Report
     *     summary: Get status report by id
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Status Report ID
     *     responses:
     *       200:
     *         description: Success
     *       404:
     *         description: Not Found
     *       500:
     *         description: Internal Server Error
     */
    async getReportById(req, res) {
        try {
            const report = await reportRepo.getReportById(req.params.id);
            if (!report) {
                return res.status(404).json({
                    status: false,
                    message: "Status report not found.",
                    data: null,
                });
            }

            const reportData = await ProjectStatusReportResponse.format(report);
            return res.status(200).json({
                status: true,
                message: "Status report retrieved successfully.",
                data: reportData,
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: "Failed to retrieve status report.",
                errors: error,
            });
        }
    }

/**
 * Update Status Report
 * 
 * @swagger
 * /project-status-report/update-report/{id}: 
 *   post:
 *     tags:
 *       - Project Status Report
 *     summary: Update status report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Status Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_name:
 *                 type: string
 *                 description: Project ID (ObjectId)
 *               project_lead:
 *                 type: string
 *                 description: Project lead ID (ObjectId)
 *               planned_start_date:
 *                 type: string
 *                 format: date
 *                 description: Planned start date of the project
 *               planned_end_date:
 *                 type: string
 *                 format: date
 *                 description: Planned end date of the project
 *               actual_start_date:
 *                 type: string
 *                 format: date
 *                 description: Actual start date of the project
 *               actual_end_date:
 *                 type: string
 *                 format: date
 *                 description: Actual end date of the project (optional)
 *               reporting_period:
 *                 type: string
 *                 format: date
 *                 description: Reporting period of the status report
 *               progress:
 *                 type: string
 *                 description: Updated progress status
 *               comments:
 *                 type: string
 *                 description: Updated comments (optional)
 *               accomplishments:
 *                 type: string
 *                 description: Updated accomplishments
 *               goals:
 *                 type: string
 *                 description: Updated goals
 *               blockers:
 *                 type: string
 *                 description: Updated blockers (optional)
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status of the operation
 *                 message:
 *                   type: string
 *                   description: Response message
 *                 data:
 *                   type: object
 *                   description: Updated project status report details
 *       404:
 *         description: Not Found
 *       422:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: object
 *                   description: Validation errors
 *       500:
 *         description: Internal Server Error
 */

    async updateReport(req, res) {
        try {
            const validatedData = await new UpdateProjectStatusReportRequest(req).validate();
            delete validatedData.reportId;

            const reportDetails = await reportRepo.updateReport(
                req.params.id,
                validatedData
            );

            if (reportDetails) {
                const reportData = await ProjectStatusReportResponse.format(reportDetails);
                return res.status(200).json({
                    status: true,
                    message: "Status report updated successfully.",
                    data: reportData,
                });
            } else {
                return res.status(404).json({
                    status: false,
                    message: "Status report not found.",
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
                message: "Failed to update status report.",
                errors: error.message || error,
            });
        }
    }

    /**
     * Delete Status Report
     * 
     * @swagger
     * /project-status-report/delete-report/{id}:
     *   post:
     *     tags:
     *       - Project Status Report
     *     summary: Delete status report
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Status Report ID
     *     responses:
     *       200:
     *         description: Success
     *       404:
     *         description: Not Found
     *       500:
     *         description: Internal Server Error
     */
    async deleteReport(req, res) {
        try {
            const report = await reportRepo.getReportById(req.params.id);
            if (!report) {
                return res.status(404).json({
                    status: false,
                    message: "Status report not found.",
                    data: null,
                });
            }

            await reportRepo.deleteReport(req.params.id);
            return res.status(200).json({
                status: true,
                message: "Status report deleted successfully.",
                data: null,
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: "Failed to delete status report.",
                errors: error,
            });
        }
    }
}