import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ProductsListComponent } from './products-list.component';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../models/product';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ProductsListComponent', () => {
  let component: ProductsListComponent;
  let fixture: ComponentFixture<ProductsListComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let debugElement: DebugElement;

  const mockProducts: Product[] = [
    { id: 1, name: 'Laptop', price: 1000, stock: 5 },
    { id: 2, name: 'Mouse', price: 25, stock: 10 },
    { id: 3, name: 'Teclado', price: 75, stock: 8 }
  ];

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getProducts']);

    await TestBed.configureTestingModule({
      imports: [
        ProductsListComponent,
        CommonModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ProductService, useValue: productServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsListComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.products).toEqual([]);
    expect(component.page).toBe(1);
    expect(component.size).toBe(5);
  });

  describe('ngOnInit', () => {
    it('should call load method on init', () => {
      spyOn(component, 'load');
      productService.getProducts.and.returnValue(of(mockProducts));

      component.ngOnInit();

      expect(component.load).toHaveBeenCalled();
    });
  });

  describe('load method', () => {
    it('should load products successfully', () => {
      productService.getProducts.and.returnValue(of(mockProducts));

      component.load();

      expect(productService.getProducts).toHaveBeenCalledWith(1, 5);
      expect(component.products).toEqual(mockProducts);
    });

    it('should call service with current page and size', () => {
      component.page = 3;
      component.size = 10;
      productService.getProducts.and.returnValue(of(mockProducts));

      component.load();

      expect(productService.getProducts).toHaveBeenCalledWith(3, 10);
    });

    it('should handle empty response', () => {
      productService.getProducts.and.returnValue(of([]));

      component.load();

      expect(component.products).toEqual([]);
    });
  });

  describe('next method', () => {
    beforeEach(() => {
      productService.getProducts.and.returnValue(of(mockProducts));
    });

    it('should increment page and reload data', () => {
      component.page = 1;
      spyOn(component, 'load');

      component.next();

      expect(component.page).toBe(2);
      expect(component.load).toHaveBeenCalled();
    });

    it('should work from any page number', () => {
      component.page = 5;
      spyOn(component, 'load');

      component.next();

      expect(component.page).toBe(6);
      expect(component.load).toHaveBeenCalled();
    });
  });

  describe('prev method', () => {
    beforeEach(() => {
      productService.getProducts.and.returnValue(of(mockProducts));
    });

    it('should decrement page and reload data when page > 1', () => {
      component.page = 3;
      spyOn(component, 'load');

      component.prev();

      expect(component.page).toBe(2);
      expect(component.load).toHaveBeenCalled();
    });

    it('should not decrement page when page is 1', () => {
      component.page = 1;
      spyOn(component, 'load');

      component.prev();

      expect(component.page).toBe(1);
      expect(component.load).not.toHaveBeenCalled();
    });

    it('should work correctly from page 2 to page 1', () => {
      component.page = 2;
      spyOn(component, 'load');

      component.prev();

      expect(component.page).toBe(1);
      expect(component.load).toHaveBeenCalled();
    });
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      productService.getProducts.and.returnValue(of(mockProducts));
      component.products = mockProducts;
      fixture.detectChanges();
    });

    it('should render table headers correctly', () => {
      const headers = debugElement.queryAll(By.css('th'));

      expect(headers.length).toBe(4);
      expect(headers[0].nativeElement.textContent.trim()).toBe('ID');
      expect(headers[1].nativeElement.textContent.trim()).toBe('Nombre');
      expect(headers[2].nativeElement.textContent.trim()).toBe('Precio');
      expect(headers[3].nativeElement.textContent.trim()).toBe('Stock');
    });

    it('should render products in table rows', () => {
      const rows = debugElement.queryAll(By.css('tbody tr'));

      expect(rows.length).toBe(3);

      // Check first product
      const firstRowCells = rows[0].queryAll(By.css('td'));
      expect(firstRowCells[0].nativeElement.textContent.trim()).toBe('1');
      expect(firstRowCells[1].nativeElement.textContent.trim()).toBe('Laptop');
      expect(firstRowCells[2].nativeElement.textContent.trim()).toBe('1000');
      expect(firstRowCells[3].nativeElement.textContent.trim()).toBe('5');
    });

    it('should display current page number', () => {
      component.page = 3;
      fixture.detectChanges();

      const pageSpan = debugElement.query(By.css('span'));
      expect(pageSpan.nativeElement.textContent.trim()).toBe('Página 3');
    });

    it('should render navigation buttons', () => {
      const buttons = debugElement.queryAll(By.css('button'));

      expect(buttons.length).toBe(2);
      expect(buttons[0].nativeElement.textContent.trim()).toBe('Anterior');
      expect(buttons[1].nativeElement.textContent.trim()).toBe('Siguiente');
    });

    it('should call prev() when clicking Anterior button', () => {
      spyOn(component, 'prev');

      const prevButton = debugElement.query(By.css('button:first-child'));
      prevButton.nativeElement.click();

      expect(component.prev).toHaveBeenCalled();
    });

    it('should call next() when clicking Siguiente button', () => {
      spyOn(component, 'next');

      const nextButton = debugElement.query(By.css('button:last-child'));
      nextButton.nativeElement.click();

      expect(component.next).toHaveBeenCalled();
    });
  });

  describe('Integration tests', () => {
    it('should load initial products on component initialization', () => {
      productService.getProducts.and.returnValue(of(mockProducts));

      fixture.detectChanges(); // Triggers ngOnInit

      expect(productService.getProducts).toHaveBeenCalledWith(1, 5);
      expect(component.products).toEqual(mockProducts);
    });

    it('should update display when navigating to next page', () => {
      const secondPageProducts: Product[] = [
        { id: 4, name: 'Monitor', price: 300, stock: 3 }
      ];

      productService.getProducts.and.returnValue(of(secondPageProducts));
      component.next();

      expect(component.page).toBe(2);
      expect(productService.getProducts).toHaveBeenCalledWith(2, 5);
      expect(component.products).toEqual(secondPageProducts);
    });

    it('should handle empty product list', () => {
      productService.getProducts.and.returnValue(of([]));
      component.load();
      fixture.detectChanges();

      const rows = debugElement.queryAll(By.css('tbody tr'));
      expect(rows.length).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple rapid pagination clicks', () => {
      productService.getProducts.and.returnValue(of(mockProducts));

      component.next();
      component.next();
      component.prev();

      expect(component.page).toBe(2);
      expect(productService.getProducts).toHaveBeenCalledTimes(3);
    });


  });
});
