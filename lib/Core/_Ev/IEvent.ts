/**
 * 声明（运行时）事件接口规范。
 *
 * @author    郑煜宇 <zsnakevil@gmail.com>
 * @copyright © 2016 szen.in
 * @license   GPL-3.0
 * @file      Core/_Ev/IEvent.ts
 */

/// <reference path="IEventMetas.ts" />

namespace Core {
    export interface IEvent<T> {
        /**
         * 事件触发对象。
         */
        target: T;

        // constructor(metas: IEventMetas<T>): IEvent<T>;

        /**
         * 获取类型。
         */
        gType(): string;
    }
}
