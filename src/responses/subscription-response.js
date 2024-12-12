import SubscriptionRepository from "../repositories/admin/subscription-repository.js";
import moment from "moment";

export default class SubscriptionResponse {

  static formatDate(date) {
    if (!date) return null;
    return moment(date).format("DD/MM/YYYY");
  }

  static subscriptionRepo = new SubscriptionRepository();

  /**
   * Format response for getting subscription by ID
   * @param {Object} subscription - Subscription document
   * @returns {Promise<Object>} Formatted subscription response
   */
  static async formatGetByIdSubscriptionResponse(subscription) {
    try {
      if (!subscription) {
        throw new Error("Subscription not found");
      }

      const formattedResponse = {
        id: subscription._id,
        subscription_name: subscription.subscription_name,
        provider: subscription.provider,
        description: subscription.description || null,
        license_count: subscription.license_count,
        cost: subscription.cost,
        billing_cycle: subscription.billing_cycle,
        currency: subscription.currency,
        payment_method: subscription.payment_method,
        next_due_date: this.formatDate(subscription.next_due_date || null),
        status: subscription.status,
        type: subscription.type,
        project_name: subscription.project_name
          ? {
              id: subscription.project_name._id,
              name: subscription.project_name.project_name,
            }
          : null,
          icon: subscription.icon
          ? typeof subscription.icon === "string"
            ? subscription.icon
            : `data:image/png;base64,${subscription.icon}`
          : null,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      };

      return formattedResponse;
    } catch (error) {
      throw new Error(
        `Error formatting subscription response: ${error.message}`
      );
    }
  }

  /**
   * Format response for getting all subscriptions
   * @param {Object} subscription - Subscription document
   * @returns {Promise<Object>} Formatted subscription response
   */
  static async formatGetAllSubscriptionResponse(subscription) {
    try {
      if (!subscription) {
        throw new Error("Subscription not found");
      }
      const formattedResponse = {
        id: subscription._id,
        subscription_name: subscription.subscription_name,
        provider: subscription.provider,
        description: subscription.description || null,
        license_count: subscription.license_count,
        cost: subscription.cost,
        billing_cycle: subscription.billing_cycle,
        currency: subscription.currency,
        payment_method: subscription.payment_method,
        next_due_date: this.formatDate(subscription.next_due_date || null),
        status: subscription.status,
        type: subscription.type,
        project_name: subscription.project_name
          ? {
              id: subscription.project_name._id,
              name: subscription.project_name.project_name,
            }
          : null,
          icon: subscription.icon
          ? typeof subscription.icon === "string"
            ? subscription.icon
            : `data:image/png;base64,${subscription.icon}`
          : null,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      };

      return formattedResponse;
    } catch (error) {
      throw new Error(
        `Error formatting subscription response: ${error.message}`
      );
    }
  }
}
