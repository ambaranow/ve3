import { SafeUrl } from '@angular/platform-browser';

/**
 * VideoObj
 */
export interface VideoObj {
  src: SafeUrl;
  file: File;
  type: string;
}
