import fs from 'fs';
import { Readable } from 'stream';
import minioConfig from '../config/minio.js';

// Set upload bucket minio
const uploadBucket = process.env.UPLOAD_BUCKET || 'workfriar';

// Set the project location based on the environment variable
const storageType = process.env.STORAGE_TYPE;
const localStoragePath = process.env.LOCAL_STORAGE_PATH || '/storage/uploads/';

/**
 * Function to upload the file based on the environment
 * @param {File} file - The file to be uploaded
 * @param {string} folderName - The folder name to be uploaded
 * @returns {Promise<{path: string, filename: string}>} The uploaded file path and filename.
 */
async function uploadMultipleFiles(files, folderName) {
    if(!Array.isArray(files)) {
        throw new Error('Files must be an array');
    }

    const uploadPromises = files.map(async (file) => {
        return new Promise((resolve, reject) => {
            try {
                if (storageType === 'minio') {
                    uploadToMinio(file, resolve, reject);
                } else if (storageType === 's3') {
                    uploadToS3(file, resolve, reject);
                } else {
                    uploadToLocal(file, folderName, resolve, reject)
                }
            } catch (error) {
                reject(error);
            }
        });
    });

    return Promise.all(uploadPromises);
}

const uploadToLocal = (file, folderName, resolve, reject) => {
    const uploadDir = './' + localStoragePath + folderName // Custom folder path

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
    }

    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}_${file.originalname}`
    const filePath = `${uploadDir}/${uniqueFileName}`

    fs.writeFile(filePath, file.buffer, (err) => {
        if (err) {
            reject(err)
        }else{
            resolve({
                path: `${folderName}/${uniqueFileName}`,
                filename: file.originalname,
            })
        }
    })
}

const uploadToMinio = (file, resolve, reject) => {
    const fileBuffer = file.buffer || file
    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}_${file.originalname || file.name}`

    const readableStream = Readable.from(fileBuffer)

    minioConfig.putObject(
        uploadBucket,
        uniqueFileName,
        readableStream,
        function (error) {
            if (error) {
                reject(error)
            }
            const objectUrl = `${uniqueFileName}`
            resolve({
                path: objectUrl, // Include the object URL in req.uploadedFile as the path
                filename: uniqueFileName,
            })
        },
    )
}

const uploadToS3 = (file, resolve, reject) => {
    const fileBuffer = file.buffer
    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}_${file.originalname}`

    const s3 = new awsConfig.s3()
    const params = {
        Bucket: uploadBucket,
        Key: uniqueFileName,
        Body: fileBuffer,
    }

    s3.upload(params, (error) => {
        if (error) {
            reject(error)
        }
        const objectUrl = `${uniqueFileName}`
        resolve({
            path: objectUrl, // Include the object URL in req.uploadedFile as the path
            filename: uniqueFileName,
        })
    })
}

export default uploadMultipleFiles




//Sample function to utilize this util along with its Swagger documentation
/**
   * Add Project
   *
   * @swagger
   * /project/add:
   *   post:
   *     tags:
   *       - Project
   *     summary: Add project
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               client_name:
   *                 type: string
   *                 description: Enter client name
   *               project_name:
   *                 type: string
   *                 description: Enter project name
   *               description:
   *                 type: string
   *                 description: Enter project description
   *               planned_start_date:
   *                 type: string
   *                 format: date
   *                 description: Enter planned start date
   *               planned_end_date:
   *                 type: string
   *                 format: date
   *                 description: Enter planned end date
   *               project_lead:
   *                 type: string
   *                 description: Enter project lead user id
   *               billing_model:
   *                 type: string
   *                 description: Enter billing model
   *               project_logo:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *                 description: Upload multiple project logos
   *               open_for_time_entry:
   *                 type: string
   *                 description: Enter time entry status (opened/closed)
   *               status:
   *                 type: string
   *                 description: Enter project status
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
// async addProject(req, res) {
//     try {
//       const validatedData = await new AddProjectRequest(req).validate();

//       if (req.files && req.files.project_logo) {
//         // Convert single file to array if needed
//         const fileArray = Array.isArray(req.files.project_logo)
//           ? req.files.project_logo
//           : [req.files.project_logo];

//         // Upload all files using uploadMultipleFiles utility
//         try {
//           const uploadedFiles = await uploadMultipleFiles(fileArray, 'project-logos');
          
//           // Store all file paths in an array
//           validatedData.project_logo = uploadedFiles.map(file => file.path);
//         } catch (uploadError) {
//           throw new Error(`File upload failed: ${uploadError.message}`);
//         }
//       }

//       const projectDetails = await projectRepo.addProject(validatedData);

//       if (projectDetails) {
//         const projectData = await ProjectResponse.format(projectDetails);

//         return res.status(200).json({
//           status: true,
//           message: "Project added successfully.",
//           data: projectData,
//         });
//       } else {
//         return res.status(422).json({
//           status: false,
//           message: "Failed to add project.",
//           data: [],
//         });
//       }
//     } catch (error) {
//       if (error instanceof CustomValidationError) {
//         return res.status(422).json({
//           status: false,
//           message: "Validation failed.",
//           errors: error.errors,
//         });
//       }
//       return res.status(500).json({
//         status: false,
//         message: "Failed to add project.",
//         errors: error.message || error,
//       });
//     }
//   }
//This should be done in the request class
// constructor(req) {
//     // Safely handle project_logo files
//     let project_logos = [];
//     if (req.files && req.files.project_logo) {
//       project_logos = Array.isArray(req.files.project_logo) 
//         ? req.files.project_logo 
//         : [req.files.project_logo];
//     }

//     this.data = {
//       client_name: req.body.client_name,
//       project_name: req.body.project_name,
//       description: req.body.description,
//       planned_start_date: req.body.planned_start_date,
//       planned_end_date: req.body.planned_end_date,
//       actual_start_date: req.body.actual_start_date,
//       actual_end_date: req.body.actual_end_date,
//     //   project_lead: req.body.project_lead,
//       billing_model: req.body.billing_model,
//       project_logo: project_logos,
//       open_for_time_entry: req.body.open_for_time_entry,
//       status: req.body.status,
//     };
//   }
//Similarly in the project response this is how it should be implemented
// project_logo: Array.isArray(project.project_logo)
//         ? project.project_logo.map(logo => generateFileUrl(logo))
//         : project.project_logo ? [generateFileUrl(project.project_logo)] : [],