import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/shared/services/api.service';
import { SocketioService } from 'src/app/shared/services/socketio.service';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss']
})
export class AgentComponent implements OnInit {
  showLogout: boolean = false;
  logoutUrl: string = environment.logoutUrl;

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
      console.log('UI tweets ', res)
    })
  }


  saveAccessToken(oauthToken: string, oauthVerifier: string) {
    this.apiService.saveAccessToken(oauthToken, oauthVerifier).subscribe(res => {
    console.log('Token saved', res);
    })
  }



}
