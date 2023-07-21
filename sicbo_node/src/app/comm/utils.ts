import { Config, Singleton } from '@midwayjs/core';
import axios from 'axios';

@Singleton()
export class Utils {
  @Config('rustUrl')
  private rustUrl;

  // 转换fil的金额
  public async sendRequest(path, request) {
    const config = {
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'Referrer-Policy': 'no-referrer',
      },
    };
    const baseURL = this.rustUrl;
    const url = `${baseURL}${path}`;
    console.log(url, request);
    const response = await axios.post(url, request, config);
    if (!(response.statusText = '200')) {
      throw new Error(`Error sending request: ${response.statusText}`);
    }
    return response.data;
  }

  public async fetch(url = '/') {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error('Error fetching data.');
    }
  }
}

export default Utils;
