import Subscription from "../../models/admin/subscriptions.js";

export default class SubscriptionRepository {
  /**
   * get icon for corresponding subscription
   */

  async getSubscriptionIcon(subscriptionName) {
    try {
      const slug = SubscriptionIcon.normalizeSubscriptionName(subscriptionName);
      return await SubscriptionIcon.findOne({ slug });
    } catch (error) {
      console.error("Error fetching subscription icon:", error);
      return null;
    }
  }

  /**
   * add a new subscription
   * @param {Object} subscriptionData - The subscription data
   * @return {Promise<Subscription>} - The created subscription
   */
  async addSubscription(subscriptionData) {
    try {
      const subscription = new Subscription(subscriptionData);
      return await subscription.save();
    } catch (error) {
      throw new Error(`Error adding subscription:${error.message}`);
    }
  }

  /**
   * Get all subscriptions with pagination
   * @param {number} page - Current page number
   * @param {number} limit - Number of items per page
   * @return {Promise<{subscriptions: Subscription[], total: number}>}
   */
  async getAllSubscriptions(page, limit) {
    try {
      const skip = (page - 1) * limit;

      const [subscriptions, total] = await Promise.all([
        Subscription.find()
          .populate('project_name', 'project_name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Subscription.countDocuments(),
      ]);

      const subscriptionsWithIcons = await Promise.all(
        subscriptions.map(async (subscription) => {
          const iconDoc = await this.getSubscriptionIcon(subscription.subscription_name);
          const icon = iconDoc?{
            data: iconDoc.icon.toString('base64'),
            contentType: iconDoc.contentType
          }:null;
          return {
            ...subscription.toObject(),
            icon
          };
        })
      );

      return { subscriptions, subscriptionsWithIcons, total };
    } catch (error) {
      throw new Error(`Error fetching subscriptions: ${error.message}`);
    }
  }

  /**
 * Get subscription by id
 * @param {String} subscriptionId - The subscription id
 * @return {Promise<Subscription>} - The subscription
 */
async getSubscriptionById(subscriptionId) {
  try {
    const subscription = await Subscription.findById(subscriptionId)
      .populate('project_name', 'project_name');
    if (!subscription) {
      throw new Error(`Subscription with ID ${subscriptionId} not found`);
    }

    const iconDoc = await this.getSubscriptionIcon(subscription.subscription_name);
    const icon = iconDoc ? {
      data: iconDoc.icon.toString('base64'),
      contentType: iconDoc.contentType
    } : null;

    return {
      ...subscription.toObject(),
      icon
    };
    
  } catch (error) {
    throw new Error(`Error fetching subscription by ID:${error.message}`);
  }
}

  /**
   * Update subscription
   * @param {String} subscriptionId - The subscription id
   * @param {Object} subscriptionData - The updated subscription data
   * @return {Promise<Subscription>} - The updated subscription
   */
  async updateSubscription(subscriptionId, subscriptionData) {
    try {
      return await Subscription.findByIdAndUpdate(
        subscriptionId,
        subscriptionData,
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error updating subscription:${error.message}`);
    }
  }

  /**
   * Delete subscription
   * @param {String} subscriptionId - The subscription id
   * @return {Promise<Subscription>} - The deleted subscription
   */
  async deleteSubscription(subscriptionId) {
    try {
      return await Subscription.findByIdAndDelete(subscriptionId);
    } catch (error) {
      throw new Error(`Error deleting subscription:${error.message}`);
    }
  }

  /**
   *
   * @param {String} subscription_name
   * @return {Promise<Subscription>}
   */
  async checkSubscriptionExists(subscription_name) {
    try {
      console.log("Checking subscription existence:", subscription_name);
      const subscription = await Subscription.findOne({
        subscription_name: subscription_name,
      });
      console.log("Found subscription:", subscription);
      return subscription;
    } catch (error) {
      console.error("Error in checkSubscriptionExists:", error);
      throw new Error(`Error checking subscription:${error.message}`);
    }
  }
}
