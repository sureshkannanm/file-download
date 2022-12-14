import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import fs = require('fs');

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}
  getHello(): string {
    return 'Hello World!';
  }

  processFile(file: Express.Multer.File): string {
    // Extract the required URL
    const urls = this.extractUrlFromFile(file);
    console.log(`Found total ${urls.length}`);
    // this.downloadFile(urls[0]);
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

  private downloadFile(url: string) {
    const fileName = url.split('clips/')[1].split('?')[0];
    console.log('this is ', fileName);
    const writer = fs.createWriteStream(`../../${fileName}.ts`);
    this.httpService
      .get(url, { responseType: 'stream' })
      .subscribe((response) => {
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
      });
  }
}
