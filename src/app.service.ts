import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import fs = require('fs');
import path = require('path');
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}
  getHello(): string {
    return 'Hello World!';
  }
  /**
   *
   * @param file - JSON FIle
   * @param name - Name folder to created and saved
   * @returns
   */
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
        console.log('Before Download');
        await this.downloadFile(url, filePath);
        console.log('After Download');
      }
    }

    return 'Done';
  }

  /**
   *
   * @param file - JSON FIle
   * @returns list of URL extracted from HAR JOSN file
   */
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

  /**
   *
   * @param url - File Url to download
   * @param basePath - Base path for saving the file
   * @returns boolean
   */
  private async downloadFile(url: string, basePath: string): Promise<boolean> {
    const fileName = url.split('clips/')[1].split('?')[0];
    try {
      const filePath = path.join(basePath, `${fileName}`);
      const writer = fs.createWriteStream(filePath);

      const response = await lastValueFrom(
        this.httpService.get(url, { responseType: 'stream' }),
      );

      response?.data?.pipe(writer);

      return true;
    } catch (error) {
      console.error(`downloadFile - Error processing, ${error}`);
      return false;
    }
  }
}
