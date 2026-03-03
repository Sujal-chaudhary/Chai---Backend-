import {Router} from 'express'
import { verifyJWT } from '../middlewares/auth.middleware'
import { addComment, deleteComment, getVideoComments, updateComment } from '../controllers/comment.controller'

const router = Router()
router.use(verifyJWT)

//routes:
router.route("/:videoId") // make sense for video comments.
.get(getVideoComments)
.post(addComment)

router.route("/c/:commentId") //PATCH and DELETE should usually use /:commentId, not /:videoId.
.patch(updateComment)
.delete(deleteComment)






export default router