import {Router} from 'express'
import {deleteVideo, getAllVideos,getVideoById,publishAVideo, togglePublishStatus, updateVideo} from "../controllers/video.controller"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

//Routes:

router.route("/")
.get(getAllVideos)
.post(
    upload.fields([
         {
            name:"videoFile",
            maxCount:1
         },
         {
            name:"thumbanil",
            maxCount:1
         }
        
    ]),publishAVideo
)


router.route("/:videoId") // as every api call is through url
.get(getVideoById)
.patch(upload.single("thumbnail"),updateVideo
.delete(deleteVideo)
)

router.route("/toggle/publish/:videoId").patch(togglePublishStatus)