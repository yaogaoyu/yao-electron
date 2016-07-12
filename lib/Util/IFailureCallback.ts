/**
 * 声明失败回调函数接口规范。
 *
 * @author    郑煜宇 <zsnakevil@gmail.com>
 * @copyright © 2016 szen.in
 * @license   GPL-3.0
 * @file      Util/IFailureCallback.ts
 */

namespace Util {
    export interface IFailureCallback {
        (error: Error, status?: number): void;
    }
}
