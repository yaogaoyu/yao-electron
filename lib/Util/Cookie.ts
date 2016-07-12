/**
 * 定义Cookie信息组件。
 *
 * @author    姚尧 <yaogaoyu@gmail.com>
 * @copyright © 2016 yaogd.com
 * @license   GPL-3.0
 * @file      Util/Cookie.ts
 */

namespace Util {
    export namespace Cookie {
        /**
         * 获取指定cooike。
         */
        export function gCookie(n: string): string {
            if (!n) return null;
            if (document.cookie.length > 0) {
                var start: number = document.cookie.indexOf(n + "=");
                if (start != -1) {
                    start = start + n.length + 1 ;
                    var end: number = document.cookie.indexOf(";", start);
                    if (end == -1) end = document.cookie.length;
                    return document.cookie.substring(start, end);
                }
            }
            return null;
        }

        /**
         * 写cooike。
         */
        export function sCookie(n: string, v: string, t: string): void {
            if (!n || !v || !t) return;
            document.cookie = n + "=" + v + ";domain=.dahao.de;path=/;expires=" + t;
        }
    }
}
