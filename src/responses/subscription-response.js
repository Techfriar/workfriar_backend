export default class SubscriptionResponse {
  /**
   *
   * @param {Object} subscription
   * @param {Object}
   */

  static async formatGetByIdSubscriptionResponse(subscription) {
    return {
      id: subscription._id,
      subscription_name: subscription.subscription_name,
      provider: subscription.provider,
      description: subscription.description,
      license_count: subscription.license_count,
      cost: subscription.cost,
      billing_cycle: subscription.billing_cycle,
      currency: subscription.currency,
      payment_method: subscription.payment_method,
      next_due_date: subscription.next_due_date,
      status: subscription.status,
      type: subscription.type,
      project_name: subscription.project_name
        ? {
            id: subscription.project_name._id,
            name: subscription.project_name.project_name,
          }
        : null,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
  static async formatGetAllSubscriptionResponse(subscription) {
    return {
      id: subscription._id,
      subscription_name: subscription.subscription_name,
      provider: subscription.provider,
      license_count: subscription.license_count,
      cost: subscription.cost,
      billing_cycle: subscription.billing_cycle,
      next_due_date: subscription.next_due_date,
      status: subscription.status,
      type: subscription.type,
      project_name: subscription.project_name
        ? {
            id: subscription.project_name._id,
            name: subscription.project_name.project_name,
          }
        : null,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}
