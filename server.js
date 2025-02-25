import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { dbErrorHandler } from "./src/middlewares/db-error-handler.js";
import { requestNotFoundCheck } from "./src/middlewares/request-not-found-check.js";
import connectDB from "./src/config/db.js";
import swagger from "./src/config/swagger.js";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import configureRoutes from "./src/routes/routes.js";
import seedCountries from "./src/seeders/CountrySeeder.js";
import seedCurrencies from "./src/seeders/CurrencySeeder.js";
import seedSuperAdmin from "./src/seeders/SuperAdminSeeder.js"

dotenv.config();

const allowedOrigins = [
  "http://admin.workfriar.techfriar.xyz",
  "https://admin.workfriar.techfriar.xyz",
  "http://admin.workfriar.techfriar.xyz/",
  "https://admin.workfriar.techfriar.xyz/",
  "https://workfriar.techfriar.xyz",
  "https://workfriar.techfriar.xyz/",
  process.env.USER_FRONT_END_URL.replace(/\/$/, ""),
  process.env.ADMIN_FRONT_END_URL.replace(/\/$/, ""),
];

// Create Express app
const app = express();
// Use the cors() middleware to enable CORS support
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies to be sent and received
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","HEAD"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Use cookie-parser middleware
app.use(cookieParser());

// Set the port and hostname for the server
const port = process.env.PORT || 3002;
const hostname = process.env.HOST || "localhost";

/**
 * Use Morgan for HTTP request and response logging
 * In a production environment, "combined" or "common" might be more suitable for comprehensive logging while serving requests.
 **/
app.use(morgan(process.env.LOGGING_FORMAT || "dev"));

// Set view engine to 'ejs'
app.set("view engine", "ejs");

// Set view path
app.set("views", "./src/views");

// Import MongoDB connection and establish the database connection
connectDB()
  .then(() => {
    // seedUsers();
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Middleware to handle JSON data only for a specific route
app.use(bodyParser.json());
// Set up middleware to parse incoming JSON and urlencoded data
app.use(express.urlencoded({ extended: false }));

/**
 * Set up Express session for handling user sessions.
 * By configuring resave and saveUninitialized as false,
 * the middleware ensures that sessions are only created and saved when necessary,
 * optimizing server resources and improving security by not storing unused or unchanged session data.
 * The secret option is crucial for signing session IDs to prevent tampering or unauthorized access to session data.
 */
app.use(
  session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: process.env.SESSION_SECRET || "workfriarasesecret", // secret used to sign the session ID cookie
  })
);

// Rendering index page when accessing the root URL
app.get("/", (req, res) => {
  res.render("index");
  // res.send("joooo")
});

// Set up Swagger API documentation
const specs = swaggerJsdoc(swagger);
app.use(
  "/api/documentation",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

/**
 * Define application routes
 */
configureRoutes(app);
await seedCountries();
await seedCurrencies();
await seedSuperAdmin()

// Set the folders as the location for serving static files
app.use("/storage/invoices", express.static("storage/invoices"));
app.use("/storage/uploads", express.static("storage/uploads"));
app.use("/public", express.static("public"));

// Middleware to handle 404 Not Found errors
//app.use(requestNotFoundCheck)

// Middleware to handle database-related errors
//app.use(dbErrorHandler)

// Start the server and listen on the specified port and hostname
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${port}`);
});
