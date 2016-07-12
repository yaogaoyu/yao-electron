/**
 * 声明成功回调函数接口规范。
 *
 * @author    郑煜宇 <zsnakevil@gmail.com>
 * @copyright © 2016 szen.in
 * @license   GPL-3.0
 * @file      Util/ISuccessCallback.ts
 */

/// <reference path="IHashTable.ts" />

namespace Util {
    export interface ISuccessCallback<T> {
        (data: IHashTable<T>): void;
    }
}
