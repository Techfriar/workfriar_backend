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
      clientName: capitalizeWords(project.clientName),
      projectName: project.projectName,
      description: project.description,
      plannedStartDate: project.plannedStartDate,
      plannedEndDate: project.plannedEndDate,
      actualStartDate: project.actualStartDate,
      actualEndDate: project.actualEndDate,
      projectLead: project.projectLead,
      billingModel: project.billingModel,
      projectLogo: generateFileUrl(project.projectLogo),
      openForTimeEntry: project.openForTimeEntry,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
