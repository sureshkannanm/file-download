import { Injectable } from '@nestjs/common';
import fs = require('fs');

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  processFile(file: Express.Multer.File): string {
    // Extract the required URL
    const urls = this.extractUrlFromFile(file);
    console.log(`Found total ${urls.length}`);
    // Download the File ..
    return 'Hello World!';
  }

  private extractUrlFromFile(file: Express.Multer.File): string[] {
    const result = [];
    try {
      const data: any = JSON.parse(file.buffer.toString());

      if (data) {
        data?.log?.entries?.forEach((element) => {
          if (element?.request.url.includes(process.env.URL_STRING))
            result.push(element?.request.url);
        });
      }

      return result;
    } catch (error) {
      console.error(`extractUrlFromFile - Error processing, ${error}`);
    }
  }
}
