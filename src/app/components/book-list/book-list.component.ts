import { Component, ViewChild } from '@angular/core';
import { BookService } from '../../services/book.service';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { startOfMonth, startOfYear } from 'date-fns';
import { MatDialog } from '@angular/material/dialog';
import { BookDialogComponent } from '../book-dialog/book-dialog.component';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface BookElement {
  id: number;
  title: string;
  description: string;
  pageCount: number;
  excerpt: string;
  publishDate: Date;
}

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
})
export class BookListComponent {
  displayedColumns: string[] = [
    'id',
    'title',
    'description',
    'pageCount',
    'publishDate',
    'excerpt',
    'actions'
  ];
  clickedRows = new Set<BookElement>();

  books: any[] = [];
  filteredBooks: any;
  searchTerm: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private bookService: BookService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe((data: any) => {
      this.books = data;
      this.filteredBooks = new MatTableDataSource(data) || [];

      this.filteredBooks.paginator = this.paginator;
      this.filteredBooks.sort = this.sort;

      const sortState: Sort = { active: '', direction: '' };
      this.sort.active = sortState.active;
      this.sort.direction = sortState.direction;
      this.sort.sortChange.emit(sortState);
    });
  }

  filterBooks(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredBooks = this.books.filter((book) =>
      book.title.toLowerCase().includes(term)
    );

    if (this.filteredBooks.paginator) {
      this.filteredBooks.paginator.firstPage();
    }
  }
  filterBooksByDate(): void {
    if (this.startDate && this.endDate) {
      this.filteredBooks = this.books.filter(book => {
        const publishDate = new Date(book.publishDate);
        return publishDate >= this.startDate! && publishDate <= this.endDate!;
      });
    } else {
      this.filteredBooks = this.books;
    }
  }

  filterByThisMonth(): void {
    const now = new Date();
    this.startDate = startOfMonth(now);
    this.endDate = now;
    this.filterBooksByDate();
  }

  filterByThisYear(): void {
    const now = new Date();
    this.startDate = startOfYear(now);
    this.endDate = now;
    this.filterBooksByDate();
  }

  addBook(): void {
    const dialogRef = this.dialog.open(BookDialogComponent, {
      width: '400px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.books.push(result);
      }
    });
  }

  editBook(book: any): void {
    const dialogRef = this.dialog.open(BookDialogComponent, {
      width: '400px',
      data: { ...book }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && book.id) {
        this.bookService.updateBook(book.id, result).subscribe(updatedBook => {
          const index = this.books.findIndex(b => b.id === book.id);
          if (index !== -1) {
            this.books[index] = updatedBook;
          }
        });
      }
    });
  }


  exportToExcel(): void {
    const dataToExport = Array.isArray(this.filteredBooks) && this.filteredBooks.length 
      ? this.filteredBooks 
      : this.books;
    
    if (Array.isArray(dataToExport)) {
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Books');
      XLSX.writeFile(wb, 'Books_List.xlsx');
    }
  }

  exportToPDF(): void {
    const dataToExport = Array.isArray(this.filteredBooks) && this.filteredBooks.length 
      ? this.filteredBooks 
      : this.books;

    if (Array.isArray(dataToExport)) {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(18);
      doc.text('Books List', 10, 10);
      doc.setFontSize(12);

      (doc as any).autoTable({
        head: [['Title', 'Description', 'Page count', 'Publish date']],
        body: dataToExport.map(book => [
          book.title,
          book.description,
          new Date(book.publishDate).toLocaleDateString(),
          book.pageCount
        ]),
        startY: 20,
        styles: { fontSize: 10, cellPadding: 3, font: 'helvetica' },
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 60 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 }
        },
        margin: { top: 20 }
      });

      doc.save('Books_List.pdf');
    }
  }
}
