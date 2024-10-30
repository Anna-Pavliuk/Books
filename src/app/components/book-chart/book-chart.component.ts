import { Component, OnInit, ViewChild } from '@angular/core';
import { BookService } from '../../services/book.service';
import { ChartData, ChartType, Chart, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

Chart.register(...registerables);

@Component({
  selector: 'app-book-chart',
  templateUrl: './book-chart.component.html',
  styleUrl: './book-chart.component.scss'
})
export class BookChartComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public barChartOptions = {
    responsive: true,
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Number of Books' }
    ]
  };

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.bookService.getBooks().subscribe(books => {
      this.prepareChartData(books);
      this.chart?.update();
    });
  }

  private prepareChartData(books: { publishDate: string }[]): void {
    const booksByYear = books.reduce((acc: { [key: number]: number }, book) => {
      const year = new Date(book.publishDate).getFullYear();
      if (acc[year]) {
        acc[year]++;
      } else {
        acc[year] = 1;
      }
      return acc;
    }, {} as { [key: number]: number });
  
    this.barChartData.labels = Object.keys(booksByYear);
    this.barChartData.datasets[0].data = Object.values(booksByYear);
  }
}
