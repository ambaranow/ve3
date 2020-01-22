import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  constructor() { }

  /**
   * Convert time string to milliseconds number
   * @param a time string HH:MM:SS.mss
   * @param b undefined
   */
  timeString2ms(a: any, b?: number) {
    return a = (typeof a === 'string') ? a.split('.') : a,
     a[1] = a[1] ? a[1] + '000' : '',
     a[1] = a[1].slice(0, 3),
     b = a[1] * 1 || 0,
     a = a[0].split(':'),
     b + (a[2] ? a[0] * 3600 + a[1] * 60 + a[2] * 1 : a[1] ? a[0] * 60 + a[1] * 1 : a[0] * 1) * 1e3;
   }

  /**
   * Convert milliseconds to time string
   * @param ms number
   */
  ms2TimeString(s: number) {
    // Pad to 2 or 3 digits, default is 2
    function pad(n: number, z?: number) {
      z = z || 2;
      return ('00' + n).slice(-z);
    }
    const ms = s % 1000;
    s = (s - ms) / 1000;
    const secs = s % 60;
    s = (s - secs) / 60;
    const mins = s % 60;
    const hrs = (s - mins) / 60;
    return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
  }

   /**
    * Convert string pairs to object
    * @param mess a=b c=d ... y=z
    */
  parseMessageToJson(mess: string) {
    const matches = mess.match(/(\w*=)([^=]+)[\s|$]/gmi);
    const res = {};
    if (!matches) {
      return res;
    }
    matches.forEach((pair: string) => {
      const kv = pair.split('=');
      res[kv[0]] = kv[1].trim();
    });
    return res;
  }

  getTargetFileName(n: string, id: string) {
    const extensionRegExp = /\.([0-9a-z]{1,5})$/i;
    const extension = n.match(extensionRegExp)[1];
    return 'v_' + id + '.' + extension.toLowerCase();
  }

  getFps(fileinfo: { time: any; }, frames: number) {
    let res = 1;
    const durSeconds = Math.floor(this.timeString2ms(fileinfo.time) / 1000);
    if (!isNaN(durSeconds)) {
      res = 1 / (durSeconds / frames);
      res = Math.floor(res * 100000) / 100000;
    }
    return res;
  }
}
