import { SafeUrl } from '@angular/platform-browser';

/**
 * VideoObj
 */
export interface VideoObj {
  src: SafeUrl;
  file: File;
  type: string;
  // constructor(data: any) {
  //   this.src = data.src;
  //   this.file = data.file;
  //   this.type = data.type;
  // }
}
