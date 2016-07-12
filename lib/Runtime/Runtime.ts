/**
 * 应用运行时实体。
 *
 * @author    姚尧 <yaogaoyu@gmail.com>
 * @copyright © 2016 yaogd.com
 * @license   GPL-3.0
 * @file      Runtime/Runtime.ts
 */

/// <reference path="../../include/tsd.d.ts" />
/// <reference path="../Application.ts" />
/// <reference path="IndexFlow.tsx" />
/// <reference path="../E.ts" />

namespace Runtime {
    export class Runtime {
        private indexFlow: Core.IIndexFlow;
        private app: Application;
        /**
         * 构造函数。
         */
        constructor(params: Util.IHashTable<string>, app: Application) {
            var container: Element = document.querySelector(".main");
            if (!container) {
                var err: E = new E(E.NO_CONTAINER);
                throw err;
            }
            this.app = app;
            this.indexFlow = new IndexFlow(container, params);
        }
    }
}
