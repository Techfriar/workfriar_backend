import Subscription from "../../models/admin/subscriptions.js";
import dotenv from "dotenv";
import Icon from "../../models/admin/icons.js";

dotenv.config();

export default class SubscriptionRepository {

  /**
   * Fetch subscription icon from Brandfetch API
   * @param {string} subscriptionName - Name of the subscription
   * @return {Promise<Object|null>} Icon data or null
   */
  async getSubscriptionIcon(provider, subscription_name) {
    try {
      const slug = this.createSlug(subscription_name);
      
      const existingIcon = await Icon.findOne({ 
        slug: slug, 
        provider: provider 
      });
  
      if (existingIcon) {
        return { url: existingIcon.iconUrl };
      }
  
      const normalizedName = provider.replace("https://", "");
    
      const options = {
        method: "GET",
        headers: { Authorization: `Bearer ${process.env.BRANDFETCH_API_KEY}` },
      };
    
      const response = await fetch(
        `https://api.brandfetch.io/v2/brands/${normalizedName}`,
        options
      );
    
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    
      const data = await response.json();
      
      const darkLogo = data.logos?.find(logo => 
        logo.theme === 'dark' && 
        logo.type === 'icon' && 
        logo.formats?.length > 0
      );
  
      const iconUrl = darkLogo 
        ? darkLogo.formats[0].src 
        : (
            data.logos?.[0]?.formats?.[0]?.src || 
            data.images?.[0]?.formats?.[0]?.src || 
            null
          );
      
      if (iconUrl) {
        const newIcon = new Icon({
          slug: slug,
          iconUrl: iconUrl,
          provider: provider
        });
        await newIcon.save();
  
        return { url: iconUrl };
      }
  
      return null;
    } catch (error) {
      console.error(`Error fetching icon for ${subscription_name}:`, error.message);
      return null;
    }
  }
  createSlug(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/\s+/g, '-')      // Replace spaces with -
      .replace(/--+/g, '-')      // Replace multiple - with single -
      .trim();                   // Trim leading/trailing spaces
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
 * @return {Promise<{subscriptions: Object[], total: number}>}
 */
async getAllSubscriptions(page, limit) {
  try {
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      Subscription.find()
        .populate("project_names", "project_name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Subscription.countDocuments(),
    ]);

    const subscriptionsWithIcons = await Promise.all(
      subscriptions.map(async (subscription) => {
        const iconDoc = await this.getSubscriptionIcon(
          subscription.provider, 
          subscription.subscription_name
        );
        
        return {
          ...subscription.toObject(),
          icon: iconDoc ? iconDoc.url : null,
        };
      })
    );

    return { subscriptions: subscriptionsWithIcons, total };
  } catch (error) {
    throw new Error(`Error fetching subscriptions: ${error.message}`);
  }
}

/**
 * Get subscription by id
 * @param {String} subscriptionId - The subscription id
 * @return {Promise<Object>} - The subscription with icon
 */
async getSubscriptionById(subscriptionId) {
  try {
    const subscription = await Subscription.findById(subscriptionId).populate({
      path: "project_names",
      select: "project_name -_id",
  })

    if (!subscription) {
      throw new Error(`Subscription with ID ${subscriptionId} not found`);
    }

    const iconDoc = await this.getSubscriptionIcon(
      subscription.provider,
      subscription.subscription_name
    );

    return {
      ...subscription.toObject(),
      icon: iconDoc ? iconDoc.url : null,
    };
  } catch (error) {
    throw new Error(`Error fetching subscription by ID: ${error.message}`);
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
   * Get subscriptions categorized by renewal status
   * @param {number} page - Current page number
   * @param {number} limit - Number of items per page
   * @return {Promise<Object>} - Categorized subscriptions with pagination
   */
  async getRenewalSubscriptions(page,limit){
    try{
      const skip = (page - 1) * limit;
      const today = new Date();

      const subscriptions = await Subscription.find({
        status: "Active",
        next_due_date: {$exists: true, $ne: null}
      })
      .populate("project_names", "project_name")
      .sort({ next_due_date: 1 });

      const categorizedSubs = subscriptions.reduce((acc, sub) => {
        const dueDate = new Date(sub.next_due_date);
        const daysDifference = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        if(daysDifference < 0){
          acc.overdue.push(sub);
        }else if(daysDifference <= 30){
          acc.upcoming.push(sub);
        }else{
          acc.active.push(sub);
        }
        return acc;
      },{overdue: [], upcoming: [], active: []});

      const paginatedCategory = (items) => {
        const total = items.length;
        return{
          items: items.slice(skip, skip + limit),
          total,
          totalPages: Math.ceil(total / limit)
        };
      };

      const addIconsToSubscriptions = async(subscriptions)=>{
        return Promise.all(subscriptions.map(async(subscription)=>{
          const iconDoc = await this.getSubscriptionIcon(subscription.provider);
          return {
            ...subscription.toObject(),
            icon: iconDoc ? iconDoc.url : null
          };
        }));
      };

      const [overdueWithIcons, upcomingWithIcons, activeWithIcons] = await Promise.all([
        addIconsToSubscriptions(categorizedSubs.overdue),
        addIconsToSubscriptions(categorizedSubs.upcoming),
        addIconsToSubscriptions(categorizedSubs.active)
      ]);

      return{
        overdue: paginatedCategory(overdueWithIcons),
        upcoming: paginatedCategory(upcomingWithIcons),
        active: paginatedCategory(activeWithIcons)
      };
    }catch(error){
      throw new Error(`Error in getRenewalSubscriptions:${error.message}`);
    }
  }

  /**
   *
   * @param {String} subscription_name
   * @return {Promise<Subscription>}
   */
  async checkSubscriptionExists(subscription_name) {
    try {

      const subscription = await Subscription.findOne({
        subscription_name: subscription_name,
      });

      return subscription;
    } catch (error) {
      console.error("Error in checkSubscriptionExists:", error);
      throw new Error(`Error checking subscription:${error.message}`);
    }
  }
}
