/**
 * 首页视图。
 *
 * @author    姚尧 <yaogaoyu@gmail.com>
 * @copyright © 2016 yaogd.com
 * @license   GPL-3.0
 * @file      View/Index.tsx
 */

 /// <reference path="View.ts" />

namespace View {

    export class Index extends View<Core.IProps, Core.IState> {
        /**
         * 构造函数。
         */
        constructor(props: Core.IProps) {
            super(props);
            this.props.flow.sView(this);
        }

        /**
         * 渲染方法。
         */
        public render(): JSX.Element {
            return <div className="index">
                <div className="demo">Demo</div>
            </div>;
        }
    }
}
