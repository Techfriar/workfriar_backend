class TimesheetResponse{
        /**
     * Transform the timesheet resource into an object.
     *
     * @param {Object} timesheet - The timesheet object with project details to transform.
     * @return {Object} - An object containing selected properties from the client.
     */
    async currentDateTimesheetResponse(timesheet){
        // {
        //     "_id": "67480cc6892b9268a9637439",
        //     "total_hours": 2,
        //     "entries": [
        //       {
        //         "date": "2024-12-04T00:00:00.000Z",
        //         "hours": 2
        //       }
        //     ],
        //     "project_id": "67480cc6892b9268a9637439",
        //     "projectName": "Danti Deals"
        //   }
        return{
            projectId: timesheet.project_id,
            projectName: timesheet.projectName || '',
            hours: timesheet.total_hours
        }
    }

    async weeklyTimesheetResponse(timesheet){
        return{
            timesheetId: timesheet._id,
            projectName: timesheet.project_id.projectName,
            categoryName: timesheet.task_category_id.category,
            taskDetail: timesheet.task_detail,
            dataSheet: timesheet.data_sheet,
            totalHours: timesheet.totalHours,
            status:timesheet.status
        }
    }

    async projectSummaryTimesheetResponse(report,month,year){
        return{
            projectName: report.projectName,
            year,
            month,
            loggedHours: report.loggedHours,
            approvedHours: report.approvedHours
        }
    }

    async projectDetailTimesheetResponse(report,month,year,startDate,endDate){
        return{
            dateRange:`${startDate}-${endDate}`,
            projectName: report.projectName,
            year,
            month,
            loggedHours: report.loggedHours,
            approvedHours: report.approvedHours
        }
    }

    async employeeSummaryTimesheetResponse(report,month,year){
        return{
            employee: report._id,
            year,
            month,
            projects: report.projects.map(item => ({
                projectName:item.projectName,
                loggedHours: item.loggedHours,
                approvedHours: item.approvedHours,
            }))
        }
    }

    

}

export default TimesheetResponse