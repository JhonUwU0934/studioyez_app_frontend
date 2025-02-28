import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptationService {

  key: string =  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI1ZDg5MjMxMjc5OTkxYjJhNGMwMjdjMGIiLCJoc2giOiIkMmEkMTMkWk53Y0cubjdRZFIybDA3S1RHd2RoLlN0QksudW5GSFVGLkZnZ0tQTGlUV2pOVEFqVy9SMm0iLCJncmFudCI6ImFjY2VzcyIsImlhdCI6MTU2OTI2ODUwMiwiZXhwIjoxNjAwODI2MTAyfQ.PQcCoF9d25bBqr1U4IhJbylpnKTYiad3NjCh_LvMfLE~9~null~undefined~434ce0149ce42606d8746bd9`;
   

  constructor() { }

  encrypt(txt: string): string {
    return CryptoJS.AES.encrypt(txt, this.key).toString();
  }

  decrypt(token: string) {
    let decData = CryptoJS.enc.Base64.parse(token).toString(CryptoJS.enc.Utf8);
    return CryptoJS.AES.decrypt(decData, this.key).toString(CryptoJS.enc.Utf8);
  }
}
