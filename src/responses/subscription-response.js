import SubscriptionRepository from "../repositories/admin/subscription-repository.js";
import moment from "moment";
import getCurrencySymbol from "../utils/currency-to-symbol.js";


export default class SubscriptionResponse {
  static formatDate(date) {
    if (!date) return null;
    return moment(date).format("DD/MMM/YYYY");
  }

  static formatCostWithCurrency(cost, currency) {
    return `${currency} ${cost}`;
  }

  static formatCostWithCurrencySymbol(cost, currency) {
    const symbol = getCurrencySymbol(currency);
    return symbol ? `${symbol} ${cost}` : `${currency} ${cost}`;
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

      const iconDoc = await this.subscriptionRepo.getSubscriptionIcon(
        subscription.provider,
        subscription.subscription_name
      );

      const formattedResponse = {
        id: subscription._id,
        subscription_name: subscription.subscription_name,
        provider: subscription.provider,
        description: subscription.description || null,
        license_count: subscription.license_count,
        cost: this.formatCostWithCurrency(subscription.cost, subscription.currency),
        billing_cycle: subscription.billing_cycle,
        currency: subscription.currency,
        payment_method: subscription.payment_method,
        next_due_date: this.formatDate(subscription.next_due_date || null),
        status: subscription.status,
        type: subscription.type,
        project_names: subscription.project_names
          ? subscription.project_names.map(project => ({
              id: project._id,
              name: project.project_name,
            }))
          : [],
        icon: iconDoc ? iconDoc.url : null,
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

      const iconDoc = await this.subscriptionRepo.getSubscriptionIcon(
        subscription.provider, 
        subscription.subscription_name
      );

      const formattedResponse = {
        id: subscription._id,
        subscription_name: subscription.subscription_name,
        license_count: subscription.license_count,
        cost: this.formatCostWithCurrency(subscription.cost, subscription.currency),
        billing_cycle: subscription.billing_cycle,
        next_due_date: this.formatDate(subscription.next_due_date || null),
        status: subscription.status,
        icon: iconDoc ? iconDoc.url : null,
      };

      return formattedResponse;
    } catch (error) {
      throw new Error(
        `Error formatting subscription response: ${error.message}`
      );
    }
  }


  static async formatGetSubscriptionManagerResponse(subscription){
    try {
      if (!subscription) {
        throw new Error("Subscription not found");
      }

      const iconDoc = await this.subscriptionRepo.getSubscriptionIcon(
        subscription.provider,
        subscription.subscription_name
      );

      const formattedResponse = {
        id: subscription._id,
        subscription_name: subscription.subscription_name,
        cost: this.formatCostWithCurrencySymbol(subscription.cost, subscription.currency),
        next_due_date: this.formatDate(subscription.next_due_date || null),
        icon: iconDoc ? iconDoc.url : null,
      };

      return formattedResponse;
    } catch (error) {
      throw new Error(
        `Error formatting subscription response: ${error.message}`
      );
    }
}
}