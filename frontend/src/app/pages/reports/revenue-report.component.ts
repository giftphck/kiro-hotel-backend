import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { RevenueReport, RevenueDetail } from '../../models/report.model';

type PeriodType = 'daily' | 'monthly' | 'yearly';

interface ChartDataPoint {
  label: string;
  value: number;
}

@Component({
  selector: 'app-revenue-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revenue-report.component.html',
  styleUrls: ['./revenue-report.component.scss']
})
export class RevenueReportComponent implements OnInit {
  private reportService = inject(ReportService);

  // Signals
  selectedPeriod = signal<PeriodType>('daily');
  report = signal<RevenueReport | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Date inputs
  selectedDate = signal<string>('');
  selectedMonth = signal<number>(new Date().getMonth() + 1);
  selectedYear = signal<number>(new Date().getFullYear());

  // Chart data
  revenueChartData = computed(() => this.prepareRevenueChartData());
  bookingChartData = computed(() => this.prepareBookingChartData());

  ngOnInit(): void {
    // Initialize with today's date
    const today = new Date();
    this.selectedDate.set(this.formatDateForInput(today));
    this.selectedMonth.set(today.getMonth() + 1);
    this.selectedYear.set(today.getFullYear());
    
    // Load initial report
    this.loadReport();
  }

  selectPeriod(period: PeriodType): void {
    this.selectedPeriod.set(period);
    this.error.set(null);
    this.report.set(null);
  }

  loadReport(): void {
    this.loading.set(true);
    this.error.set(null);

    const period = this.selectedPeriod();

    if (period === 'daily') {
      const dateStr = this.selectedDate();
      if (!dateStr) {
        this.error.set('กรุณาเลือกวันที่');
        this.loading.set(false);
        return;
      }
      
      const date = new Date(dateStr);
      this.reportService.getDailyRevenue(date).subscribe({
        next: (report: RevenueReport) => {
          this.report.set(report);
          this.loading.set(false);
        },
        error: (err: any) => {
          this.error.set('ไม่สามารถโหลดรายงานได้');
          this.loading.set(false);
          console.error('Error loading daily report:', err);
        }
      });
    } else if (period === 'monthly') {
      const year = this.selectedYear();
      const month = this.selectedMonth();
      
      this.reportService.getMonthlyRevenue(year, month).subscribe({
        next: (report: RevenueReport) => {
          this.report.set(report);
          this.loading.set(false);
        },
        error: (err: any) => {
          this.error.set('ไม่สามารถโหลดรายงานได้');
          this.loading.set(false);
          console.error('Error loading monthly report:', err);
        }
      });
    } else if (period === 'yearly') {
      const year = this.selectedYear();
      
      this.reportService.getYearlyRevenue(year).subscribe({
        next: (report: RevenueReport) => {
          this.report.set(report);
          this.loading.set(false);
        },
        error: (err: any) => {
          this.error.set('ไม่สามารถโหลดรายงานได้');
          this.loading.set(false);
          console.error('Error loading yearly report:', err);
        }
      });
    }
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' ฿';
  }

  get months(): { value: number; label: string }[] {
    return [
      { value: 1, label: 'มกราคม' },
      { value: 2, label: 'กุมภาพันธ์' },
      { value: 3, label: 'มีนาคม' },
      { value: 4, label: 'เมษายน' },
      { value: 5, label: 'พฤษภาคม' },
      { value: 6, label: 'มิถุนายน' },
      { value: 7, label: 'กรกฎาคม' },
      { value: 8, label: 'สิงหาคม' },
      { value: 9, label: 'กันยายน' },
      { value: 10, label: 'ตุลาคม' },
      { value: 11, label: 'พฤศจิกายน' },
      { value: 12, label: 'ธันวาคม' }
    ];
  }

  get years(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  }

  private prepareRevenueChartData(): ChartDataPoint[] {
    const report = this.report();
    if (!report || !report.details || report.details.length === 0) {
      return [];
    }

    return report.details.map(detail => ({
      label: this.formatChartLabel(detail.date),
      value: detail.revenue
    }));
  }

  private prepareBookingChartData(): ChartDataPoint[] {
    const report = this.report();
    if (!report || !report.details || report.details.length === 0) {
      return [];
    }

    return report.details.map(detail => ({
      label: this.formatChartLabel(detail.date),
      value: detail.bookings
    }));
  }

  private formatChartLabel(date: Date): string {
    const d = new Date(date);
    const period = this.selectedPeriod();
    
    if (period === 'daily') {
      return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    } else if (period === 'monthly') {
      return d.toLocaleDateString('th-TH', { month: 'short' });
    } else {
      return d.toLocaleDateString('th-TH', { year: 'numeric' });
    }
  }

  getMaxValue(data: ChartDataPoint[]): number {
    if (data.length === 0) return 0;
    const max = Math.max(...data.map(d => d.value));
    return Math.ceil(max * 1.1); // Add 10% padding
  }

  getBarHeight(value: number, maxValue: number): number {
    if (maxValue === 0) return 0;
    return (value / maxValue) * 100;
  }

  getChartPoints(data: ChartDataPoint[]): string {
    if (data.length === 0) return '';
    
    const maxValue = this.getMaxValue(data);
    const width = 100;
    const height = 100;
    const stepX = width / (data.length - 1 || 1);
    
    const points = data.map((point, index) => {
      const x = index * stepX;
      const y = height - (point.value / maxValue * height);
      return `${x},${y}`;
    });
    
    return points.join(' ');
  }
}
