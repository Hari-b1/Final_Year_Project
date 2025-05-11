import StreamerBeanImpl from '../models/streamer/streamerBeanImpl.js';
import auth from '../middlewares/auth.js';

export default function uploadController(req, res) {
    const { file } = req;
    const { userId } = req.user;
    const streamer = new StreamerBeanImpl();


}


function encryptFile(file) {

}