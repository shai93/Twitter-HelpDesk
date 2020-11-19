import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  getRedirectUrl() {
    console.log('url ', `${environment.apiBaseUrl}/auth/connect`)
    return this.http.get(`${environment.apiBaseUrl}/auth/connect`)
  }

  saveAccessToken(oauthToken: string, oauthVerifier: string) {
    return this.http.get(`${environment.apiBaseUrl}/auth/saveAccessTokens?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`)
  }

}
