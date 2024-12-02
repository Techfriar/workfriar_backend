import Timesheet from "../../models/timesheet.js";
import Project from "../../models/projects.js";
class UpdateStatusRequest{

    async timeSheetValidation(projectId)
    {
            try {
                const totalTimesheets = await Timesheet.countDocuments({ project_id: projectId });
                const notApprovedCount = await Timesheet.countDocuments({
                    project_id: projectId,
                    status: { $ne: "accepted" },
                });
                if (notApprovedCount > 0) {
                    return {
                        success: false,
                        message: `${notApprovedCount} timesheet(s) are not Accepted.`
                    };
                }
                return {
                    success: true,
                };
            } catch (error) {
                throw new Error(`Error checking timesheet status: ${error.message}`);
            }
        }
        async validateTimeEntry(projectId, timeEntry) {
            try {
                const record = await Project.findOne({ _id: projectId });
                if (!record) {
                    return {
                        status: false,
                        message: `Project with ID ${projectId} not found`,
                    };
                }
                if (timeEntry === "closed") {
                    if (!["Cancelled", "Completed", "On hold"].includes(record.status)) {
                        return {
                            status: false,
                            message: `Cannot close time entry. Project status must be one of "Cancelled", "Completed", or "On hold".`,
                        };
                    }
                } else if (timeEntry !== "opened") {
                    return {
                        status: false,
                        message: `Invalid timeEntry value. Accepted values are "opened" or "closed".`,
                    };
                }
                return {
                    status: true,
                    message: `Validation successful.`,
                };
            } catch (error) {
                throw new Error("Error validating project time entry");
            }
        }
        
}
export default UpdateStatusRequest