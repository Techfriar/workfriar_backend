class TimesheetResponse{
        /**
     * Transform the timesheet resource into an object.
     *
     * @param {Object} timesheet - The timesheet object with project details to transform.
     * @return {Object} - An object containing selected properties from the client.
     */
    async currentDateTimesheetResponse(timesheet){
        return{
            project_id: timesheet.project_id,
            project_name: timesheet.project_name || '',
            hours: timesheet.total_hours
        }
    }

    async weeklyTimesheetResponse(timesheet){
        return{
            timesheet_id: timesheet._id,
            project_name: timesheet.project_id.project_name,
            category_name: timesheet.task_category_id.category,
            task_detail: timesheet.task_detail,
            data_sheet: timesheet.data_sheet,
            total_hours: timesheet.totalHours,
            status:timesheet.status
        }
    }

    async projectSummaryTimesheetResponse(report,month,year){
        return{    
            project_name: report.project_name,
            logged_hours: report.loggedHours,
            approved_hours: report.approvedHours,
            year,
            month

        }
    }

    async projectDetailTimesheetResponse(report,month,year,range){
        return{
            date_range:range,
            year,
            month,
            project_name: report.project_name,
            logged_hours: report.loggedHours,
            approved_hours: report.approvedHours,
        }
    }

    async employeeSummaryTimesheetResponse(report,month,year){
        const data = report.projects.map(project => ({
            year,
            month,
            employee: report._id,
            project_name: project.project_name,
            logged_hours: project.loggedHours,
            approved_hours: project.approvedHours,
        }));
        
        return data;
    }

    async employeeDetailTimesheetResponse(report,month,year,range){
        const data = report.projects.map(project => ({
            date_range: range,
            year,
            month,
            employee: report._id,
            project_name: project.project_name,
            logged_hours: project.loggedHours,
            approved_hours: project.approvedHours,
        }));
        
        return data;
    }

    

}

export default TimesheetResponse