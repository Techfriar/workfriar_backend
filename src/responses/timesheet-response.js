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
            project_name: timesheet.projectName || '',
            hours: timesheet.total_hours
        }
    }

    async weeklyTimesheetResponse(timesheet){
        return{
            timesheet_id: timesheet._id,
            project_name: timesheet.project_id.projectName,
            category_name: timesheet.task_category_id.category,
            task_detail: timesheet.task_detail,
            data_sheet: timesheet.data_sheet,
            total_hours: timesheet.totalHours,
            status:timesheet.status
        }
    }

    async projectSummaryTimesheetResponse(report,month,year){
        return{
            project_name: report.projectName,
            year,
            month,
            logged_hours: report.loggedHours,
            approved_hours: report.approvedHours
        }
    }

    async projectDetailTimesheetResponse(report,month,year,startDate,endDate){
        return{
            date_range:`${startDate}-${endDate}`,
            project_name: report.projectName,
            year,
            month,
            logged_hours: report.loggedHours,
            approved_hours: report.approvedHours
        }
    }

    async employeeSummaryTimesheetResponse(report,month,year,range){
        return{
            date_range: range,
            employee: report._id,
            year,
            month,
            projects: report.projects.map(item => ({
                project_name:item.projectName,
                logged_hours: item.loggedHours,
                approved_hours: item.approvedHours,
            }))
        }
    }

    

}

export default TimesheetResponse