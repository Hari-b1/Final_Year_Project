import UserBeanImpl from '../users/UserBeanImpl.js';

class Streamer extends UserBeanImpl {
    _streamId;
    _streamname;


    constructor() {
        super();
        this._streamId = null;
        this._streamname = null;
    }

    get streamId() {
        return this._streamId;
    }
    set streamId(id) {
        this._streamId = id;
    }

    get streamname() {
        return this._streamname;
    }
    set streamname(name) {
        this._streamname = name;
    }
    toString() {
        return `Streamer { streamId: ${this._streamId}, streamname: ${this._streamname} }`;
    }


}

export default Streamer;