import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment} from '../../environments/environment'

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('interceptor called');

    if (req.url.indexOf('/upload') !== -1) {
        console.log('interceptor called upload');
        // return next.handle(
        //     req.clone({
        //       headers: req.headers.set('Access-Control-Allow-Headers', 'Content-Type,X-Amz-Date,Authorization,X-Api-Key ')
        //           .set('Access-Control-Allow-Origin',environment.CLIENT_URL)
        //           .set('Access-Control-Allow-Methods','DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT')
        //          // .set('Host','um34zvea5c.execute-api.us-east-1.amazonaws.com')
        //     })
        //   );
        return next.handle(req);
      }
     else if (req.url.indexOf('/download') !== -1) {
        console.log('interceptor called download');
        // return next.handle(
        //     req.clone({
        //       headers: req.headers.set('Access-Control-Allow-Headers', 'Content-Type,X-Amz-Date,Authorization,X-Api-Key ')
        //           .set('Access-Control-Allow-Origin',environment.CLIENT_URL)
        //           .set('Access-Control-Allow-Methods','DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT')
        //           .set('Content-Type', 'application/octect-stream')
        //           .set('ResponseType', 'application/json')
        //     })
        //   );
        return next.handle(req);
      }
    else if(req.url.indexOf('/getAllApplications')!==-1)
    {
        return next.handle(req);
    }
    else{ 
        console.log('interceptor called else block');
        // req = req.clone({
        //     headers: req.headers.set('Access-Control-Allow-Headers', 'Content-Type,X-Amz-Date,Authorization,X-Api-Key ')
        //         .set('Access-Control-Allow-Origin',environment.CLIENT_URL)
        //         .set('Access-Control-Allow-Methods','DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT')
        //   })
        console.log("request",req);
        return next.handle(req);
    }
  }
}