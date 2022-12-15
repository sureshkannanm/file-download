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

  async processFile(file: Express.Multer.File, name: string): Promise<string> {
    // Extract the required URL
    const urls = this.extractUrlFromFile(file);
    const uniqueUrl = [...new Set(urls)];
    console.log(`Found uniqueUrl ${uniqueUrl.length}`, name);

    if (uniqueUrl.length > 0) {
      const filePath = path.join(__dirname, '..', '..', '..', 'Video', name);
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
      }
      for (const url of uniqueUrl) {
        // Download the File ..
        await this.downloadFile(url, filePath);
      }
    }

    return new Promise((resolve) => {
      resolve('Done');
    });
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

  private async downloadFile(url: string, basePath: string): Promise<any> {
    const fileName = url.split('clips/')[1].split('?')[0];
    const filePath = path.join(basePath, `${fileName}`);
    const writer = fs.createWriteStream(filePath);
    return await this.httpService
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
