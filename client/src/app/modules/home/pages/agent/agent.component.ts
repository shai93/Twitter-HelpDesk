import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/shared/services/api.service';
import { SocketioService } from 'src/app/shared/services/socketio.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss']
})
export class AgentComponent implements OnInit {
  showLogout: boolean = false;
  tweets:any;
  loginUser: any={
    screen_name:'',
    name:'',
    profile_image_url:''

  };

  constructor(private apiService: ApiService,
    private dataService: SocketioService,
    private activatedRoute: ActivatedRoute) {
    this.activatedRoute.queryParams.subscribe(params => {
      const oauthVerifier = params['oauth_verifier'];
      const oauthToken = params['oauth_token'];
      if (oauthToken && oauthVerifier) {
        this.saveAccessToken(oauthToken, oauthVerifier);
      }
    });
  }

  ngOnInit(): void {
    this.dataService.getTweets().subscribe(res=>{
      this.tweets = res;
    })
  }


  saveAccessToken(oauthToken: string, oauthVerifier: string) {
    this.apiService.saveAccessToken(oauthToken, oauthVerifier).subscribe(res => {
      this.loginUser.screen_name = res['screen_name']
      this.loginUser.name = res['name']
      this.loginUser.profile_image_url = res['profile_image_url']
    })
  }

  quoteTweets(){
    const quote = 'RT @' + this.tweets[0].tweetUser.screen_name + ' ' + this.tweets[0].tweets
    this.dataService.sendTweet(quote)
  }



}
