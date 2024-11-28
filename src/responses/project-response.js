import capitalizeWords from "../utils/capitalizeWords.js";
import { generateFileUrl } from "../utils/generateFileUrl.js";

export default class ProjectResponse {
  /**
   * Transform the project resource into an object.
   * @param {Object} project - The project object to transform
   * @return {Object} - Formatted project object
   */
  static async format(project) {
    return {
      id: project._id,
      client_name: capitalizeWords(project.client_name),
      project_name: project.project_name,
      description: project.description,
      planned_start_date: project.planned_start_date,
      planned_end_date: project.planned_end_date,
      actual_start_date: project.actual_start_date,
      actual_end_date: project.actual_end_date,
      project_lead: project.project_lead,
      billing_model: project.billing_model,
      project_logo: generateFileUrl(project.project_logo),
      open_for_time_entry: project.open_for_time_entry,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
