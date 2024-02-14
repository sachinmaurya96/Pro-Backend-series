import { Subscription } from '../models/subscription.model.js';
import { ApiResponse } from '../utills/ApiResponse.js';
import { asyncHandler } from '../utills/AsyncHandler.js';
import { ApiError } from '../utills/apiError.js';

const subscribeAchannel = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  try {
    const suscriber = await Subscription.create({
      suscriber: req.user?._id,
      channel: channelId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, suscriber, 'channel subscribed'));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
const unsubscribeAChannel = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  try {
    await Subscription.findOneAndDelete({
      subscriber: req.user?._id,
      channel: channelId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'channel unsubcribed'));
  } catch (error) {
    throw new ApiError(400, 'channel unsubcribed failed');
  }
});

export { subscribeAchannel, unsubscribeAChannel };
