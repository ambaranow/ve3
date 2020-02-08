import {
  Component,
  Output,
  EventEmitter,
  forwardRef,
  Input,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ReadFile, FilePickerDirective } from 'ngx-file-helpers';
import { ViewService } from '@services/view.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FileUploadComponent),
    multi: true
  }],
})
export class FileUploadComponent implements ControlValueAccessor {
  private disabled: boolean;
  private file: File;
  private pickedFile: ReadFile;
  private propagateChange: (value) => void;
  private onTouched: () => void;
  public fileUploadProgress = false;

  @Input() title: string;

  @Input() acceptType: string;
  @Input() readModeType: string;

  @Output() fileUploadStart = new EventEmitter<any>();
  @Output() fileUploaded = new EventEmitter<ReadFile>();


  constructor(
    private viewService: ViewService,
    ) {}

  @ViewChild('veFilePicker', {static: false})
  private filePicker: FilePickerDirective;

  // the method set in registerOnChange, it is just
  // a placeholder for a method that takes one parameter,
  // we use it to emit changes back to the form

  // this is the initial value set to the component
  writeValue(obj: any): void {

  }
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }


  onReadStart() {
    // console.log('onReadStart')
    this.fileUploadStart.emit();
    this.viewService.loaderOn();
    this.fileUploadProgress = true;
  }
  /**
   * Вызывается при добавлении файла
   * @param $event - event
   */
  onFilePicked($event: ReadFile) {
    // console.log('onFilePicked')
    this.viewService.loaderOff();
    this.fileUploaded.emit($event);
    this.pickedFile = $event;
    this.file = $event.underlyingFile;
    this.propagateChange(this.file);
    this.fileUploadProgress = false;
  }
  onReadEnd() {
    // console.log('onReadEnd')
    this.filePicker.reset();
  }
}
