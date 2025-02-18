import adminRouter from "./admin.js";
import projectStatusRouter from "./project-status-report.js";
import projectRouter from "./project.js";
import userRouter from "./user.js";
import authRouter from "./auth.js";
import timesheetRouter from "./timesheet.js";
import { authenticateEmployee } from "../middlewares/authenticate-employee.js";
import { authenticateAdmin } from "../middlewares/authenticate-admin.js";
import holidayRouter from "./holiday.js";
import subscriptionRouter from "./subscription.js";
import transactionRouter from "./transaction.js";

//  import employeeRouter from './employee.js'

const configureRoutes = (app) => {
  // app.get('/',(req, res)=>res.status(200).json("Routes are good ..."))
  app.use("/api/auth", authRouter);
  app.use("/api/admin", authenticateAdmin, adminRouter); // Admin API routes
  app.use("/api/user", authenticateEmployee, userRouter); // Customer API routes
  app.use("/api/project", authenticateEmployee,projectRouter);
  app.use("/api/project-status-report", authenticateAdmin,projectStatusRouter);
  app.use("/api/holiday", authenticateEmployee,holidayRouter);
  app.use("/api/timesheet", authenticateEmployee, timesheetRouter);
  app.use("/api/subscription", authenticateAdmin,subscriptionRouter);
  app.use("/api/transaction", authenticateAdmin,transactionRouter);
}; 

export default configureRoutes;