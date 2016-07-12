/**
 * 声明（运行时）事件监听函数接口规范。
 *
 * @author    郑煜宇 <zsnakevil@gmail.com>
 * @copyright © 2016 szen.in
 * @license   GPL-3.0
 * @file      Core/_Ev/IEventListener.ts
 */

/// <reference path="IEvent.ts" />

namespace Core {
    export interface IEventListener<T> {
        (event: IEvent<T>): void;
    }
}
