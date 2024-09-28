import { Router } from "express";
import {verifyJWT} from '../middlewares/auth.middleware.js'
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js"


const router = Router();

router.use(verifyJWT)

router.route('/:channelId').patch(toggleSubscription)
router.route('/s/:channelId').get(getUserChannelSubscribers) //Subscribers list 
router.route('/c/:subscriberId').get(getSubscribedChannels) //channel list

export default router