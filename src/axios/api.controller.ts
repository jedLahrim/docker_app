import { Controller } from '@nestjs/common';
import { ApiService } from './api.service';
import { HttpService } from '@nestjs/axios';

@Controller('axios')
export class ApiController {
  constructor(private apiService: ApiService, private http: HttpService) {}
}
