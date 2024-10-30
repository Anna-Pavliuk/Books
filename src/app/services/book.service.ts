import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private apiUrl = 'https://fakerestapi.azurewebsites.net/api/v1/Books';

  constructor(private http: HttpClient) { }

  getBooks(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  addBook(book: any): Observable<any> {
    return this.http.post(this.apiUrl, book);
  }

  updateBook(id: number, book: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put(url, book);
  }
}
