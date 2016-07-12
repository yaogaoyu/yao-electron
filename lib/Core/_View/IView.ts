/**
 * 声明视图规范。
 *
 * @author    郑煜宇 <zsnakevil@gmail.com>
 * @copyright © 2016 szen.in
 * @license   GPL-3.0
 * @file      Core/_View/IView.ts
 */

/// <reference path="../../../include/react/react-global.d.ts" />
/// <reference path="IState.ts" />
/// <reference path="IProps.ts" />

namespace Core {
    export interface IView extends React.Component<IProps, IState> {
    }
}
