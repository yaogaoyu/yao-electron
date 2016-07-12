/**
 * 应用入口运行时实体。
 *
 * @author    姚尧 <yaogaoyu@gmail.com>
 * @copyright © 2016 yaogd.com
 * @license   GPL-3.0
 * @file      Runtime/IndexFlow.ts
 */

/// <reference path="../Core/_Runtime/IIndexFlow.ts" />
/// <reference path="Flow.ts" />
/// <reference path="../Core/_View/IView.ts" />
/// <reference path="../View/Index.tsx" />

namespace Runtime {
    export class IndexFlow extends Flow implements Core.IIndexFlow {
        /**
         * 构造函数。
         */
        constructor(container: Element, params: Util.IHashTable<string>) {
            super();
            let view: Core.IView = React.render(<View.Index flow={this} />, container) as Core.IView;
            this.view = view;
        }
    }
}
