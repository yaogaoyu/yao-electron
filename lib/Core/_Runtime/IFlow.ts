/**
 * 声明（运行时）业务逻辑流接口规范。
 *
 * @author    郑煜宇 <zsnakevil@gmail.com>
 * @copyright © 2016 szen.in
 * @license   GPL-3.0
 * @file      Core/_Runtime/IFlow.ts
 */

/// <reference path="../_Ev/IEmittable.ts" />
/// <reference path="../_View/IView.ts" />

namespace Core {

    export interface IFlow extends IEmittable {
        /**
         * 设置绑定视图。
         */
        sView(view: IView): IFlow;
        /**
         * 获取绑定视图。
         */
        gView(): IView;
    }
}
