/**
 * 定义（运行时）业务逻辑流组件。
 *
 * @author    郑煜宇 <zsnakevil@gmail.com>
 * @copyright © 2016 szen.in
 * @license   GPL-3.0
 * @file      Runtime/Flow.ts
 */

/// <reference path="../Core/_Runtime/IFlow.ts" />
/// <reference path="../Util/IHashTable.ts" />
/// <reference path="../Util/_iterator.ts" />

namespace Runtime {

    export class Flow implements Core.IFlow {
        /**
         * 绑定视图。
         */
        protected view: Core.IView;

        /**
         * 事件监听器集合。
         */
        private listeners: Util.IHashTable<Core.IEventListener<Core.IFlow>[]>;

        /**
         * 构造函数。
         */
        constructor() {
            this.listeners = {};
        }

        /**
         * 新增事件监听。
         */
        public addEventListener<T extends Core.IFlow>(type: string, listener: Core.IEventListener<T>): Flow {
            this.listeners[type] = this.listeners[type] || [];
            var pos: number = Util.indexOf(this.listeners[type], listener);
            if (-1 == pos)
                this.listeners[type].push(listener);
            return this;
        }

        /**
         * 取消事件监听。
         */
        public removeEventListener<T extends Core.IFlow>(type: string, listener: Core.IEventListener<T>): Flow {
            this.listeners[type] = this.listeners[type] || [];
            var pos: number = Util.indexOf(this.listeners[type], listener);
            if (-1 != pos)
                this.listeners[type].splice(pos, 1);
            return this;
        }

        /**
         * 发生事件。
         */
        public dispatchEvent<T extends Core.IFlow>(event: Core.IEvent<T>): Flow {
            Util.each(this.listeners[event.gType()] || [], (listener: Core.IEventListener<T>) => {
                listener(event);
            });
            return this;
        }

        /**
         * 获取绑定视图。
         */
        public gView(): Core.IView {
            return this.view;
        }

        /**
         * 设置绑定视图。
         */
        public sView(view: Core.IView): Core.IFlow {
            this.view = view;
            return this;
        }
    }
}
