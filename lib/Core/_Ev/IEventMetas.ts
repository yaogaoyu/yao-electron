/**
 * 声明（运行时）事件元信息接口规范。
 *
 * @author    郑煜宇 <zsnakevil@gmail.com>
 * @copyright © 2016 szen.in
 * @license   GPL-3.0
 * @file      Core/_Ev/IEventMetas.ts
 */

/// <reference path="../../Util/IHashTable.ts" />

namespace Core {

    export interface IEventMetas<T> extends Util.IHashTable<any> {
        /**
         * 触发对象。
         */
        target: T;
    }
}
