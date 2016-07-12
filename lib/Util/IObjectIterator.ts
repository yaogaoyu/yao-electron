/**
 * 声明对象遍历函数接口规范。
 *
 * @author    郑煜宇 <zsnakevil@gmail.com>
 * @copyright © 2016 szen.in
 * @license   GPL-3.0
 * @file      Util/IObjectIterator.ts
 */

/// <reference path="IHashTable.ts" />

namespace Util {
    export interface IObjectIterator<T, U> {
        (element: T, index?: string, object?: IHashTable<T>): U;
    }
}
