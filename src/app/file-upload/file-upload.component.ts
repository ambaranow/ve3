import {
  Component,
  Output,
  EventEmitter,
  forwardRef,
  Input
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ReadFile } from 'ngx-file-helpers';

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

  @Input() title: string;

  @Input() acceptType: string;
  @Input() readModeType: string;

  @Output() fileUploaded = new EventEmitter<ReadFile>();

  constructor() {}

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

  /**
   * Вызывается при добавлении файла
   * @param $event - event
   */
  onFilePicked($event: ReadFile) {
    this.fileUploaded.emit($event);
    this.pickedFile = $event;
    this.file = $event.underlyingFile;
    this.propagateChange(this.file);
  }

}
