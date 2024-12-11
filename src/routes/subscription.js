import express from "express";
import {
  checkPermissions,
} from "../middlewares/check-permission.js";
import SubscriptionController from "../controllers/admin/subscription-controller.js";

const subscriptionRouter = express.Router();

const subscription = new SubscriptionController();

subscriptionRouter
  .route("/add")
  .post(
    subscription.addSubscription
  );

  subscriptionRouter
  .route("/list")
  .post(
    subscription.getAllSubscriptions
  );
  subscriptionRouter
  .route("/get/:id")
  .post(
    subscription.getSubscriptionById
  );
  subscriptionRouter
  .route("/update/:id")
  .post(
    subscription.updateSubscription
  );
  subscriptionRouter
  .route("/delete/:id")
  .post(
    subscription.deleteSubscription
  );

export default subscriptionRouter;
