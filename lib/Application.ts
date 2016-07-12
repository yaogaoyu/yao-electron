/**
 * 面板入口类。
 *
 * @author    姚尧 <yaogaoyu@gmail.com>
 * @copyright © 2016 yaogd.com
 * @license   GPL-3.0
 * @file      Application.ts
 */

/// <reference path="Util/IHashTable.ts" />
/// <reference path="Runtime/Runtime.ts" />

class Application {
    public static version: string = "${VERSION}";
    private runtime: Runtime.Runtime;

    /**
     * 构造函数。
     */
    constructor(params?: Util.IHashTable<string>) {
        this.runtime = new Runtime.Runtime(params, this);
    }
}
