class TimesheetResponse{
        /**
     * Transform the timesheet resource into an object.
     *
     * @param {Object} timesheet - The timesheet object with project details to transform.
     * @return {Object} - An object containing selected properties from the client.
     */
    async currentDateTimesheetResponse(timesheet){
        let project = timesheet.project_details  
        return{
            projectId: timesheet.project_id,
            projectName: project.projectName || '',
            hours: timesheet.total_hours
        }
    }
}

export default TimesheetResponse