import { CustomValidationError } from "../../exceptions/custom-validation-error.js";
import SubscriptionRepository from "../../repositories/admin/subscription-repository.js";
import AddSubscriptionRequest from "../../requests/admin/add-subscription-request.js";
import UpdateSubscriptionRequest from "../../requests/admin/update-subscription-request.js";
import SubscriptionResponse from "../../responses/subscription-response.js";

const subscriptionRepo = new SubscriptionRepository();

export default class SubscriptionController {
  /**
   * Add Subscription
   *
   * @swagger
   * /subscription/add:
   *   post:
   *     tags:
   *       - Subscription
   *     summary: Add subscription
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               subscription_name:
   *                 type: string
   *                 description: Enter subscription name
   *               provider:
   *                 type: string
   *                 description: Enter provider
   *               description:
   *                 type: string
   *                 description: Enter description
   *               license_count:
   *                 type: string
   *                 description: Enter license count
   *               cost:
   *                 type: string
   *                 description: Enter cost
   *               billing_cycle:
   *                 type: string
   *                 description: Enter billing cycle
   *               next_due_date:
   *                 type: string
   *                 format: date
   *                 description: Enter next due date
   *               currency:
   *                 type: string
   *                 description: Enter currency
   *               payment_method:
   *                 type: string
   *                 description: Enter payment method
   *               status:
   *                 type: string
   *                 description: Enter status
   *               type:
   *                 type: string
   *                 enum: ["Common", "Project Specific"]
   *                 description: Select subscription type
   *               project_name:
   *                 type: string
   *                 description: Project ID (required if type is Project Specific)
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
  async addSubscription(req, res) {
    try {
      const validatedData = await new AddSubscriptionRequest(req).validate();
      const subscriptionDetails = await subscriptionRepo.addSubscription(
        validatedData
      );
      if (subscriptionDetails) {
        const subscriptionData =
          await SubscriptionResponse.formatGetAllSubscriptionResponse(
            subscriptionDetails
          );

        return res.status(200).json({
          status: true,
          message: "Subscription added successfully.",
          data: subscriptionData,
        });
      } else {
        return res.status(422).json({
          status: false,
          message: "Failed to add subscription.",
          data: [],
        });
      }
    } catch (error) {
      if (error instanceof CustomValidationError) {
        return res.status(422).json({
          status: false,
          message: "Validation failed.",
          errors: error.errors,
        });
      }
      return res.status(500).json({
        status: false,
        message: "Failed to add subscription.",
        errors: error.message || error,
      });
    }
  }

  /**
   * Get all subscriptions
   *
   * @swagger
   * /subscription/list:
   *   post:
   *     tags:
   *       - Subscription
   *     summary: Get all subscriptions
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
  async getAllSubscriptions(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;

      const { subscriptions, total } =
        await subscriptionRepo.getAllSubscriptions(page, limit);

      const formattedSubscriptions = await Promise.all(
        subscriptions.map(
          async (subscription) =>
            await SubscriptionResponse.formatGetAllSubscriptionResponse(
              subscription
            )
        )
      );
      return res.status(200).json({
        status: true,
        message: "Subscriptions retrieved successfully.",
        data: {
          subscriptions: formattedSubscriptions,
          pagination: {
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            perPage: limit,
          },
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Failed to retrieve subscriptions.",
        errors: error.message || error,
      });
    }
  }

  /**
   * Get Subscription By Id
   *
   * @swagger
   * /subscription/get/{id}:
   *   post:
   *     tags:
   *       - Subscription
   *     summary: Get subscription by id
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Subscription ID
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
  async getSubscriptionById(req, res) {
    try {
      const subscription = await subscriptionRepo.getSubscriptionById(
        req.params.id
      );

      if (!subscription) {
        return res.status(404).json({
          status: false,
          message: "Subscription not found.",
          data: null,
        });
      }

      const subscriptionData =
        await SubscriptionResponse.formatGetByIdSubscriptionResponse(
          subscription
        );

      return res.status(200).json({
        status: true,
        message: "Subscription retrieved successfully.",
        data: subscriptionData,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Failed to retrieve subscription.",
        errors: {
          details: error.message || "Unknown error occurred",
          code: error.code || "UNKNOWN_ERROR",
        },
      });
    }
  }
  /**
   * Update Subscription
   *
   * @swagger
   * /subscription/update/{id}:
   *   post:
   *     tags:
   *       - Subscription
   *     summary: Update subscription
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Subscription ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               subscription_name:
   *                 type: string
   *                 description: Enter subscription name
   *               provider:
   *                 type: string
   *                 description: Enter provider
   *               license_count:
   *                 type: string
   *                 description: Enter license count
   *               cost:
   *                 type: string
   *                 description: Enter cost
   *               billing_cycle:
   *                 type: string
   *                 description: Enter billing cycle
   *               next_due_date:
   *                 type: string
   *                 format: date
   *                 description: Enter next due date
   *               status:
   *                 type: string
   *                 description: Enter status
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
  async updateSubscription(req, res) {
    try {
      const validatedData = await new UpdateSubscriptionRequest(req).validate();
      const subscriptionDetails = await subscriptionRepo.updateSubscription(
        req.params.id,
        validatedData
      );

      if (subscriptionDetails) {
        const subscriptionData =
          await SubscriptionResponse.formatGetByIdSubscriptionResponse(
            subscriptionDetails
          );

        return res.status(200).json({
          status: true,
          message: "Subscription updated successfully.",
          data: subscriptionData,
        });
      } else {
        return res.status(404).json({
          status: false,
          message: "Subscription not found.",
          data: null,
        });
      }
    } catch (error) {
      if (error instanceof CustomValidationError) {
        return res.status(422).json({
          status: false,
          message: "Validation failed.",
          errors: error.errors,
        });
      }
      return res.status(500).json({
        status: false,
        message: "Failed to update subscription.",
        errors: error.message || error,
      });
    }
  }

  /**
   * Delete Subscription
   *
   * @swagger
   * /subscription/delete/{id}:
   *  post:
   *    tags:
   *      - Subscription
   *    summary: Delete subscription
   *    security:
   *      - bearerAuth: []
   *    parameters:
   *      - in: path
   *        name: id
   *        required: true
   *        schema:
   *          type: string
   *        description: Subscription ID
   *    responses:
   *      200:
   *        description: Success
   *      404:
   *        description: Not Found
   *      500:
   *        description: Internal Server Error
   */

  async deleteSubscription(req, res) {
    try {
      const subscription = await subscriptionRepo.getSubscriptionById(
        req.params.id
      );

      if (!subscription) {
        return res.status(404).json({
          status: false,
          message: "Subscription not found",
          data: null,
        });
      }
      await subscriptionRepo.deleteSubscription(req.params.id);

      return res.status(200).json({
        status: true,
        message: "Subscription deleted successfully",
        data: null,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Failed to delete subscription.",
        errors: error,
      });
    }
  }
}
