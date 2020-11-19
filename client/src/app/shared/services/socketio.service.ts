import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  constructor(private socket: Socket) {}

  sendTweet(msg: string):void {
    this.socket.emit("quoteTweet", msg);
  }

  getTweets(){
    return this.socket
        .fromEvent("allTweets")
        .pipe(map((data) => {
          return data
        }));
    }


}
