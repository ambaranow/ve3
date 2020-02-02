import { SafeUrl } from '@angular/platform-browser';

/**
 * VideoObj
 */
export interface VideoObj {
  src: SafeUrl;
  src_: string;
  file: File;
  type: string;
}
