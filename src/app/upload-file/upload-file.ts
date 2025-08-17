import {Component} from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {DatePipe} from '@angular/common';
import {MatListModule} from '@angular/material/list';
import { BlobUploadService } from '../blob-upload-service';

export interface Section {
  name: string;
  updated: Date;
}

@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [MatListModule, MatIconModule, MatDividerModule],
  templateUrl: './upload-file.html',
  styleUrls: ['./upload-file.css']
})
export class UploadFile {
  folders: Section[] = [
    {
      name: 'Photos',
      updated: new Date('1/1/16'),
    },
    {
      name: 'Recipes',
      updated: new Date('1/17/16'),
    },
    {
      name: 'Work',
      updated: new Date('1/28/16'),
    },
  ];
  notes: Section[] = [
    {
      name: 'Vacation Itinerary',
      updated: new Date('2/20/16'),
    },
    {
      name: 'Kitchen Remodel',
      updated: new Date('1/18/16'),
    },
  ];

  // onFileSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files?.length) {
  //     const file = input.files[0];
  //     console.log('Archivo seleccionado:', file.name);
  //   }
  // }
  
  Test() {
    console.log('HEYYY');
  }

  progress = -1;
  uploading = false;
  private abort?: AbortController;

  constructor(private uploader: BlobUploadService) {}

  async onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // 1) pedir SAS a tu API
    const sasUrl  = await this.uploader.getSasUrl(file.name).toPromise();

    console.log('URL ', sasUrl);

    // 2) subir con chunks
    this.abort = new AbortController();
    this.uploading = true;
    this.progress = 0;

    const url = sasUrl?.sasUrl;
    
    try {
      await this.uploader.uploadWithChunks(url ?? "", file, {
        blockSizeMB: 4,          // 4 MB por chunk
        concurrency: 4,          // 4 en paralelo
        contentType: file.type,
        metadata: { customerid: '304850758' },
        signal: this.abort.signal,
        onProgress: (p) => this.progress = p
      });
    } finally {
      this.uploading = false;
    }
  }

  cancel() {
    this.abort?.abort();
  }
}
