import { Directive, ElementRef, Input } from '@angular/core';
import ImgCache from 'imgcache.js';


@Directive({
  selector: '[image-cache]'
})
export class ImageCacheDirective {
  constructor (
    private el: ElementRef
  ) {
    // init
  }
  
  ngAfterViewInit() {
    this.el.nativeElement.crossOrigin = "Anonymous"; // CORS enabling

    ImgCache.isCached(this.el.nativeElement.src, (path: string, success: any) => {
      console.log('path - '+ path);
      console.log('success - '+ success);

      if (success) {
        // already cached
        console.log('already cached so using cached');

        ImgCache.useCachedFile(this.el.nativeElement);
      } else {
        // not there, need to cache the image
        console.log('not there, need to cache the image - ' + this.el.nativeElement.src);

        ImgCache.cacheFile(this.el.nativeElement.src, () => {
          console.log('cached file');

          // ImgCache.useCachedFile(el.nativeElement);
        });
      }
    });
  }
}