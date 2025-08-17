import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UploadFile } from './upload-file/upload-file';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UploadFile],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {}
