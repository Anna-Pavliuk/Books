import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-book-dialog',
  templateUrl: './book-dialog.component.html',
  styleUrl: './book-dialog.component.scss'
})
export class BookDialogComponent {
  bookForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BookDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    
    this.bookForm = this.fb.group({
      title: [data?.title || '', Validators.required],
      description: [data?.description || '', Validators.required],
      publishDate: [data?.publishDate || '', Validators.required],
      pageCount: [data?.pageCount || '', [Validators.required, Validators.min(1)]]
    });
  }

  save(): void {
    if (this.bookForm.valid) {
      this.dialogRef.close(this.bookForm.value);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
