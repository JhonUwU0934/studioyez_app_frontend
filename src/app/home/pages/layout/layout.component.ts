import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ThemeService } from 'src/app/shared/services/theme-service.service';
import { HostListener } from '@angular/core';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {

  isMood!: boolean;
  isClose: boolean = false;
  data!: any;
  screenWidth!: number;
  isMobile!: boolean; 
  isOpen: boolean = false;
  public usuario: any = {};

  sub$! : Subscription;



  // get usuario(){
  //   return this.auth.usuario;
  // }

  constructor(
    public themeService: ThemeService,
    private auth:AuthService
    ) {}

  ngOnInit(): void {
   
    this.sub$ = this.auth.getUsuario.subscribe(usuario => {
      this.usuario = usuario;
    });

    this.getScreenSize();
    
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      
      const themeStatus = JSON.parse(storedTheme);

      this.isMood = themeStatus;
      this.themeService.setIsDarkMode = themeStatus;

    }else{

      const bodyContain = this.themeService.bodyContain();

      this.isMood = bodyContain;
      this.themeService.setIsDarkMode = bodyContain;  

    }
    
  }

  ngOnDestroy(): void{
    if(this.sub$) this.sub$.unsubscribe();  
  };


  toggleTheme() {

    this.themeService.toggleTheme();
    this.isMood = this.themeService.getIsDarkMode; 
    
  }

  toggleSearch() {
    this.isClose = false;
  }

  toggleClose() {
    this.isClose = !this.isClose;
  }

  logout(){
    this.auth.logout();
  }

  titleStatus():string{
    if(this.isMood){
      return 'Modo oscuro'
    }else{
      return 'Modo claro'
    }
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?: any) {
    this.screenWidth = window.innerWidth;

    if (this.screenWidth <= 1000) {    
      this.isMobile = true;
    } 
    else{
      this.isMobile = false;
    }
  }

  toggle(){
    this.isOpen = !this.isOpen;
  }

}
