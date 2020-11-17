import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  getRedirectUrl() {
    return this.http.get(`${environment.apiBaseUrl}/v1/auth/connect`)
  }

  saveAccessToken(oauthToken: string, oauthVerifier: string) {
    return this.http.get(`${environment.apiBaseUrl}/v1/auth/saveAccessTokens?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`)
  }

}
