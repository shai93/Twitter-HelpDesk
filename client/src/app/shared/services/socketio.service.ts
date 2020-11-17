import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  constructor(private socket: Socket) {

  }

  sendMessage(msg: string) {
    this.socket.emit("message", msg);
  }

  getTweets(){
    return this.socket
        .fromEvent("allTweets")
        .pipe(map((data) => {
          return data
        }));
    }


}
