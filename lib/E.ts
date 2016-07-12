/**
 * 定义异常。
 *
 * @author    郑煜宇 <zsnakevil@gmail.com>
 * @copyright © 2016 szen.in
 * @license   GPL-3.0
 * @file      E.ts
 */

class E extends Error {

    public static UTIL_REMOTE_TIMEOUT: string = '远端请求超时';
    public static NO_CONTAINER: string = '未找到容器';

    /**
     * 构造函数。
     */
    constructor(message: string) {
        super();
        if ('captureStackTrace' in Error)
            Error['captureStackTrace'](this, E);
        this.name = 'BOError';
        this.message = message;
    }
}
