import UserBean from './users/UserBean.js';

class ViewerBean extends UserBean {
    constructor() {
        super();
        this._viewerId = this.userId;
        this._viewername= this.username;
        this._viewerEmail = this.userEmail;
    }
}

export default ViewerBean;