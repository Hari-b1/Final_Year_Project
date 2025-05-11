import streamerBean from './streamerBean';


class StreamerBeanImpl extends streamerBean {
    files = [];
    constructor() {
        super();
    }

    uploadFile(file) {

        this.files.push(file);
    }

    deleteFile(file) {
        this.files = this.files.filter(f => f !== file);
    }
}

export default StreamerBeanImpl;