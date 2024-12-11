import { generateFileUrl } from "../utils/generateFileUrl.js";
import moment from "moment";

export default class ProjectResponse {
  
  static formatDate(date) {
    if (!date) return null;
    return moment(date).format("DD/MM/YYYY");
  }
  
  /**
   * Transform the project resource into an object.
   * @param {Object} project - The project object to transform
   * @return {Object} - Formatted project object
   */
  static async formatGetByIdProjectResponse(project) {
    return {
      id: project._id,
      client_name: project.client_name,
      project_name: project.project_name,
      description: project.description,
      planned_start_date: this.formatDate(project.planned_start_date),
      planned_end_date: this.formatDate(project.planned_end_date),
      actual_start_date: this.formatDate(project.actual_start_date),
      actual_end_date: this.formatDate(project.actual_end_date),
      project_lead: project.project_lead,
      billing_model: project.billing_model,
      project_logo: generateFileUrl(project.project_logo),
      open_for_time_entry: project.open_for_time_entry,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
  static async formatGetAllProjectResponse(project) {
    return {
      id: project._id,
      client_name: project.client_name,
      project_name: project.project_name,
      actual_start_date: this.formatDate(project.actual_start_date),
      actual_end_date: this.formatDate(project.actual_end_date),
      project_lead: project.project_lead,
      open_for_time_entry: project.open_for_time_entry,
      status: project.status,
    };
  }
}
