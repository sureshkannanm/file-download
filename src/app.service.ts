import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import fs = require('fs');
import path = require('path');

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
    const uniqueUrl = [...new Set(urls)];
    console.log(`Found uniqueUrl ${uniqueUrl.length}`);
    if (uniqueUrl.length > 0) {
      uniqueUrl.forEach((url) => {
        this.downloadFile(url);
      });
    }

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
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'Video',
      `${fileName}`,
    );
    const writer = fs.createWriteStream(filePath);
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
